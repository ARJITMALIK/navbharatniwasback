"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DraftModel = void 0;
const query_entity_1 = require("../../entities/core/query.entity");
const response_entity_1 = require("../../entities/core/response.entity");
const constants_util_1 = require("../../utils/constants.util");
const master_model_1 = __importDefault(require("../master.model"));
class DraftModel extends master_model_1.default {
    constructor() {
        super();
    }
    async fetch(params, limit = 1) {
        const startMS = new Date().getTime();
        const resModel = { ...response_entity_1.ResponseEntity };
        let queryModel = { ...query_entity_1.QueryEntity };
        let query = 'SELECT dd.*, dm.draw_name, dm.opening_date, dm.active FROM property.draw_draft dd JOIN property.draw_master dm ON dd.draw_id = dm.draw_id WHERE ';
        const values = [];
        let index = 1;
        try {
            // =====================================================================
            // FIX #1: Add filtering for draft_type
            // This handles both a single value (e.g., 1) or an array (e.g., [1, 3])
            // =====================================================================
            if (params.draft_type) {
                if (Array.isArray(params.draft_type) && params.draft_type.length > 0) {
                    const placeholders = params.draft_type.map(() => `$${index++}`).join(', ');
                    query += `dd.draft_type IN (${placeholders}) AND `;
                    values.push(...params.draft_type);
                }
                else {
                    query += `dd.draft_type = $${index} AND `;
                    values.push(params.draft_type);
                    index += 1;
                }
            }
            if (params.ticket_id) {
                query += `dd.ticket_id = $${index} AND `;
                values.push(params.ticket_id);
                index += 1;
            }
            if (params.signed) {
                query += `dd.signed = $${index} AND `;
                values.push(params.signed);
                index += 1;
            }
            if (params.alloted) {
                query += `dd.alloted = $${index} AND `;
                values.push(params.alloted);
                index += 1;
            }
            if (params.allotment_done) {
                query += `dd.allotment_done = $${index} AND `;
                values.push(params.allotment_done);
                index += 1;
            }
            if (params.user_id) {
                query += `dd.user_id = $${index} AND `;
                values.push(params.user_id);
                index += 1;
            }
            // =====================================================================
            // FIX #2: Corrected logic for a status-like column.
            // I'm assuming you meant to use the 'approved' column. 
            // Change 'approved' if you intended a different column.
            // =====================================================================
            if (params.approved && params.approved.length > 0) {
                const placeholders = params.approved.map(() => `$${index++}`).join(', ');
                query += `dd.approved IN (${placeholders}) AND `;
                values.push(...params.approved);
            }
            // =====================================================================
            // FIX #3: Correct the alias in the search filter from 's' to 'dd'
            // Also, fixed the parameter indexing to be more standard.
            // =====================================================================
            if (params.search) {
                query += `(dd.name LIKE $${index} OR dd.phone LIKE $${index}) AND `; // Search by name or phone
                values.push(`%${params.search}%`);
                index += 1;
            }
            // Remove trailing 'AND ' or 'WHERE '
            if (query.endsWith('WHERE ')) {
                query = query.slice(0, -6); // No conditions were added
            }
            else {
                query = query.slice(0, -5); // Remove the last ' AND '
            }
            // sorting
            if (params.sorting_type && params.sorting_field) {
                // Basic sanitation to prevent SQL injection in ORDER BY
                const allowedSortFields = ['ticket_id', 'name', 'opening_date', 'draw_name'];
                if (allowedSortFields.includes(params.sorting_field)) {
                    query += ` ORDER BY ${params.sorting_field} ${params.sorting_type.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'}`;
                }
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
            this.logger.error(`DB Fetch Error: ${query} - Error: ${JSON.stringify(error)}`, 'siteModel: fetch');
        }
        finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }
        return resModel;
    }
}
exports.DraftModel = DraftModel;
