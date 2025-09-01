"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const postgres_database_1 = require("./database/postgres.database");
const server_routes_1 = require("./routes/server.routes");
const logger_util_1 = __importDefault(require("./utils/logger.util"));
const upload_routes_1 = require("./routes/upload.routes");
dotenv_1.default.config();
class App {
    constructor() {
        this.SERVER_PORT = process.env.SERVER_PORT || 5004;
        this.app = (0, express_1.default)();
        this.logger = new logger_util_1.default();
        this.middlewares();
        this.routes();
        this.initializServer();
    }
    middlewares() {
        postgres_database_1.usersDBPool;
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json({ limit: '100mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true }));
    }
    routes() {
        this.app.use("/api/v1/", new server_routes_1.Routes().router);
        this.app.use("/api/v1/uploads", new upload_routes_1.UploadRoutes().router);
    }
    initializServer() {
        // Start listening on the server (both Express and Socket.IO)
        this.app.listen(this.SERVER_PORT, () => {
            this.logger.info(`Server is running on http://localhost:${this.SERVER_PORT}`, 'App.listen');
        });
    }
}
exports.default = new App().app;
