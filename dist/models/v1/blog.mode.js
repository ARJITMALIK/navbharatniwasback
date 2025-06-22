"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogModel = void 0;
const query_entity_1 = require("../../entities/core/query.entity");
const response_entity_1 = require("../../entities/core/response.entity");
const constants_util_1 = require("../../utils/constants.util");
const master_model_1 = __importDefault(require("../master.model"));
class BlogModel extends master_model_1.default {
    constructor() {
        super();
    }
    async fetch(params, limit = 1) {
        const startMS = new Date().getTime();
        const resModel = { ...response_entity_1.ResponseEntity };
        let queryModel = { ...query_entity_1.QueryEntity };
        let query = 'SELECT * FROM property.blog_master WHERE ';
        const values = [];
        let index = 1;
        try {
            // filter with zone_id
            if (params.blog_id) {
                query += `blog_id = $${index} AND `;
                values.push(params.blog_id);
                index += 1;
            }
            // filter with status
            if (params.status && params.status.length > 0) {
                const placeholders = params.status.map(() => `$${index++}`).join(', ');
                query += `status IN (${placeholders}) AND `;
                values.push(...params.status);
            }
            // search filter
            if (params.search) {
                query += `(s.name LIKE $${index + 1})`;
                values.push(`%${params.search}%`);
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
            this.logger.error(`DB Fetch Error: ${query} - Error: ${JSON.stringify(error)}`, 'blogModel: fetch');
        }
        finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }
        return resModel;
    }
}
exports.BlogModel = BlogModel;
