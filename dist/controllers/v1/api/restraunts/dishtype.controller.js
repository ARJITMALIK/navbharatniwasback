"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DishTypeController = void 0;
const constants_util_1 = require("../../../../utils/constants.util");
const response_entity_1 = require("../../../../entities/core/response.entity");
const master_controller_1 = __importDefault(require("../../../master.controller"));
const dishtype_model_1 = require("../../../../models/v1/restraunts/dishtype.model");
class DishTypeController extends master_controller_1.default {
    constructor() {
        super();
        this.dishtypeModel = new dishtype_model_1.DishTypeModel();
        // bindings
        this.fetchDishType = this.fetchDishType.bind(this);
        // this.createRestraunt = this.createRestraunt.bind(this);
    }
    async fetchDishType(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let params;
        try {
            params = req.query;
            resModel = await this.dishtypeModel.fetch(params);
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
}
exports.DishTypeController = DishTypeController;
