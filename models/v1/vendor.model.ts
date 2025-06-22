import { QueryEntity } from "../../entities/core/query.entity";
import { ResponseEntity } from "../../entities/core/response.entity";
import { Constants } from "../../utils/constants.util";
import MasterModel from "../master.model";

export class VendorModel extends MasterModel {

    constructor() {
        super();
    }

    async fetch(params: any, limit: number = 1) {
        const startMS = new Date().getTime();
        const resModel = { ...ResponseEntity };
        let queryModel = { ...QueryEntity };
        let query = 'SELECT * FROM auth.user_master WHERE ';
        const values: any[] = [];
        let index = 1;

        try {
            // filter with role_id
            if (params.user_id) {
                query += `vendor_id = $${index} AND `;
                values.push(params.vendor_id);
                index += 1;
            }

            // filter with name
            if (params.phone) {
                query += `phone = $${index} AND `;
                values.push(params.phone);
                index += 1;
            }

         
            // search filter
            if (params.search) {
                query += `(name LIKE $${index + 1}) AND (color LIKE $${index + 1})`;
                values.push(`%${params.search}%`, `%${params.search}%`);
                index += 2;
            }

            // Remove trailing 'AND' or 'WHERE' if no conditions are applied
            query = query.endsWith('WHERE ') ? query.slice(0, -6) : query.slice(0, -4);

            // sorting
            if (params.sorting_type && params.sorting_field) {
                query += ` ORDER BY ${params.sorting_field} ${params.sorting_type}`;
            }

            // pagination
            if (params.limit) {
                query += ` LIMIT $${index} OFFSET $${index + 1}`;
                values.push(parseInt(params.limit), parseInt(params.page || 0) * parseInt(params.limit));
            }

            // Execute the query
            queryModel = await this.sql.executeQuery(query, values);

            // Build the response based on query success or failure
            if (queryModel.status === Constants.SUCCESS) {
                resModel.status = queryModel.status;
                resModel.info = `OK: DB Query: ${queryModel.info} : ${queryModel.tat} : ${queryModel.message}`;
                resModel.data = queryModel;
            } else {
                resModel.status = Constants.ERROR;
                resModel.info = `ERROR: DB Query: ${JSON.stringify(queryModel)}`;
            }
        } catch (error) {
            resModel.status = -33;
            resModel.info = `catch : ${resModel.info} : ${JSON.stringify(error)}`;
            this.logger.error(`DB Fetch Error: ${query} - Error: ${JSON.stringify(error)}`, 'vendorModel: fetch');
        } finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }

        return resModel;
    }
    

 

}
