"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersManager = void 0;
const orders_model_1 = require("../models/v1/orders/orders.model");
const master_manager_1 = __importDefault(require("./master.manager"));
class OrdersManager extends master_manager_1.default {
    constructor() {
        super();
        this.ordersModel = new orders_model_1.OrdersModel();
        // bindings
        this.updateOrder = this.updateOrder.bind(this);
        this.markOrderAsCompleted = this.markOrderAsCompleted.bind(this);
        this.markOrderAsCancelled = this.markOrderAsCancelled.bind(this);
        this.markOrderAsDelivered = this.markOrderAsDelivered.bind(this);
        this.markAllPreparingOrdersAsDelivered = this.markAllPreparingOrdersAsDelivered.bind(this);
    }
    async updateOrder(orderData, orderId) {
        try {
            await this.ordersModel.updateEntity("orders", "orders_master", { id: orderId }, orderData);
        }
        catch (error) {
            this.logger.error(error, 'updateOrder : manager');
            throw error;
        }
    }
    async markOrderAsCompleted(orderId) {
        try {
            await this.ordersModel.updateEntity("orders", "orders_master", { id: orderId }, {
                status: 'completed',
                completed_at: new Date()
            });
        }
        catch (error) {
            this.logger.error(error, 'markOrderAsCompleted : manager');
            throw error;
        }
    }
    async markOrderAsDelivered(orderId) {
        try {
            const result = await this.ordersModel.updateEntity("orders", "orders_master", { id: orderId }, {
                status: 'ORDER_DELIVERED',
            });
            return result;
        }
        catch (error) {
            this.logger.error(error, 'markOrderAsDelivered : manager');
            throw error;
        }
    }
    async markAllPreparingOrdersAsDelivered() {
        try {
            // Update all orders with status 'ORDER_PREPARING' to 'ORDER_DELIVERED'
            const result = await this.ordersModel.updateEntityWithCondition("orders", "orders_master", { status: 'ORDER_PREPARING', comp_id: null }, // WHERE condition
            {
                status: 'ORDER_DELIVERED',
            });
            this.logger.info(`Updated ${result.data || 0} orders to ORDER_DELIVERED`, 'markAllPreparingOrdersAsDelivered : manager');
            return {
                status: 1,
                data: result || 0,
                info: `Successfully updated ${result.data || 0} orders to ORDER_DELIVERED`
            };
        }
        catch (error) {
            this.logger.error(error, 'markAllPreparingOrdersAsDelivered : manager');
            throw error;
        }
    }
    async markOrderAsCancelled(orderId, reason) {
        try {
            const updateData = {
                status: 'cancelled',
                cancelled_at: new Date()
            };
            if (reason) {
                updateData.cancellation_reason = reason;
            }
            await this.ordersModel.updateEntity("orders", "orders_master", { id: orderId }, updateData);
        }
        catch (error) {
            this.logger.error(error, 'markOrderAsCancelled : manager');
            throw error;
        }
    }
}
exports.OrdersManager = OrdersManager;
