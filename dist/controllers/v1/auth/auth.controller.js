"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const constants_util_1 = require("../../../utils/constants.util");
const response_entity_1 = require("../../../entities/core/response.entity");
const master_controller_1 = __importDefault(require("../../master.controller"));
const users_model_1 = require("../../../models/v1/users.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
class AuthController extends master_controller_1.default {
    constructor() {
        super();
        this.usersModel = new users_model_1.UsersModel();
        // bindings
        this.login = this.login.bind(this);
    }
    async login(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            // make sure required keys exist
            var verifyKeys = this.verifyKeys(req.body, ['email', 'password']);
            if (verifyKeys.length != 0) {
                resModel.status = -9;
                resModel.info = "error: " + verifyKeys + " : " + resModel.info;
                return res.status(constants_util_1.Constants.HTTP_BAD_REQUEST).json(resModel);
            }
            // make sure required fields are not empty
            var mandatoryFields = this.mandatoryFields(req.body, ['email', 'password']);
            if (mandatoryFields.length != 0) {
                resModel.status = -9;
                resModel.info = "error: " + mandatoryFields + " : " + resModel.info;
                return res.status(constants_util_1.Constants.HTTP_BAD_REQUEST).json(resModel);
            }
            // check if the user exists
            let user = await this.usersModel.fetchUserWithPassword({ email: payload.email, status: [1] });
            if (user.data.rowCount == 0) {
                resModel.status = -8;
                resModel.info = "User not found with this email";
                return res.status(constants_util_1.Constants.HTTP_NOT_FOUND).json(resModel);
            }
            const isMatch = await bcrypt_1.default.compare(payload.password, user.data.rows[0].password);
            if (!isMatch) {
                resModel.status = -41;
                resModel.info = "Incorrect password";
                return res.status(constants_util_1.Constants.HTTP_UNAUTHORIZED).json(resModel);
            }
            const fetchedUser = user.data.rows[0];
            const authToken = this.generateJwtToken({ id: fetchedUser.id, email: fetchedUser.email, name: fetchedUser.first_name + " " + fetchedUser.last_name, profile_picture: fetchedUser.profile_picture, role_id: fetchedUser.role_id });
            resModel.status = 1;
            resModel.info = "Signed in successfully",
                resModel.data = { token: authToken };
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : login`);
        }
    }
}
exports.AuthController = AuthController;
