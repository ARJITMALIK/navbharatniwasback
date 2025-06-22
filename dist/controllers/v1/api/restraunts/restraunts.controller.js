"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestrauntsController = void 0;
const constants_util_1 = require("../../../../utils/constants.util");
const response_entity_1 = require("../../../../entities/core/response.entity");
const master_controller_1 = __importDefault(require("../../../master.controller"));
const restraunts_model_1 = require("../../../../models/v1/restraunts/restraunts.model");
const axios_1 = __importDefault(require("axios"));
class RestrauntsController extends master_controller_1.default {
    constructor() {
        super();
        this.restrauntsModel = new restraunts_model_1.RestrauntsModel();
        // bindings
        this.fetchRestraunts = this.fetchRestraunts.bind(this);
        this.fetchStats = this.fetchStats.bind(this);
        this.createRestraunt = this.createRestraunt.bind(this);
        this.updateRestraunt = this.updateRestraunt.bind(this);
        this.deleteRestraunt = this.deleteRestraunt.bind(this);
        this.pushOutletToIRCTC = this.pushOutletToIRCTC.bind(this);
    }
    async fetchRestraunts(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let params;
        try {
            params = req.query;
            resModel = await this.restrauntsModel.fetch(params);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchRestraunts`);
        }
    }
    async fetchStats(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let params;
        try {
            params = req.query;
            resModel = await this.restrauntsModel.fetchStats(params);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchRestrauntsStats`);
        }
    }
    async pushOutletToIRCTC(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        resModel.endDT = new Date();
        resModel.tat = (new Date().getTime() - startMS) / 1000;
        try {
            // Extract station code from params
            const { stationCode } = req.params;
            // Validate required parameter
            if (!stationCode) {
                return res.status(constants_util_1.Constants.HTTP_OK).json({
                    status: false,
                    errorDetails: {
                        message: "Missing required parameter. Please provide stationCode in the URL."
                    }
                });
            }
            // Get outlet data from request body
            const outletData = req.body;
            console.log(outletData);
            // Validate that the outlet data exists
            if (!outletData || !outletData.outlets || outletData.outlets.length === 0) {
                return res.status(constants_util_1.Constants.HTTP_OK).json({
                    status: false,
                    errorDetails: {
                        message: "Missing outlet data in request body."
                    }
                });
            }
            // Make API call to push outlet data to IRCTC
            let response = await axios_1.default.post(`https://stage-ecatering.ipsator.com/api/v1/vendor/aggregator/outlets/${stationCode}`, outletData, {
                headers: {
                    'Authorization': '80d171c2-8bef-4b02-884f-fabffc769776',
                    'Content-Type': 'application/json'
                }
            });
            console.log("IRCTC Push Outlet API RESPONSE: ", response.data);
            res.status(constants_util_1.Constants.HTTP_OK).json({
                resdata: response.data,
                status: true,
                message: "Outlet successfully pushed to IRCTC"
            });
        }
        catch (error) {
            // Enhanced error handling
            console.log("ERROR pushing outlet to IRCTC: ", error);
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
    async createRestraunt(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            // make sure required keys exist
            const verifyKeys = this.verifyKeys(req.body, ['outlet_name', 'gst', 'fssai']);
            if (verifyKeys.length !== 0) {
                resModel.status = -9;
                resModel.info = "error: Missing keys: " + verifyKeys + " : " + resModel.info;
                return res.status(constants_util_1.Constants.HTTP_BAD_REQUEST).json(resModel);
            }
            // make sure required fields are not empty
            const mandatoryFields = this.mandatoryFields(req.body, ['outlet_name', 'gst', 'fssai']);
            if (mandatoryFields.length !== 0) {
                resModel.status = -9;
                resModel.info = "error: Empty fields: " + mandatoryFields + " : " + resModel.info;
                return res.status(constants_util_1.Constants.HTTP_BAD_REQUEST).json(resModel);
            }
            // check if the restraunt exists
            // const existingRes: any = await this.restrauntsModel.fetch({ phone: payload.phone });
            // if (existingRes.data.rowCount !== 0) {
            //     resModel.status = -9;
            //     resModel.info = "error: Restraunt already exists";
            //     return res.status(Constants.HTTP_CONFLICT).json(resModel);
            // }
            resModel = await this.restrauntsModel.createEntity(payload, "restraunts", "restraunt_master", "outlet_id");
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : restrauntController`);
        }
    }
    async updateRestraunt(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            resModel = await this.restrauntsModel.updateEntity("restraunts", "restraunt_master", { outlet_id: req.params.id }, payload);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : updateRestraunt`);
        }
    }
    async deleteRestraunt(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        try {
            resModel = await this.restrauntsModel.deleteEntity("restraunts", "restraunt_master", "outlet_id", req.params.id);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : deleteRestraunt`);
        }
    }
}
exports.RestrauntsController = RestrauntsController;
