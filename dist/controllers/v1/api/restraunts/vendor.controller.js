"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutletVendorController = void 0;
const constants_util_1 = require("../../../../utils/constants.util");
const response_entity_1 = require("../../../../entities/core/response.entity");
const master_controller_1 = __importDefault(require("../../../master.controller"));
const vendor_model_1 = require("../../../../models/v1/restraunts/vendor.model");
class OutletVendorController extends master_controller_1.default {
    constructor() {
        super();
        this.vendorModel = new vendor_model_1.VendorModel();
        // bindings
        this.fetchVendor = this.fetchVendor.bind(this);
        this.createVendor = this.createVendor.bind(this);
        this.updateVendor = this.updateVendor.bind(this);
        this.deleteVendor = this.deleteVendor.bind(this);
    }
    async fetchVendor(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let params;
        try {
            params = req.query;
            resModel = await this.vendorModel.fetch(params);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchVendor`);
        }
    }
    async createVendor(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            // make sure required keys exist
            const verifyKeys = this.verifyKeys(req.body, ['vendor_name', 'vendor_phone']);
            if (verifyKeys.length !== 0) {
                resModel.status = -9;
                resModel.info = "error: Missing keys: " + verifyKeys + " : " + resModel.info;
                return res.status(constants_util_1.Constants.HTTP_BAD_REQUEST).json(resModel);
            }
            // make sure required fields are not empty
            const mandatoryFields = this.mandatoryFields(req.body, ['vendor_name', 'vendor_phone']);
            if (mandatoryFields.length !== 0) {
                resModel.status = -9;
                resModel.info = "error: Empty fields: " + mandatoryFields + " : " + resModel.info;
                return res.status(constants_util_1.Constants.HTTP_BAD_REQUEST).json(resModel);
            }
            let user = await this.vendorModel.fetch({ vendor_phone: payload.vendor_phone });
            if (user.data.rowCount != 0) {
                resModel.status = -9;
                resModel.info = "error: " + "vendor already exists";
                return res.status(constants_util_1.Constants.HTTP_CONFLICT).json(resModel);
            }
            resModel = await this.vendorModel.createEntity(payload, "restraunts", "vendor_master", "vendor_id");
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : variantsController`);
        }
    }
    async updateVendor(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            resModel = await this.vendorModel.updateEntity("restraunts", "vendor_master", { vendor_id: req.params.id }, payload);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : updateVendor`);
        }
    }
    async deleteVendor(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        try {
            resModel = await this.vendorModel.deleteEntity("restraunts", "vendor_master", "vendor_id", req.params.id);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : deleteVariant`);
        }
    }
}
exports.OutletVendorController = OutletVendorController;
