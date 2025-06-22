"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const constants_util_1 = require("../../../utils/constants.util");
const response_entity_1 = require("../../../entities/core/response.entity");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const master_controller_1 = __importDefault(require("../../master.controller"));
const users_model_1 = require("../../../models/v1/users.model");
dotenv_1.default.config();
class UsersController extends master_controller_1.default {
    constructor() {
        super();
        this.usersModel = new users_model_1.UsersModel();
        // bindings
        this.fetchUsers = this.fetchUsers.bind(this);
        this.fetchUsersWithProfile = this.fetchUsersWithProfile.bind(this);
        this.createUser = this.createUser.bind(this);
        this.updateUser = this.updateUser.bind(this);
    }
    async fetchUsers(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let params;
        try {
            params = req.query;
            resModel = await this.usersModel.fetch(params);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchUsers`);
        }
    }
    async fetchUsersWithProfile(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let params;
        try {
            params = req.query;
            resModel = await this.usersModel.fetchWithProfileAndRole(params);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchUsersWithProfile`);
        }
    }
    async createUser(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            // make sure required keys exist
            var verifyKeys = this.verifyKeys(req.body, ['email', 'password', 'role_id', 'first_name', 'last_name', 'profile_picture']);
            if (verifyKeys.length != 0) {
                resModel.status = -9;
                resModel.info = "error: " + verifyKeys + " : " + resModel.info;
                return res.status(constants_util_1.Constants.HTTP_BAD_REQUEST).json(resModel);
            }
            // make sure required fields are not empty
            var mandatoryFields = this.mandatoryFields(req.body, ['email', 'password', 'role_id', 'first_name', 'last_name']);
            if (mandatoryFields.length != 0) {
                resModel.status = -9;
                resModel.info = "error: " + mandatoryFields + " : " + resModel.info;
                return res.status(constants_util_1.Constants.HTTP_BAD_REQUEST).json(resModel);
            }
            // check if the user exists
            let user = await this.usersModel.fetch({ email: payload.email });
            if (user.data.rowCount != 0) {
                resModel.status = -9;
                resModel.info = "error: " + "User already exists";
                return res.status(constants_util_1.Constants.HTTP_CONFLICT).json(resModel);
            }
            // let password = await this.hashPassword(String(req.body.password));
            let password = await bcrypt_1.default.hash(payload.password, 10);
            payload.password = password;
            resModel = await this.usersModel.createEntity(payload, "users", "users_master", "user_id");
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : createUser`);
        }
    }
    async updateUser(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            resModel = await this.usersModel.updateEntity("users", "users_master", { user_id: req.params.id }, payload);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : updateUser`);
        }
    }
}
exports.UsersController = UsersController;
