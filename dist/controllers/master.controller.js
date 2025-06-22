"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_util_1 = __importDefault(require("../utils/logger.util"));
const method_util_1 = __importDefault(require("../utils/method.util"));
class MasterController {
    constructor() {
        this.verifyKeys = (body, data) => {
            var result = [];
            for (const key of data) {
                if (!body.hasOwnProperty(key)) {
                    result.push("Missing key: {" + key + "} from payload");
                }
            }
            return result;
        };
        this.verifyDates = (body, data) => {
            var result = [];
            for (const key of data) {
                if (body.hasOwnProperty(key)) {
                    const value = body[key];
                    if (value !== null && isNaN(Date.parse(value))) {
                        result.push(`Invalid date format for key: ${key}`);
                    }
                }
            }
            return result;
        };
        this.mandatoryFields = (body, data) => {
            var result = [];
            for (const key of data) {
                if (body[key].length == 0) {
                    result.push(key + " is a mandatory field, cannot be empty!");
                }
            }
            return result;
        };
        this.validateField = (data) => {
            /** Check if the name is not null, not empty, and starts with an alphabet */
            return typeof data === 'string' && data.trim() !== '' && /^[a-zA-Z][a-zA-Z0-9_-\s]*$/.test(data);
        };
        this.processField = (data) => {
            /** Remove leading and trailing spaces, replace spaces with underscores, and convert to uppercase */
            return data.trim().replace(/\s+/g, '_').replace(/-/g, '_').toUpperCase();
        };
        this.logger = new logger_util_1.default();
        this.methods = new method_util_1.default();
    }
    generateJwtToken(payload) {
        const token = jsonwebtoken_1.default.sign(payload, process.env.SECRET_KEY, { expiresIn: '10d' });
        return token;
    }
}
exports.default = MasterController;
