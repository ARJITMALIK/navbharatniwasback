"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronJobsModel = void 0;
const query_entity_1 = require("../../../entities/core/query.entity");
const response_entity_1 = require("../../../entities/core/response.entity");
const constants_util_1 = require("../../../utils/constants.util");
const master_model_1 = __importDefault(require("../../master.model"));
class CronJobsModel extends master_model_1.default {
    constructor() {
        super();
    }
    async fetch(params, limit = 1) {
        const startMS = new Date().getTime();
        const resModel = { ...response_entity_1.ResponseEntity };
        let queryModel = { ...query_entity_1.QueryEntity };
        let query = 'SELECT * FROM `cron_executed_job` WHERE ';
        const values = [];
        let index = 1;
        try {
            // filter with job_id
            if (params.job_id) {
                query += `job_id = $${index} AND `;
                values.push(params.job_id);
                index += 1;
            }
            // filter with code
            if (params.code) {
                query += `code = $${index} AND `;
                values.push(params.code);
                index += 1;
            }
            // filter with started_dt_from
            if (params.started_dt_from) {
                query += `started_dt >= $${index} AND `;
                values.push(params.started_dt_from);
                index += 1;
            }
            // filter with started_dt_to
            if (params.started_dt_to) {
                query += `started_dt <= $${index} AND `;
                values.push(params.started_dt_to);
                index += 1;
            }
            // filter with resolution
            if (params.resolution) {
                query += `resolution = $${index} AND `;
                values.push(params.resolution);
                index += 1;
            }
            // search filter
            if (params.search) {
                query += `(code LIKE $${index} OR name LIKE $${index + 1} OR http_method LIKE $${index + 2}) AND `;
                values.push(`%${params.search}%`, `%${params.search}%`, `%${params.search}%`);
                index += 3;
            }
            // Remove trailing 'AND' or 'WHERE' if no conditions are applied
            query = query.endsWith('WHERE ') ? query.slice(0, -6) : query.slice(0, -4);
            // sorting
            if (params.sorting_type && params.sorting_field) {
                query += ` ORDER BY ${params.sorting_field} ${params.sorting_type}`;
            }
            // pagination
            if (params.limit) {
                query += ` LIMIT $${index} OFFSET $${index + 1}`;
                values.push(parseInt(params.limit), parseInt(params.page || 0) * parseInt(params.limit));
            }
            // Execute the query
            queryModel = await this.sql.executeQuery(query, values);
            // Build the response based on query success or failure
            if (queryModel.status === constants_util_1.Constants.SUCCESS) {
                resModel.status = queryModel.status;
                resModel.info = `OK: DB Query: ${queryModel.info} : ${queryModel.tat} : ${queryModel.message}`;
                resModel.data = queryModel;
            }
            else {
                resModel.status = constants_util_1.Constants.ERROR;
                resModel.info = `ERROR: DB Query: ${JSON.stringify(queryModel)}`;
            }
        }
        catch (error) {
            resModel.status = -33;
            resModel.info = `catch : ${resModel.info} : ${JSON.stringify(error)}`;
            this.logger.error(`DB Fetch Error: ${query} - Error: ${JSON.stringify(error)}`, 'cronJobsModel: fetch');
        }
        finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }
        return resModel;
    }
}
exports.CronJobsModel = CronJobsModel;
