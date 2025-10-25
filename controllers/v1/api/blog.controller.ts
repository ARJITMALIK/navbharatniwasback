import { Request, Response } from "express";
import { Constants } from "../../../utils/constants.util";
import { ResponseEntity } from "../../../entities/core/response.entity";
import MasterController from "../../master.controller";
import { BlogModel } from "../../../models/v1/blog.mode";

export class BlogController extends MasterController {

    private blogModel: BlogModel;

    constructor() {
        super();

        this.blogModel = new BlogModel();

        // bindings
        this.fetchblog = this.fetchblog.bind(this);
        this.createblog = this.createblog.bind(this);
        this.updateblog = this.updateblog.bind(this);
        this.deleteblog = this.deleteblog.bind(this);
    }

    async fetchblog(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        let params;
        try {
            params = req.query;
            resModel = await this.blogModel.fetch(params);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);
        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchblog`);
        }
    }

 // In your BlogController.ts file

// In your BlogController.ts

// NO NEED for multer or s3 utils here.

async createblog(req: Request, res: Response) {
    const startMS = new Date().getTime();
    let resModel = { ...ResponseEntity };
    let payload;
    try {
        payload = req.body;

        // --- VALIDATION (Still important) ---
        // Ensure 'title' and 'content' keys exist.
        const verifyKeys = this.verifyKeys(req.body, ['title', 'content']);
        if (verifyKeys.length !== 0) {
            resModel.status = -9;
            resModel.info = "error: Missing keys: " + verifyKeys;
            return res.status(Constants.HTTP_BAD_REQUEST).json(resModel);
        }

        // Check that title is not empty and content is an array
        if (!payload.title || !Array.isArray(payload.content)) {
            resModel.status = -9;
            resModel.info = "error: 'title' cannot be empty and 'content' must be an array.";
            return res.status(Constants.HTTP_BAD_REQUEST).json(resModel);
        }

        // --- PREPARE PAYLOAD FOR DATABASE ---
        // The content array, which now contains S3 URLs, must be stringified
        // to be saved in your JSONB column.
        if (payload.content) {
            payload.content = JSON.stringify(payload.content);
        }
        
        // The image property on the main blog object should probably be the S3 URL of the main featured image.
        // We'll assume the frontend sends this.
        
        // Now, we pass the final payload to your model function.
        resModel = await this.blogModel.createEntity(payload, "property", "blog_master", "blog_id");

        resModel.endDT = new Date();
        resModel.tat = (new Date().getTime() - startMS) / 1000;
        res.status(Constants.HTTP_OK).json(resModel);

    } catch (error) {
        resModel.status = -9;
        resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
        this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : blogController`);
    }
}

    async updateblog(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        let payload;
        try {
            payload = req.body;

            // --- THIS IS THE KEY ADDITION ---
            // Your frontend will send the 'content' field as a JavaScript array.
            // We must convert it to a JSON string before passing it to the database model,
            // just like you do in the createblog function.
            if (payload.content && Array.isArray(payload.content)) {
                payload.content = JSON.stringify(payload.content);
            }
            // --- END OF ADDITION ---

            resModel = await this.blogModel.updateEntity("property", "blog_master", { blog_id: req.params.id }, payload);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : updateblog`);
        }
    }

    async deleteblog(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity }
        try {
            resModel = await this.blogModel.deleteEntity("property", "blog_master", "blog_id", req.params.id);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : deleteblog`);
        }
    }
}
