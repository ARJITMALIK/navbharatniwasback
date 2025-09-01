import { Response } from "express";
import multer from 'multer';

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import MasterController from "../../../master.controller";
import { ResponseEntity } from "../../../../entities/core/response.entity";
import { Constants } from "../../../../utils/constants.util";

export class AWSUploadController extends MasterController {

    constructor() {
        super();

        //bindings
        this.uploadSingleFile = this.uploadSingleFile.bind(this);
    }

    async uploadSingleFile(req: any, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };

        try {
            const file = req.file;

            if (!file) {
                throw new Error("File not uploaded");
            }

            // Define the S3 upload parameters for dump files --------------------------
            const fileName = `${Date.now()}-${file.originalname}`;
            const uploadParams = {
                Bucket: process.env.AWS_BUCKET_NAME!,        // S3 Bucket name
                Key: fileName,                               // File name in S3
                Body: file.buffer,                           // File buffer from multer
                ContentType: file.mimetype,                  // Content type
            };

            // Initialize S3 Client (for SDK v3)
            const s3Client = new S3Client({
                region: process.env.AWS_REGION!,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
                }
            });

            const command = new PutObjectCommand(uploadParams);

            await s3Client.send(command);

            resModel.data = {
                fileName: file.originalname,
                fileUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`,
                key: file.filename,
            };

            resModel.status = 1;
            resModel.info = "File uploaded successfully";

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);
        } catch (error) {
            if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
                resModel.status = -9;
                resModel.info = "File size exceeds the limit";
            } else {
                resModel.status = -9;
                resModel.info = `Error: ${error.message}`;
            }

            this.logger.error(JSON.stringify(resModel), 'uploadSingleFile : AWSUploadController');
            return res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json(resModel);
        }
    }
}