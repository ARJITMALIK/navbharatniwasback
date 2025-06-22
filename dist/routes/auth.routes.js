"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const auth_controller_1 = require("../controllers/v1/auth/auth.controller");
const permissions_controller_1 = require("../controllers/v1/auth/permissions.controller");
class AuthRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        // middlewares
        const authMiddleware = new auth_middleware_1.AuthMiddleware();
        // controllers
        const authController = new auth_controller_1.AuthController();
        const permissionsController = new permissions_controller_1.PermissionsController();
        // auth routes routes
        this.router.post(`/login`, authController.login);
        // permissions
        this.router.get('/permission', authMiddleware.checkAuth, authMiddleware.checkPermission("permissions", "read"), permissionsController.fetchPermissions);
        this.router.post('/permission', authMiddleware.checkAuth, authMiddleware.checkPermission("permissions", "write"), permissionsController.createPermissions);
        this.router.put('/permission/:id', authMiddleware.checkAuth, authMiddleware.checkPermission("permissions", "update"), permissionsController.updatePermissions);
    }
}
exports.AuthRoutes = AuthRoutes;
