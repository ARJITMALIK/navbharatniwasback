"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const constants_util_1 = require("../../../../utils/constants.util");
const response_entity_1 = require("../../../../entities/core/response.entity");
const master_controller_1 = __importDefault(require("../../../master.controller"));
const orders_model_1 = require("../../../../models/v1/orders/orders.model");
const stations_model_1 = require("../../../../models/v1/stations/stations.model");
const restraunts_model_1 = require("../../../../models/v1/restraunts/restraunts.model");
const axios_1 = __importDefault(require("axios"));
class OrdersController extends master_controller_1.default {
    constructor() {
        super();
        this.getTrain = async (code) => {
            let res = await axios_1.default.get(`https://webapi.zoopindia.com/train-details?train=${code}`);
            return res;
        };
        this.SendOrderNotification = async (orderdata) => {
            try {
                const payload = {
                    "integrated_number": "15556008400",
                    "content_type": "template",
                    "payload": {
                        "messaging_product": "whatsapp",
                        "type": "template",
                        "template": {
                            "name": "utility_user_message",
                            "language": {
                                "code": "en_GB",
                                "policy": "deterministic"
                            },
                            "namespace": "c6d61087_b5c9_4662_8ff5_314bf55014ef",
                            "to_and_components": [
                                {
                                    "to": [
                                        `91${orderdata?.customer?.mobile}`
                                    ],
                                    "components": {
                                        "body_1": {
                                            "type": "text",
                                            "value": orderdata.customer.fullName
                                        },
                                        "body_2": {
                                            "type": "text",
                                            "value": "3111231"
                                        },
                                        "body_3": {
                                            "type": "text",
                                            "value": orderdata?.customer?.mobile
                                        },
                                        "body_4": {
                                            "type": "text",
                                            "value": `${orderdata.trainName} ${orderdata.trainNo}`
                                        },
                                        "body_5": {
                                            "type": "text",
                                            "value": `${orderdata.coach} ${orderdata.berth}`
                                        },
                                        "body_6": {
                                            "type": "text",
                                            "value": orderdata.deliveryDate
                                        },
                                        "body_7": {
                                            "type": "text",
                                            "value": orderdata.deliveryDate
                                        },
                                        "body_8": {
                                            "type": "text",
                                            "value": orderdata.stationName
                                        },
                                        "body_9": {
                                            "type": "text",
                                            "value": orderdata.orderItems.map((item) => { return item.itemName; })
                                        },
                                        "body_10": {
                                            "type": "text",
                                            "value": orderdata.amountPayable
                                        },
                                        "body_11": {
                                            "type": "text",
                                            "value": orderdata.paymentType
                                        },
                                        "body_12": {
                                            "type": "text",
                                            "value": `45 minutes before ${orderdata.deliveryDate} `
                                        }
                                    }
                                }
                            ]
                        }
                    }
                };
                const response = await axios_1.default.post("https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/", payload, // Send the object directly as payload
                {
                    headers: {
                        "Content-Type": "application/json",
                        "authkey": "191164Aup6j2p05a4cb419" // MSG91 API Key
                    }
                });
                console.log("API Response from MSG91:", response.data);
                return response;
            }
            catch (error) {
                console.error("Error from verify:", error.message);
                throw error;
            }
        };
        this.SendOrderNotificationToVendor = async (orderdata) => {
            try {
                const payload = {
                    "integrated_number": "15556008400",
                    "content_type": "template",
                    "payload": {
                        "messaging_product": "whatsapp",
                        "type": "template",
                        "template": {
                            "name": "utility_vendor_order_message",
                            "language": {
                                "code": "en_GB",
                                "policy": "deterministic"
                            },
                            "namespace": "c6d61087_b5c9_4662_8ff5_314bf55014ef",
                            "to_and_components": [
                                {
                                    "to": [
                                        `91${orderdata.outlet.contactNumbers}`
                                    ],
                                    "components": {
                                        "body_1": {
                                            "type": "text",
                                            "value": "121231231"
                                        },
                                        "body_2": {
                                            "type": "text",
                                            "value": orderdata.customer.fullName
                                        },
                                        "body_3": {
                                            "type": "text",
                                            "value": orderdata?.customer?.mobile
                                        },
                                        "body_4": {
                                            "type": "text",
                                            "value": `${orderdata.trainName} ${orderdata.trainNo}`
                                        },
                                        "body_5": {
                                            "type": "text",
                                            "value": `${orderdata.coach} ${orderdata.berth}`
                                        },
                                        "body_6": {
                                            "type": "text",
                                            "value": orderdata.deliveryDate
                                        },
                                        "body_7": {
                                            "type": "text",
                                            "value": orderdata.deliveryDate
                                        },
                                        "body_8": {
                                            "type": "text",
                                            "value": orderdata.stationName
                                        },
                                        "body_9": {
                                            "type": "text",
                                            "value": orderdata.orderItems.map((item) => { return item.itemName; })
                                        },
                                        "body_10": {
                                            "type": "text",
                                            "value": orderdata.amountPayable
                                        },
                                        "body_11": {
                                            "type": "text",
                                            "value": orderdata.paymentType
                                        },
                                        "body_12": {
                                            "type": "text",
                                            "value": orderdata.comment
                                        }
                                    }
                                }
                            ]
                        }
                    }
                };
                const response = await axios_1.default.post("https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/", payload, // Send the object directly as payload
                {
                    headers: {
                        "Content-Type": "application/json",
                        "authkey": "191164Aup6j2p05a4cb419" // MSG91 API Key
                    }
                });
                console.log("API Response from MSG91:", response.data);
                return response;
            }
            catch (error) {
                console.error("Error from verify:", error.message);
                throw error;
            }
        };
        this.ordersModel = new orders_model_1.OrdersModel();
        this.stationModel = new stations_model_1.StationsModel();
        this.restrauntModel = new restraunts_model_1.RestrauntsModel();
        // bindings
        this.fetchIRCTC = this.fetchIRCTC.bind(this);
        this.fetch = this.fetch.bind(this);
        this.createOrder = this.createOrder.bind(this);
        this.updateOrder = this.updateOrder.bind(this);
        this.fetchbyTrain = this.fetchbyTrain.bind(this);
        this.fetchbyPNR = this.fetchbyPNR.bind(this);
        this.fetchStationOutlets = this.fetchStationOutlets.bind(this);
        this.pushOrderToIRCTC = this.pushOrderToIRCTC.bind(this);
        this.fetchRoute = this.fetchRoute.bind(this);
        this.pushOrderStatus = this.pushOrderStatus.bind(this);
        this.createOrderfromIRCTC = this.createOrderfromIRCTC.bind(this);
    }
    async pushOrderToIRCTC(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        resModel.endDT = new Date();
        resModel.tat = (new Date().getTime() - startMS) / 1000;
        try {
            // Get outlet data from request body
            const payload = req.body;
            // Make API call to push outlet data to IRCTC
            let response = await axios_1.default.post(`https://stage-ecatering.ipsator.com/api/v2/order/vendor`, payload, {
                headers: {
                    'Authorization': '80d171c2-8bef-4b02-884f-fabffc769776',
                    'Content-Type': 'application/json'
                }
            });
            if (constants_util_1.Constants.HTTP_OK == 200) {
                await this.SendOrderNotification(payload);
                await this.SendOrderNotificationToVendor(payload);
            }
            console.log(constants_util_1.Constants.HTTP_OK);
            res.status(constants_util_1.Constants.HTTP_OK).json({
                resdata: response.data,
                status: true,
                message: "Menu Item successfully pushed to IRCTC"
            });
        }
        catch (error) {
            // Enhanced error handling
            console.log("ERROR pushing menuitem to IRCTC: ", error);
            // Get more details about the error
            if (axios_1.default.isAxiosError(error)) {
                console.log("Request was made and server responded with error");
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log("Error data:", error.response.data);
                    console.log("Error status:", error.response.status);
                    console.log("Error headers:", error.response.headers);
                    res.status(constants_util_1.Constants.HTTP_OK).json({
                        status: false,
                        errorDetails: {
                            status: error.response.status,
                            data: error.response.data,
                            message: error.message
                        }
                    });
                }
                else if (error.request) {
                    // The request was made but no response was received
                    console.log("No response received:", error.request);
                    res.status(constants_util_1.Constants.HTTP_OK).json({
                        status: false,
                        errorDetails: {
                            type: "No response",
                            message: "The request was made but no response was received"
                        }
                    });
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    console.log("Error setting up request:", error.message);
                    res.status(constants_util_1.Constants.HTTP_OK).json({
                        status: false,
                        errorDetails: {
                            type: "Request setup error",
                            message: error.message
                        }
                    });
                }
            }
            else {
                // Handle non-Axios errors
                res.status(constants_util_1.Constants.HTTP_OK).json({
                    status: false,
                    errorDetails: {
                        message: error.message || "Unknown error occurred"
                    }
                });
            }
        }
    }
    async fetchIRCTC(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let params;
        try {
            params = req.query;
            const order = await this.ordersModel.fetchIRCTC(params);
            const station = await this.stationModel.fetch({ station_id: order.data.rows[0].station_id });
            const restraunt = await this.restrauntModel.fetch({ res_id: order.data.rows[0].res_id });
            const orderResp = order.data.rows[0];
            const stationResp = station.data.rows[0];
            const restrauntResp = restraunt.data.rows[0];
            const response = {
                orderId: orderResp.oid,
                aggregatorDetails: {},
                customerDetails: {},
                bookingDate: orderResp.booking_date,
                deliveryDate: orderResp.delivery_date,
                priceDetails: {
                    deliveryCharge: orderResp.delivery_charge,
                    discountAmount: orderResp.discount_amount,
                    totalAmount: orderResp.total_amount,
                    totalMargin: orderResp.total_margin,
                    gst: orderResp.gst,
                    amountPayable: orderResp.amount_payable,
                    couponCode: orderResp.coupan_code,
                    irctcDiscountAmount: orderResp.irctc_discount_amount,
                    vendorDiscountAmount: orderResp.vendor_discount_amount
                },
                status: orderResp.status,
                deliveryDetails: {
                    trainNo: 123123,
                    station: stationResp.station_name,
                },
                orderItems: {},
                paymentType: orderResp.payment_type,
                comment: orderResp.comment
            };
            resModel.data = response;
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchOrders`);
        }
    }
    async fetchbyTrain(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        try {
            let sta = await this.getTrain(Number(req.params.id));
            resModel = sta?.data?.data;
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchTraindata`);
        }
    }
    async fetchbyPNR(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        resModel.endDT = new Date();
        resModel.tat = (new Date().getTime() - startMS) / 1000;
        const { pnr } = req.body;
        try {
            let res1 = await axios_1.default.get(`https://stage-ecatering.ipsator.com/api/v1/pnr/vendor?pnr=${pnr}`, {
                headers: {
                    'Authorization': '80d171c2-8bef-4b02-884f-fabffc769776'
                }
            });
            console.log("IRCTC API RESPONSE: ", res1);
            res.status(constants_util_1.Constants.HTTP_OK).json({ resdata: res1.data, status: true });
            return res;
        }
        catch (error) {
            // Enhanced error handling
            console.log("ERROR: ", error);
            // Get more details about the error
            if (axios_1.default.isAxiosError(error)) {
                console.log("Request was made and server responded with error");
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log("Error data:", error.response.data);
                    console.log("Error status:", error.response.status);
                    console.log("Error headers:", error.response.headers);
                    res.status(constants_util_1.Constants.HTTP_OK).json({
                        status: false,
                        errorDetails: {
                            status: error.response.status,
                            data: error.response.data,
                            message: error.message
                        }
                    });
                }
                else if (error.request) {
                    // The request was made but no response was received
                    console.log("No response received:", error.request);
                    res.status(constants_util_1.Constants.HTTP_OK).json({
                        status: false,
                        errorDetails: {
                            type: "No response",
                            message: "The request was made but no response was received"
                        }
                    });
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    console.log("Error setting up request:", error.message);
                    res.status(constants_util_1.Constants.HTTP_OK).json({
                        status: false,
                        errorDetails: {
                            type: "Request setup error",
                            message: error.message
                        }
                    });
                }
            }
            else {
                // Handle non-Axios errors
                res.status(constants_util_1.Constants.HTTP_OK).json({
                    status: false,
                    errorDetails: {
                        message: error.message || "Unknown error occurred"
                    }
                });
            }
        }
    }
    async fetchStationOutlets(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        resModel.endDT = new Date();
        resModel.tat = (new Date().getTime() - startMS) / 1000;
        try {
            const { boardingDate, trainNo, currtime } = req.body;
            let response = await axios_1.default.get(`https://stage-ecatering.ipsator.com/api/v2/train/boarding/stations?trainNo=${trainNo}&boardingDate=${boardingDate}&_=${currtime}`, {
                headers: {
                    'Authorization': '80d171c2-8bef-4b02-884f-fabffc769776'
                }
            });
            console.log("Station Outlets API RESPONSE: ", response);
            res.status(constants_util_1.Constants.HTTP_OK).json({ resdata: response.data, status: true });
            return res;
        }
        catch (error) {
            // Enhanced error handling
            console.log("ERROR: ", error);
            // Get more details about the error
            if (axios_1.default.isAxiosError(error)) {
                console.log("Request was made and server responded with error");
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log("Error data:", error.response.data);
                    console.log("Error status:", error.response.status);
                    console.log("Error headers:", error.response.headers);
                    res.status(constants_util_1.Constants.HTTP_OK).json({
                        status: false,
                        errorDetails: {
                            status: error.response.status,
                            data: error.response.data,
                            message: error.message
                        }
                    });
                }
                else if (error.request) {
                    // The request was made but no response was received
                    console.log("No response received:", error.request);
                    res.status(constants_util_1.Constants.HTTP_OK).json({
                        status: false,
                        errorDetails: {
                            type: "No response",
                            message: "The request was made but no response was received"
                        }
                    });
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    console.log("Error setting up request:", error.message);
                    res.status(constants_util_1.Constants.HTTP_OK).json({
                        status: false,
                        errorDetails: {
                            type: "Request setup error",
                            message: error.message
                        }
                    });
                }
            }
            else {
                // Handle non-Axios errors
                res.status(constants_util_1.Constants.HTTP_OK).json({
                    status: false,
                    errorDetails: {
                        message: error.message || "Unknown error occurred"
                    }
                });
            }
        }
    }
    async fetchRoute(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        resModel.endDT = new Date();
        resModel.tat = (new Date().getTime() - startMS) / 1000;
        try {
            // Make API call with parameters from payload
            const { trainNo, boardingDate, currtime, boardingStation } = req.body;
            let response = await axios_1.default.get(`https://stage-ecatering.ipsator.com/api/v2/train/stations?trainNo=${trainNo}&boardingDate=${boardingDate}&boardingStation=${boardingStation}&_=${currtime}`, {
                headers: {
                    'Authorization': '80d171c2-8bef-4b02-884f-fabffc769776'
                }
            });
            console.log("Station Outlets API RESPONSE: ", response);
            res.status(constants_util_1.Constants.HTTP_OK).json({ resdata: response.data, status: true });
            return res;
        }
        catch (error) {
            // Enhanced error handling
            console.log("ERROR: ", error);
            // Get more details about the error
            if (axios_1.default.isAxiosError(error)) {
                console.log("Request was made and server responded with error");
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log("Error data:", error.response.data);
                    console.log("Error status:", error.response.status);
                    console.log("Error headers:", error.response.headers);
                    res.status(constants_util_1.Constants.HTTP_OK).json({
                        status: false,
                        errorDetails: {
                            status: error.response.status,
                            data: error.response.data,
                            message: error.message
                        }
                    });
                }
                else if (error.request) {
                    // The request was made but no response was received
                    console.log("No response received:", error.request);
                    res.status(constants_util_1.Constants.HTTP_OK).json({
                        status: false,
                        errorDetails: {
                            type: "No response",
                            message: "The request was made but no response was received"
                        }
                    });
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    console.log("Error setting up request:", error.message);
                    res.status(constants_util_1.Constants.HTTP_OK).json({
                        status: false,
                        errorDetails: {
                            type: "Request setup error",
                            message: error.message
                        }
                    });
                }
            }
            else {
                // Handle non-Axios errors
                res.status(constants_util_1.Constants.HTTP_OK).json({
                    status: false,
                    errorDetails: {
                        message: error.message || "Unknown error occurred"
                    }
                });
            }
        }
    }
    async fetch(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let params;
        try {
            params = req.query;
            resModel = await this.ordersModel.fetch(params);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json({ ...resModel });
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchOrders`);
        }
    }
    async createOrder(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            // make sure required keys exist
            const verifyKeys = this.verifyKeys(req.body, ['outlet_id', 'status', 'created_at', 'updated_at']);
            if (verifyKeys.length !== 0) {
                resModel.status = -9;
                resModel.info = "error: Missing keys: " + verifyKeys + " : " + resModel.info;
                return res.status(constants_util_1.Constants.HTTP_BAD_REQUEST).json(resModel);
            }
            // make sure required fields are not empty
            const mandatoryFields = this.mandatoryFields(req.body, ['outlet_id', 'status', 'created_at', 'updated_at', "delivery_date"]);
            if (mandatoryFields.length !== 0) {
                resModel.status = -9;
                resModel.info = "error: Empty fields: " + mandatoryFields + " : " + resModel.info;
                return res.status(constants_util_1.Constants.HTTP_BAD_REQUEST).json(resModel);
            }
            // // check if the order exists
            // const existingOrder: any = await this.ordersModel.fetch({ name: payload.name });
            // if (existingOrder.data.rowCount !== 0) {
            //     resModel.status = -9;
            //     resModel.info = "error: order already exists";
            //     return res.status(Constants.HTTP_CONFLICT).json(resModel);
            // }
            resModel = await this.ordersModel.createEntity(payload, "orders", "orders_master", "oid");
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : ordersController`);
        }
    }
    async createOrderfromIRCTC(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        try {
            const orderid = req.body.orderId;
            const payload = req.body;
            const stringyfied = JSON.stringify(payload);
            function formatDeliveryDateTime(dateStr, timeStr) {
                if (!dateStr || !timeStr)
                    return "";
                const deliveryDate = new Date(dateStr);
                // Get components
                const month = String(deliveryDate.getMonth() + 1).padStart(2, '0');
                const day = String(deliveryDate.getDate()).padStart(2, '0');
                const year = deliveryDate.getFullYear();
                // Format as "MM-DD-YYYY HH:MM"
                return `${year}-${month}-${day} ${timeStr}`;
            }
            function formatCurrentDateTime() {
                const now = new Date();
                // Get components
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const year = now.getFullYear();
                // Get time
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                // Format as "MM-DD-YYYY HH:MM IST"
                return `${year}-${month}-${day} ${hours}:${minutes}`;
            }
            const formattedorderObject = (payload) => {
                if (!payload) {
                    return null;
                }
                const formattedpayoad = {
                    outlet_id: payload?.aggregatorDetails?.outletId,
                    oid: payload?.orderId,
                    updated_by: "IRCTC",
                    pushed: 1,
                    mode: payload?.paymentType,
                    status: payload?.status == "ORDER_PLACED" ? "ORDER_PREPARING" : "ORDER_PLACED",
                    booked_from: "IRCTC",
                    delivery_date: payload?.deliveryDate,
                    created_at: formatDeliveryDateTime(payload?.bookingDate.split(" ")[0], payload?.bookingDate.split(" ")[1]),
                    updated_at: formatCurrentDateTime(),
                    menu_items: JSON.stringify({
                        items: payload.orderItems.map(item => ({
                            name: item.itemName,
                            item_id: item.itemId,
                            quantity: item.quantity, // This comes from cartItems, not menuItems
                            descriptiom: item.description,
                            SellingPrice: item.sellingPrice,
                            isVegetarian: item.isVegetarian ? 1 : 0
                        }))
                    }),
                    customer_info: JSON.stringify({
                        customerDetails: payload.customerDetails
                    }),
                    delivery_details: JSON.stringify({
                        deliveryDetails: {
                            pnr: payload?.deliveryDetails?.maskedPnr,
                            berth: payload?.deliveryDetails?.berth,
                            coach: payload?.deliveryDetails?.coach,
                            station: payload?.deliveryDetails?.station,
                            trainNo: payload?.deliveryDetails?.trainNo,
                            trainName: payload?.deliveryDetails?.trainName,
                            stationCode: payload?.deliveryDetails?.stationCode,
                            passengerCount: payload?.deliveryDetails?.passengerCount,
                        }
                    }),
                    discount_amount: payload?.priceDetails?.discountAmount,
                    station_code: payload?.deliveryDetails?.stationCode,
                    irctc_discount: null,
                    vendor_discount: null,
                    comment: payload?.remarks
                };
                return formattedpayoad;
            };
            resModel = await this.ordersModel.createEntity(formattedorderObject(payload), "orders", "orders_master", "oid");
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json({
                "orderId": orderid,
                "aggregatorOrderId": orderid,
                "status": "ORDER_CONFIRMED"
            });
            this.logger.info(JSON.stringify(resModel), `${this.constructor.name} : ordersControllerIRCTC`);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : ordersControllerIRCTC`);
            res.status(500).json({
                status: 'failure',
                message: error.message
            });
        }
    }
    async pushOrderStatus(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        resModel.endDT = new Date();
        resModel.tat = (new Date().getTime() - startMS) / 1000;
        try {
            // Get outlet data from request body
            const payload = req.body;
            // Make API call to push outlet data to IRCTC
            let response = await axios_1.default.post(`https://stage-ecatering.ipsator.com/api/v1/order/${req.params.id}/status`, payload, {
                headers: {
                    'Authorization': '80d171c2-8bef-4b02-884f-fabffc769776',
                    'Content-Type': 'application/json'
                }
            });
            console.log("IRCTC Status API RESPONSE: ", response.data);
            res.status(constants_util_1.Constants.HTTP_OK).json({
                resdata: response.data,
                status: true,
                message: "Status successfully pushed to IRCTC"
            });
        }
        catch (error) {
            // Enhanced error handling
            console.log("ERROR Push Status to IRCTC: ", error);
            // Get more details about the error
            if (axios_1.default.isAxiosError(error)) {
                console.log("Request was made and server responded with error");
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log("Error data:", error.response.data);
                    console.log("Error status:", error.response.status);
                    console.log("Error headers:", error.response.headers);
                    res.status(constants_util_1.Constants.HTTP_OK).json({
                        status: false,
                        errorDetails: {
                            status: error.response.status,
                            data: error.response.data,
                            message: error.message
                        }
                    });
                }
                else if (error.request) {
                    // The request was made but no response was received
                    console.log("No response received:", error.request);
                    res.status(constants_util_1.Constants.HTTP_OK).json({
                        status: false,
                        errorDetails: {
                            type: "No response",
                            message: "The request was made but no response was received"
                        }
                    });
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    console.log("Error setting up request:", error.message);
                    res.status(constants_util_1.Constants.HTTP_OK).json({
                        status: false,
                        errorDetails: {
                            type: "Request setup error",
                            message: error.message
                        }
                    });
                }
            }
            else {
                // Handle non-Axios errors
                res.status(constants_util_1.Constants.HTTP_OK).json({
                    status: false,
                    errorDetails: {
                        message: error.message || "Unknown error occurred"
                    }
                });
            }
        }
    }
    async updateOrder(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            resModel = await this.ordersModel.updateEntity("orders", "orders_master", { oid: req.params.id }, payload);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : updateOrder`);
        }
    }
}
exports.OrdersController = OrdersController;
