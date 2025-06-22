"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestrauntsModel = void 0;
const query_entity_1 = require("../../../entities/core/query.entity");
const response_entity_1 = require("../../../entities/core/response.entity");
const constants_util_1 = require("../../../utils/constants.util");
const master_model_1 = __importDefault(require("../../master.model"));
class RestrauntsModel extends master_model_1.default {
    constructor() {
        super();
    }
    async fetch(params, limit = 1) {
        const startMS = new Date().getTime();
        const resModel = { ...response_entity_1.ResponseEntity };
        let queryModel = { ...query_entity_1.QueryEntity };
        let query = 'SELECT r.*, v.vendor_phone FROM restraunts.restraunt_master r JOIN restraunts.vendor_master v ON v.vendor_id = r.vendor_id  WHERE ';
        const values = [];
        let index = 1;
        try {
            // filter with res_id
            if (params.vendor_id) {
                query += `r.vendor_id = $${index} AND `;
                values.push(params.vendor_id);
                index += 1;
            }
            if (params.station_code) {
                query += `station_code = $${index} AND `;
                values.push(params.station_code);
                index += 1;
            }
            if (params.verified) {
                query += `verified = $${index} AND `;
                values.push(params.verified);
                index += 1;
            }
            if (params.outlet_id) {
                query += `outlet_id = $${index} AND `;
                values.push(params.outlet_id);
                index += 1;
            }
            if (params.status) {
                query += `status = $${index} AND `;
                values.push(params.status);
                index += 1;
            }
            // filter with status
            if (params.status && params.status.length > 0) {
                const statusArray = params.status.split(',').map((status) => status);
                const placeholders = statusArray.map(() => `$${index++}`).join(', ');
                query += `status IN (${placeholders}) AND `;
                values.push(...params.status);
            }
            // filter with verified
            if (params.verified && params.verified.length > 0) {
                const verifyArray = params.verified.split(',').map((verified) => verified);
                const placeholders = verifyArray.map(() => `$${index++}`).join(', ');
                query += `verified IN (${placeholders}) AND `;
                values.push(...params.verified);
            }
            // Parse operating_days query parameter
            if (params.operating_days) {
                // Step 1: Split the query parameter string by commas
                const operatingDaysArray = params.operating_days.split(',').map((day) => day.trim() === 'true');
                // Step 2: Check if the array has exactly 7 values
                if (operatingDaysArray.length === 7) {
                    operatingDaysArray.forEach((day, i) => {
                        // Dynamically add conditions to check for specific days
                        if (day) {
                            query += `closing_days[${i + 1}] = TRUE AND `;
                        }
                    });
                }
            }
            // filter with opening_time
            if (params.opening_time) {
                query += `opening_time >= $${index} AND `;
                values.push(params.opening_time);
                index += 1;
            }
            // filter with closing_time
            if (params.closing_time) {
                query += `closing_time <= $${index} AND `;
                values.push(params.closing_time);
                index += 1;
            }
            // search filter
            if (params.search) {
                query += `(location LIKE $${index}) AND `;
                values.push(`%${params.search}%`);
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
            this.logger.error(`DB Fetch Error: ${query} - Error: ${JSON.stringify(error)}`, 'restrauntsModel: fetch');
        }
        finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }
        return resModel;
    }
    async fetchStats(params) {
        const startMS = new Date().getTime();
        const resModel = { ...response_entity_1.ResponseEntity };
        let queryModel = { ...query_entity_1.QueryEntity };
        try {
            // Build the base query with conditional filters
            const values = [];
            // Build the stats query to get all counts in a single query for better performance
            const query = `
            SELECT
                COUNT(*) AS total_outlets,
                SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) AS closed_outlets,
                SUM(CASE WHEN status != 0 AND closing_period IS NULL THEN 1 ELSE 0 END) AS active_outlets,
                SUM(CASE WHEN status != 0 AND closing_period IS NOT NULL THEN 1 ELSE 0 END) AS inactive_outlets
            FROM restraunts.restraunt_master
        `;
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
            this.logger.error(`DB Fetch Error: ${JSON.stringify(error)}`, 'restrauntsModel: fetch');
        }
        finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }
        return resModel;
    }
}
exports.RestrauntsModel = RestrauntsModel;
