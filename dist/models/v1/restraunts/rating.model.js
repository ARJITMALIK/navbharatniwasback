"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingModel = void 0;
const query_entity_1 = require("../../../entities/core/query.entity");
const response_entity_1 = require("../../../entities/core/response.entity");
const constants_util_1 = require("../../../utils/constants.util");
const master_model_1 = __importDefault(require("../../master.model"));
class RatingModel extends master_model_1.default {
    constructor() {
        super();
    }
    async fetch(params, limit = 1) {
        const startMS = new Date().getTime();
        const resModel = { ...response_entity_1.ResponseEntity };
        let queryModel = { ...query_entity_1.QueryEntity };
        let query = 'SELECT r.*, u.first_name, u.last_name, o.outlet_name, od.oid FROM restraunts.reviews r JOIN users.users_master u ON r.user_id = u.user_id LEFT JOIN restraunts.restraunt_master o ON o.outlet_id = r.res_id LEFT JOIN orders.orders_master od ON od.oid = r.order_id WHERE ';
        const values = [];
        let index = 1;
        try {
            // filter with rating_id
            if (params.rating_id) {
                query += `r.rating_id = $${index} AND `;
                values.push(params.rating_id);
                index += 1;
            }
            // filter with rating_high
            if (params.rating_high) {
                query += `r.rating > $${index} AND `;
                values.push(params.rating_high);
                index += 1;
            }
            // filter with rating_low
            if (params.rating_low) {
                query += `r.rating < $${index} AND `;
                values.push(params.rating_low);
                index += 1;
            }
            // filter with rating_id
            if (params.rating_id) {
                query += `r.rating_id = $${index} AND `;
                values.push(params.rating_id);
                index += 1;
            }
            if (params.res_id) {
                query += `r.res_id = $${index} AND `;
                values.push(params.res_id);
                index += 1;
            }
            if (params.user_id) {
                query += `r.user_id = $${index} AND `;
                values.push(params.user_id);
                index += 1;
            }
            // filter with order_id
            if (params.order_id) {
                query += `r.order_id = $${index} AND `;
                values.push(params.order_id);
                index += 1;
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
            if (queryModel.status === constants_util_1.Constants.SUCCESS) {
                resModel.status = queryModel.status;
                resModel.info = `OK: DB Query: ${queryModel.info} : ${queryModel.tat} : ${queryModel.message}`;
                resModel.data = queryModel;
            }
            else {
                resModel.status = constants_util_1.Constants.ERROR;
                resModel.info = `ERROR: DB Query: ${JSON.stringify(queryModel)}`;
            }
        }
        catch (error) {
            resModel.status = -33;
            resModel.info = `catch : ${resModel.info} : ${JSON.stringify(error)}`;
            this.logger.error(`DB Fetch Error: ${query} - Error: ${JSON.stringify(error)}`, 'ratingModel: fetch');
        }
        finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }
        return resModel;
    }
}
exports.RatingModel = RatingModel;
