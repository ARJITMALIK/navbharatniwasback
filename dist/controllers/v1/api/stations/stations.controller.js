"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StationsController = void 0;
const constants_util_1 = require("../../../../utils/constants.util");
const response_entity_1 = require("../../../../entities/core/response.entity");
const master_controller_1 = __importDefault(require("../../../master.controller"));
const stations_model_1 = require("../../../../models/v1/stations/stations.model");
const axios_1 = __importDefault(require("axios"));
class StationsController extends master_controller_1.default {
    constructor() {
        super();
        this.getstation = async (name) => {
            let res = await axios_1.default.get(`https://webapi.zoopindia.com/station?stationName=${name}`);
            return res;
        };
        this.stationsModel = new stations_model_1.StationsModel();
        // bindings
        this.fetchStations = this.fetchStations.bind(this);
        this.createStations = this.createStations.bind(this);
        this.updateStations = this.updateStations.bind(this);
        this.deleteStation = this.deleteStation.bind(this);
        this.fetchStationsName = this.fetchStationsName.bind(this);
    }
    async fetchStationsName(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        try {
            let sta = await this.getstation(req.params.id);
            resModel = sta?.data?.data;
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchStations`);
        }
    }
    async fetchStations(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let params;
        try {
            params = req.query;
            resModel = await this.stationsModel.fetch(params);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchStations`);
        }
    }
    async createStations(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            console.log("api created");
            // make sure required keys exist
            const verifyKeys = this.verifyKeys(req.body, ['station_name', 'station_code']);
            if (verifyKeys.length !== 0) {
                resModel.status = -9;
                resModel.info = "error: Missing keys: " + verifyKeys + " : " + resModel.info;
                return res.status(constants_util_1.Constants.HTTP_BAD_REQUEST).json(resModel);
            }
            // make sure required fields are not empty
            const mandatoryFields = this.mandatoryFields(req.body, ['station_name', 'station_code']);
            if (mandatoryFields.length !== 0) {
                resModel.status = -9;
                resModel.info = "error: Empty fields: " + mandatoryFields + " : " + resModel.info;
                return res.status(constants_util_1.Constants.HTTP_BAD_REQUEST).json(resModel);
            }
            // check if the restraunt exists
            const existingStation = await this.stationsModel.fetch({ station_code: payload.station_code });
            if (existingStation.data.rowCount !== 0) {
                resModel.status = -9;
                resModel.info = "error: Station already exists";
                return res.status(constants_util_1.Constants.HTTP_CONFLICT).json(resModel);
            }
            resModel = await this.stationsModel.createEntity(payload, "stations", "stations_master", "station_id");
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : stationsController`);
        }
    }
    async updateStations(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            resModel = await this.stationsModel.updateEntity("stations", "stations_master", { station_id: req.params.id }, payload);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : updateStations`);
        }
    }
    async deleteStation(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        try {
            resModel = await this.stationsModel.deleteEntity("stations", "stations_master", "station_id", req.params.id);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : deleteStation`);
        }
    }
}
exports.StationsController = StationsController;
