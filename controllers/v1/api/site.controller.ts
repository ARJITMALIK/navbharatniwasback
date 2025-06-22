import { Request, Response } from "express";
import { Constants } from "../../../utils/constants.util";
import { ResponseEntity } from "../../../entities/core/response.entity";
import MasterController from "../../master.controller";
import { SiteModel } from "../../../models/v1/site.model";

export class SiteController extends MasterController {

    private SiteModel: SiteModel;

    constructor() {
        super();

        this.SiteModel = new SiteModel();

        // bindings
        this.fetchSite = this.fetchSite.bind(this);
        this.createSite = this.createSite.bind(this);
        this.updateSite = this.updateSite.bind(this);
        this.deleteSite = this.deleteSite.bind(this);
    }

    async fetchSite(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        let params;
        try {
            params = req.query;
            resModel = await this.SiteModel.fetch(params);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);
        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchSite`);
        }
    }

    async createSite(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        let payload;
        try {
            payload = req.body;

            // make sure required keys exist
            const verifyKeys = this.verifyKeys(req.body, ['name']);
            if (verifyKeys.length !== 0) {
                resModel.status = -9;
                resModel.info = "error: Missing keys: " + verifyKeys + " : " + resModel.info;
                return res.status(Constants.HTTP_BAD_REQUEST).json(resModel);
            }

            // make sure required fields are not empty
            const mandatoryFields = this.mandatoryFields(req.body, ['name']);
            if (mandatoryFields.length !== 0) {
                resModel.status = -9;
                resModel.info = "error: Empty fields: " + mandatoryFields + " : " + resModel.info;
                return res.status(Constants.HTTP_BAD_REQUEST).json(resModel);
            }

            resModel = await this.SiteModel.createEntity(payload, "property", "property_master", "pro_id");

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : SiteController`);
        }
    }

    async updateSite(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        let payload;
        try {
            payload = req.body;

            resModel = await this.SiteModel.updateEntity("property", "property_master", { pro_id: req.params.id }, payload);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : updateSite`);
        }
    }

    async deleteSite(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity }
        try {
            resModel = await this.SiteModel.deleteEntity("property", "property_master", "pro_id", req.params.id);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : deleteSite`);
        }
    }
}
