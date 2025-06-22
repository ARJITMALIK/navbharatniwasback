"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffersController = void 0;
const constants_util_1 = require("../../../../utils/constants.util");
const response_entity_1 = require("../../../../entities/core/response.entity");
const master_controller_1 = __importDefault(require("../../../master.controller"));
const offers_model_1 = require("../../../../models/v1/restraunts/offers.model");
class OffersController extends master_controller_1.default {
    constructor() {
        super();
        this.offersModel = new offers_model_1.OffersModel();
        // bindings
        this.fetchOffers = this.fetchOffers.bind(this);
        this.createoffers = this.createoffers.bind(this);
        this.updateOffers = this.updateOffers.bind(this);
        this.deleteOffers = this.deleteOffers.bind(this);
    }
    async fetchOffers(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let params;
        try {
            params = req.query;
            resModel = await this.offersModel.fetch(params);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchoffers`);
        }
    }
    async createoffers(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            // make sure required keys exist
            // const verifyKeys = this.verifyKeys(req.body, ['offer_code', 'offer_percentage']);
            // if (verifyKeys.length !== 0) {
            //     resModel.status = -9;
            //     resModel.info = "error: Missing keys: " + verifyKeys + " : " + resModel.info;
            //     return res.status(Constants.HTTP_BAD_REQUEST).json(resModel);
            // }
            // // make sure required fields are not empty
            // const mandatoryFields = this.mandatoryFields(req.body, ['offer_code', 'offer_percentage']);
            // if (mandatoryFields.length !== 0) {
            //     resModel.status = -9;
            //     resModel.info = "error: Empty fields: " + mandatoryFields + " : " + resModel.info;
            //     return res.status(Constants.HTTP_BAD_REQUEST).json(resModel);
            // }
            resModel = await this.offersModel.createEntity(payload, "restraunts", "offers", "offer_id");
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
    async updateOffers(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            resModel = await this.offersModel.updateEntity("restraunts", "offers", { offer_id: req.params.id }, payload);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : updateOffers`);
        }
    }
    async deleteOffers(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        try {
            resModel = await this.offersModel.deleteEntity("restraunts", "offers", "offer_id", req.params.id);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : deleteOffers`);
        }
    }
}
exports.OffersController = OffersController;
