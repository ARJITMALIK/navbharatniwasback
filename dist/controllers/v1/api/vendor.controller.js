"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorController = void 0;
const constants_util_1 = require("../../../utils/constants.util");
const response_entity_1 = require("../../../entities/core/response.entity");
const dotenv_1 = __importDefault(require("dotenv"));
const master_controller_1 = __importDefault(require("../../master.controller"));
const vendor_model_1 = require("../../../models/v1/vendor.model");
const axios_1 = __importDefault(require("axios"));
const otp_model_1 = require("../../../models/v1/otp.model");
dotenv_1.default.config();
class VendorController extends master_controller_1.default {
    constructor() {
        super();
        this.SendOtp = async (mobile, otp) => {
            try {
                return await axios_1.default.get(`http://glocious.in/api.php?username=25GNAVBHARAT&password=491186&sender=NBNIWS&sendto=${mobile}&message=Dear%20User,%20Welcome%20to%20NavBharat%20Niwas,%20your%20OTP%20for%20login%20is%20${otp}%20Never%20share%20your%20OTP%20with%20anyone.%20NavBharat%20Niwas%20-%20Safe,%20Verified,%20Trusted.&PEID=1701174980266934198&templateid=1707174998301992764`);
            }
            catch (error) {
            }
        };
        this.vendorModel = new vendor_model_1.VendorModel();
        this.otpModel = new otp_model_1.OtpModel();
        // bindings
        this.fetchVendor = this.fetchVendor.bind(this);
        this.createUser = this.createUser.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.verifyUser = this.verifyUser.bind(this);
        this.verifyUserlogin = this.verifyUserlogin.bind(this);
        this.LoginUser = this.LoginUser.bind(this);
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
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchUsers`);
        }
    }
    async verifyUser(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            let phone = payload.phone;
            let otp = payload.otp;
            let name = payload.name;
            let email = payload.email;
            const otpdata = await this.otpModel.fetch({ phone });
            console.log(otpdata);
            let data = otpdata;
            if (data?.data?.rows[0].otp == otp) {
                resModel = await this.vendorModel.createEntity({ phone, email, name }, "auth", "user_master", "user_id");
                await this.otpModel.deleteEntity("auth", "otp", "otp_id", data?.data?.rows[0].otp_id);
                resModel.status = 1;
                resModel.info = "user created";
                return res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
            }
            else {
                console.log("Invalid OTP or User not found");
                return res.status(constants_util_1.Constants.HTTP_OK).json({ status: false, message: "Invalid OTP " });
            }
        }
        catch (error) {
            console.error("Error in verifyUser:", error);
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : verifyUser`);
            return res.status(constants_util_1.Constants.HTTP_INTERNAL_SERVER_ERROR).json({ status: false, error: "Internal Server Error" });
        }
    }
    async createUser(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            const phone = payload.phone;
            console.log(phone);
            let user = await this.vendorModel.fetch({ phone: payload.phone });
            console.log(user.data.rows.length > 0);
            if (user.data.rows.length > 0) {
                resModel.status = -9;
                resModel.info = "error: " + "User already exists";
                return res.status(200).json(resModel);
            }
            const otp = Math.floor(100000 + Math.random() * 900000);
            let sendotp = await this.SendOtp(phone, otp);
            const otpdata = await this.otpModel.fetch({ phone });
            if (otpdata?.data?.rows[0]?.otp) {
                await this.otpModel.deleteEntity("auth", "otp", "otp_id", otpdata?.data?.rows[0].otp_id);
            }
            await this.otpModel.createEntity({ phone, otp }, "auth", "otp", "otp_id");
            let data = sendotp?.data?.type;
            console.log("send otp", sendotp);
            resModel.info = "OTP sent.";
            resModel.data = { data };
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            return res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : createUser`);
            return res.status(constants_util_1.Constants.HTTP_INTERNAL_SERVER_ERROR).json(resModel);
        }
    }
    async verifyUserlogin(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            let phone = payload.phone;
            let otp = payload.otp;
            const otpdata = await this.otpModel.fetch({ phone });
            console.log(otpdata);
            let data = otpdata;
            if (data?.data?.rows[0]?.otp == otp) {
                await this.otpModel.deleteEntity("auth", "otp", "otp_id", data?.data?.rows[0]?.otp_id);
                resModel = await this.vendorModel.fetch({ phone });
                resModel.status = 1;
                resModel.info = "user logged in successfully";
                return res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
            }
            else {
                console.log("Invalid OTP or User not found");
                return res.status(constants_util_1.Constants.HTTP_OK).json({ status: false, message: "Invalid OTP " });
            }
        }
        catch (error) {
            console.error("Error in verifyUser:", error);
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : verifyUser`);
            return res.status(constants_util_1.Constants.HTTP_INTERNAL_SERVER_ERROR).json({ status: false, error: "Internal Server Error" });
        }
    }
    async LoginUser(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            const phone = payload.phone;
            let user = await this.vendorModel.fetch({ phone: payload.phone });
            if (user.data.rows.length <= 0) {
                resModel.status = -9;
                resModel.info = "error: " + "User not registerd!";
                return res.status(200).json(resModel);
            }
            const otp = Math.floor(100000 + Math.random() * 900000);
            let sendotp = await this.SendOtp(phone, otp);
            const otpdata = await this.otpModel.fetch({ phone });
            if (otpdata?.data?.rows[0]?.otp) {
                await this.otpModel.deleteEntity("auth", "otp", "otp_id", otpdata?.data?.rows[0].otp_id);
            }
            await this.otpModel.createEntity({ phone, otp }, "auth", "otp", "otp_id");
            let data = sendotp?.data?.type;
            console.log("send otp", sendotp);
            resModel.info = "OTP sent.";
            resModel.data = { data };
            resModel.endDT = new Date();
            resModel.status = 1;
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            return res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : createUser`);
            return res.status(constants_util_1.Constants.HTTP_INTERNAL_SERVER_ERROR).json(resModel);
        }
    }
    async updateUser(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            resModel = await this.vendorModel.updateEntity("users", "users_master", { user_id: req.params.id }, payload);
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
exports.VendorController = VendorController;
