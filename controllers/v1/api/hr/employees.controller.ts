import { Request, Response } from "express";
import { Constants } from "../../../../utils/constants.util";
import { ResponseEntity } from "../../../../entities/core/response.entity";
import MasterController from "../../../master.controller";
import { RolesModel } from "../../../../models/v1/hr/roles.model";
import { EmployeeModel } from "../../../../models/v1/hr/employee.model";

export class EmployeesController extends MasterController {

    private employeesModel: EmployeeModel;

    constructor() {
        super();

        this.employeesModel = new EmployeeModel();

        // bindings
        this.fetchEmployee = this.fetchEmployee.bind(this);
        this.createEmployee = this.createEmployee.bind(this);
        this.updateEmployee = this.updateEmployee.bind(this);
        this.deleteEmployee = this.deleteEmployee.bind(this);
    }

    async fetchEmployee(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        let params;
        try {
            params = req.query;
            resModel = await this.employeesModel.fetch(params);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);
        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchEmployee`);
        }
    }

    async createEmployee(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        let payload;
        try {
            payload = req.body;
            resModel = await this.employeesModel.createEntity(payload, "hr", "employees", "emp_id");
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : employeesController`);
        }
    }

    async updateEmployee(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        let payload;
        try {
            payload = req.body;
            resModel = await this.employeesModel.updateEntity("hr", "employees", { emp_id: req.params.id }, payload);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : updateEmployee`);
        }
    }

    async deleteEmployee(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity }
        try {
            resModel = await this.employeesModel.deleteEntity("hr", "employees", "emp_id", req.params.id);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : deleteEmployee`);
        }
    }
}
