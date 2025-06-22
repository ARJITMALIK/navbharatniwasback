"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayController = void 0;
const constants_util_1 = require("../../../utils/constants.util");
const response_entity_1 = require("../../../entities/core/response.entity");
const master_controller_1 = __importDefault(require("../../master.controller"));
const razorpay_1 = __importDefault(require("razorpay"));
class RazorpayController extends master_controller_1.default {
    constructor() {
        super();
        this.razorpay = new razorpay_1.default({
            key_id: process.env.RAZORPAY_ID,
            key_secret: process.env.RAZORPAY_PASSWORD
        });
        // bindings
        this.createOrder = this.createOrder.bind(this);
    }
    async createOrder(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            // make sure required keys exist
            var verifyKeys = this.verifyKeys(req.body, ['amount', 'currency']);
            if (verifyKeys.length != 0) {
                resModel.status = -9;
                resModel.info = "error: " + verifyKeys + " : " + resModel.info;
                return res.status(constants_util_1.Constants.HTTP_BAD_REQUEST).json(resModel);
            }
            // make sure required fields are not empty
            var mandatoryFields = this.mandatoryFields(req.body, ['amount', 'currency']);
            if (mandatoryFields.length != 0) {
                resModel.status = -9;
                resModel.info = "error: " + mandatoryFields + " : " + resModel.info;
                return res.status(constants_util_1.Constants.HTTP_BAD_REQUEST).json(resModel);
            }
            const options = {
                amount: payload.amount * 100, // amount in smallest currency unit (paise for INR)
                currency: payload.currency || 'INR',
                receipt: payload.receipt || 'receipt_order_' + Date.now(),
                notes: payload.notes || {}
            };
            const order = await this.razorpay.orders.create(options);
            resModel.data = order;
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : createRzpOrder`);
        }
    }
}
exports.RazorpayController = RazorpayController;
