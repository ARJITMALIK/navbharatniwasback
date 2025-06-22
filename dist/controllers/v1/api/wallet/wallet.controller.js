"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const constants_util_1 = require("../../../../utils/constants.util");
const response_entity_1 = require("../../../../entities/core/response.entity");
const master_controller_1 = __importDefault(require("../../../master.controller"));
const wallet_model_1 = require("../../../../models/v1/wallet/wallet.model");
const orders_model_1 = require("../../../../models/v1/orders/orders.model");
const dish_model_1 = require("../../../../models/v1/restraunts/dish.model");
class WalletController extends master_controller_1.default {
    constructor() {
        super();
        this.walletModel = new wallet_model_1.WalletModel();
        this.orderModel = new orders_model_1.OrdersModel();
        this.dishModel = new dish_model_1.DishModel();
        // bindings
        this.fetchWallet = this.fetchWallet.bind(this);
        this.createWallet = this.createWallet.bind(this);
    }
    async fetchWallet(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let params;
        try {
            params = req.query;
            // make sure required keys exist
            const verifyKeys = this.verifyKeys(params, ['outlet_id']);
            if (verifyKeys.length !== 0) {
                resModel.status = -9;
                resModel.info = "error: Missing keys: " + verifyKeys + " : " + resModel.info;
                return res.status(constants_util_1.Constants.HTTP_BAD_REQUEST).json(resModel);
            }
            // make sure required fields are not empty
            const mandatoryFields = this.mandatoryFields(params, ['outlet_id']);
            if (mandatoryFields.length !== 0) {
                resModel.status = -9;
                resModel.info = "error: Empty fields: " + mandatoryFields + " : " + resModel.info;
                return res.status(constants_util_1.Constants.HTTP_BAD_REQUEST).json(resModel);
            }
            const payment = await this.walletModel.fetch(params);
            for (const paymentItem of payment.data.rows) {
                let vendor_price_sum = 0;
                const order = await this.orderModel.fetch({ oid: paymentItem.order_id });
                for (const item of order.data.rows[0].menu_items.items) {
                    const dish = await this.dishModel.fetch({
                        outlet_id: order.data.rows[0].outlet_id,
                        item_id: item.item_id
                    });
                    vendor_price_sum += dish.data.rows[0].vendor_price * item.quantity; // Fixed: using item.quantity instead of order.data.rows
                }
                paymentItem.vendor_amount = vendor_price_sum;
                paymentItem.order_type = order.data.rows[0].mode;
            }
            resModel.data = payment.data;
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchdels`);
        }
    }
    async createWallet(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            // make sure required keys exist
            const verifyKeys = this.verifyKeys(req.body, ['order_id', 'outlet_id']);
            if (verifyKeys.length !== 0) {
                resModel.status = -9;
                resModel.info = "error: Missing keys: " + verifyKeys + " : " + resModel.info;
                return res.status(constants_util_1.Constants.HTTP_BAD_REQUEST).json(resModel);
            }
            // make sure required fields are not empty
            const mandatoryFields = this.mandatoryFields(req.body, ['order_id', 'outlet_id']);
            if (mandatoryFields.length !== 0) {
                resModel.status = -9;
                resModel.info = "error: Empty fields: " + mandatoryFields + " : " + resModel.info;
                return res.status(constants_util_1.Constants.HTTP_BAD_REQUEST).json(resModel);
            }
            // check if the zone exists
            // const existingdel: any = await this.walletModel.fetch({phone: payload.aadhar });
            // if (existingdel.data.rowCount !== 0) {
            //     resModel.status = -9;
            //     resModel.info = "error: delivery person already exists";
            //     return res.status(Constants.HTTP_CONFLICT).json(resModel);
            // }
            resModel = await this.walletModel.createEntity(payload, "payments", "payments_master", "pay_id");
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : delController`);
        }
    }
}
exports.WalletController = WalletController;
