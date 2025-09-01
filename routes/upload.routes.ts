import { Router } from "express";
import multer from 'multer';
import { AWSUploadController } from "../controllers/v1/api/upload/aws.upload.cotroller";

const fileSizeLimit = 15 * 1024 * 1024;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: fileSizeLimit } });

export class UploadRoutes {
  public readonly router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  private routes(): void {

    // controllers
    const awsUploadController = new AWSUploadController();

    // user routes
    this.router.post(`/`, upload.single('file'), awsUploadController.uploadSingleFile);
  }
}