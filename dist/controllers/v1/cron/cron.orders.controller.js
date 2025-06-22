"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronOrdersController = void 0;
const constants_util_1 = require("../../../utils/constants.util");
const response_entity_1 = require("../../../entities/core/response.entity");
const master_controller_1 = __importDefault(require("../../master.controller"));
const dotenv_1 = __importDefault(require("dotenv"));
const cron_job_model_1 = require("../../../models/v1/cron/cron.job.model");
const postgres_database_1 = __importDefault(require("../../../database/postgres.database"));
const orders_manager_1 = require("../../../managers/orders.manager");
dotenv_1.default.config();
class CronOrdersController extends master_controller_1.default {
    constructor() {
        super();
        this.cronJobsModel = new cron_job_model_1.CronJobsModel();
        this.sql = new postgres_database_1.default();
        this.orderManager = new orders_manager_1.OrdersManager();
        // bindings
        this.updateOrdersToDelivered = this.updateOrdersToDelivered.bind(this);
    }
    async updateOrdersToDelivered(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let job = null;
        try {
            const cronPayload = {
                code: "UPDATE_ORDERS_DELIVERED",
                name: "Update all non-cancelled orders status to ORDER_DELIVERED",
                started_dt: new Date(),
                http_method: "GET",
                http_url: process.env.BASE_URL + "v1/cron/orders/delivered"
            };
            // create cronjob
            job = await this.cronJobsModel.createEntity(cronPayload, "logs", "cron_executed_jobs", "job_id");
            // get orders that are not cancelled
            var sql = "SELECT * FROM orders.orders_master WHERE status = 'ORDER_PREPARING'::text AND comp_id IS NULL";
            // processing query
            var result = await this.sql.executeQuery(sql, []);
            this.logger.info(`Found ${result.rowCount} orders to update`, "updateOrdersToDelivered : controller");
            // if no orders are found -> return
            if (result.rowCount === 0) {
                resModel.status = 1;
                resModel.info = "info: No orders found for status update to ORDER_DELIVERED : " + resModel.info;
                // update job details for no records case
                const finishedDt = new Date();
                await this.cronJobsModel.updateEntity("logs", "cron_executed_jobs", { job_id: job.job_id }, {
                    finished_dt: finishedDt,
                    duration: (new Date().getTime() - startMS) / 1000,
                    result: result,
                    resolution: "COMPLETED",
                });
                return res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
            }
            // update all ORDER_PREPARING orders to ORDER_DELIVERED
            resModel.data = await this.orderManager.markAllPreparingOrdersAsDelivered();
            /** update job details */
            const finishedDt = new Date();
            await this.cronJobsModel.updateEntity("logs", "cron_executed_jobs", { job_id: job.job_id }, {
                finished_dt: finishedDt,
                duration: (new Date().getTime() - startMS) / 1000,
                result: {
                    ...result,
                    updated_orders: resModel.data || 0
                },
                resolution: "COMPLETED",
            });
        }
        catch (error) {
            console.log(error);
            this.logger.error(error, 'updateOrdersToDelivered : controller');
            /** update job details */
            if (job && job.job_id) {
                var finishedDt = new Date();
                await this.cronJobsModel.updateEntity("logs", "cron_executed_jobs", { job_id: job.job_id }, {
                    finished_dt: finishedDt,
                    duration: (new Date().getTime() - startMS) / 1000,
                    resolution: "FAILED",
                    result: { 'error': error.message || error }
                });
            }
            resModel.status = 0;
            resModel.info = "error: Failed to update orders status to ORDER_DELIVERED : " + resModel.info;
        }
        // return response
        resModel.endDT = new Date();
        resModel.tat = (new Date().getTime() - startMS) / 1000;
        res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
    }
}
exports.CronOrdersController = CronOrdersController;
