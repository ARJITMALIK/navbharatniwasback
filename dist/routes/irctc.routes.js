"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IRCTCRoutes = void 0;
const express_1 = require("express");
const orders_controller_1 = require("../controllers/v1/api/orders/orders.controller");
class IRCTCRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        const ordersController = new orders_controller_1.OrdersController();
        this.router.post(`/order`, ordersController.createOrderfromIRCTC);
    }
}
exports.IRCTCRoutes = IRCTCRoutes;
