"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const cron_orders_controller_1 = require("../controllers/v1/cron/cron.orders.controller");
class CronRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        // middlewares
        const authMiddleware = new auth_middleware_1.AuthMiddleware();
        // controllers
        const cronUploadController = new cron_orders_controller_1.CronOrdersController();
        // cron routes
        this.router.get(`/orders`, cronUploadController.updateOrdersToDelivered);
    }
}
exports.CronRoutes = CronRoutes;
