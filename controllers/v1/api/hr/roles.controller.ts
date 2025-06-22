import { Request, Response } from "express";
import { Constants } from "../../../../utils/constants.util";
import { ResponseEntity } from "../../../../entities/core/response.entity";
import MasterController from "../../../master.controller";
import { RolesModel } from "../../../../models/v1/hr/roles.model";

export class RolesController extends MasterController {

    private rolesModel: RolesModel;

    constructor() {
        super();

        this.rolesModel = new RolesModel();

        // bindings
        this.fetchRole = this.fetchRole.bind(this);
        this.createRole = this.createRole.bind(this);
        this.updateRole = this.updateRole.bind(this);
        this.deleteRole = this.deleteRole.bind(this);
    }

    async fetchRole(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        let params;
        try {
            params = req.query;
            resModel = await this.rolesModel.fetch(params);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);
        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchRole`);
        }
    }

    async createRole(req: Request, res: Response) {
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

            resModel = await this.rolesModel.createEntity(payload, "hr", "roles", "role_id");

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : rolesController`);
        }
    }

    async updateRole(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        let payload;
        try {
            payload = req.body;

            resModel = await this.rolesModel.updateEntity("hr", "roles", { role_id: req.params.id }, payload);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : updateRole`);
        }
    }

    async deleteRole(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity }
        try {
            resModel = await this.rolesModel.deleteEntity("hr", "roles", "role_id", req.params.id);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : deleteRole`);
        }
    }
}
