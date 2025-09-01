"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadRoutes = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const aws_upload_cotroller_1 = require("../controllers/v1/api/upload/aws.upload.cotroller");
const fileSizeLimit = 15 * 1024 * 1024;
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage, limits: { fileSize: fileSizeLimit } });
class UploadRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        // controllers
        const awsUploadController = new aws_upload_cotroller_1.AWSUploadController();
        // user routes
        this.router.post(`/`, upload.single('file'), awsUploadController.uploadSingleFile);
    }
}
exports.UploadRoutes = UploadRoutes;
