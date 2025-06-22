"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const constants_util_1 = require("../utils/constants.util");
const logger_util_1 = __importDefault(require("../utils/logger.util"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const response_entity_1 = require("../entities/core/response.entity");
class AuthMiddleware {
    constructor() {
        this.logger = new logger_util_1.default();
        this.permissionsModel = new PermissionsModel();
        // bindings
        this.checkAuth = this.checkAuth.bind(this);
        this.checkPermission = this.checkPermission.bind(this);
    }
    async checkAuth(req, res, next) {
        let resModel = { ...response_entity_1.ResponseEntity };
        const startMS = new Date().getTime();
        try {
            const authHeaders = req.headers['authorization'];
            const clientAccessToken = authHeaders && authHeaders.split(' ')[1];
            if (!clientAccessToken) {
                resModel.status = constants_util_1.Constants.AUTH_KEY_NOT_PASSED;
                resModel.info = "ERROR: AUTH error: SUCCESS: 0, status: UNAUTHORIZED";
                resModel.endDT = new Date();
                resModel.tat = (new Date().getTime() - startMS) / 1000;
                return res.status(constants_util_1.Constants.HTTP_UNAUTHORIZED).json(resModel);
            }
            const secret = process.env.SECRET_KEY;
            const decoded = jsonwebtoken_1.default.verify(clientAccessToken, secret);
            // Store the decoded token in `res.locals.user` for later use
            res.locals.user = decoded;
            next();
        }
        catch (error) {
            this.logger.error(error, "checkAuth: Middleware");
            resModel.status = constants_util_1.Constants.AUTH_ERROR;
            resModel.info = "ERROR: AUTH error: SUCCESS: 0, status: UNAUTHORIZED";
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            return res.status(constants_util_1.Constants.HTTP_UNAUTHORIZED).json(resModel);
        }
    }
    checkPermission(entity, action) {
        return async (req, res, next) => {
            let resModel = { ...response_entity_1.ResponseEntity };
            const startMS = new Date().getTime();
            try {
                // Ensure the user is authenticated and their role ID is available
                const user = res.locals.user;
                if (!user || !user.role_id) {
                    throw new Error("Unauthorized: Missing role_id");
                }
                const roleId = user.role_id;
                // Query permissions for the given role, entity (table), and action
                const permissions = await this.permissionsModel.fetch({
                    role_id: roleId,
                    permission: entity,
                });
                if (!permissions || permissions.data.rowCount === 0) {
                    throw new Error(`Forbidden: Role ${roleId} has no permissions for ${entity}`);
                }
                const permission = permissions.data.rows[0];
                if (!permission[action]) {
                    throw new Error(`Forbidden: Role ${roleId} is not allowed to perform ${action} on ${entity}`);
                }
                next();
            }
            catch (error) {
                this.logger.error(error, "checkPermission: Middleware");
                resModel.status = constants_util_1.Constants.HTTP_FORBIDDEN;
                resModel.info = `ERROR: AUTH error: ${error.message}`;
                resModel.endDT = new Date();
                resModel.tat = (new Date().getTime() - startMS) / 1000;
                return res.status(constants_util_1.Constants.HTTP_FORBIDDEN).json(resModel);
            }
        };
    }
}
exports.AuthMiddleware = AuthMiddleware;
