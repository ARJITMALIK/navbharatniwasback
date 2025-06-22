"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StationsModel = void 0;
const query_entity_1 = require("../../../entities/core/query.entity");
const response_entity_1 = require("../../../entities/core/response.entity");
const constants_util_1 = require("../../../utils/constants.util");
const master_model_1 = __importDefault(require("../../master.model"));
class StationsModel extends master_model_1.default {
    constructor() {
        super();
    }
    async fetch(params, limit = 1) {
        const startMS = new Date().getTime();
        const resModel = { ...response_entity_1.ResponseEntity };
        let queryModel = { ...query_entity_1.QueryEntity };
        // Fix the query to properly include restaurant join results
        let query = `
            SELECT 
                s.*,
                COALESCE(ARRAY_AGG(r.outlet_name) FILTER (WHERE r.outlet_name IS NOT NULL), '{}') AS outlet_names,
                COUNT(r.outlet_id) AS outlet_count
            FROM 
                stations.stations_master s
            LEFT JOIN 
                restraunts.restraunt_master r ON s.station_code = r.station_code
            WHERE `;
        const values = [];
        let index = 1;
        try {
            // filter with station_id
            if (params.station_id) {
                query += `s.station_id = $${index} AND `;
                values.push(params.station_id);
                index += 1;
            }
            // filter with name
            if (params.station_name) {
                query += `s.station_name = $${index} AND `;
                values.push(params.station_name);
                index += 1;
            }
            // filter with code
            if (params.station_code) {
                query += `s.station_code = $${index} AND `;
                values.push(params.station_code);
                index += 1;
            }
            // filter with status
            if (params.status && params.status.length > 0) {
                const placeholders = params.status.map(() => `$${index++}`).join(', ');
                query += `s.status IN (${placeholders}) AND `;
                values.push(...params.status);
            }
            // search filter
            if (params.search) {
                query += `(s.station_name LIKE $${index} OR s.location LIKE $${index}) AND `;
                values.push(`%${params.search}%`);
                index += 1;
            }
            // Remove trailing 'AND' or 'WHERE' if no conditions are applied
            query = query.endsWith('WHERE ') ? query.slice(0, -6) : query.slice(0, -4);
            // Add GROUP BY since we're using aggregate functions
            query += ` GROUP BY s.station_id, s.station_code, s.station_name, s.status`;
            // sorting
            if (params.sorting_type && params.sorting_field) {
                query += ` ORDER BY ${params.sorting_field} ${params.sorting_type}`;
            }
            else {
                // Default sorting
                query += ` ORDER BY s.station_id`;
            }
            // pagination
            if (params.limit) {
                query += ` LIMIT $${index} OFFSET $${index + 1}`;
                values.push(parseInt(params.limit), parseInt(params.page || 0) * parseInt(params.limit));
            }
            // For debugging - log the query
            this.logger.info(`Station query: ${query}`, 'stationsModel: fetch');
            this.logger.info(`Station query params: ${JSON.stringify(values)}`, 'stationsModel: fetch');
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
            this.logger.error(`DB Fetch Error: ${query} - Error: ${JSON.stringify(error)}`, 'stationsModel: fetch');
        }
        finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }
        return resModel;
    }
}
exports.StationsModel = StationsModel;
