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
        // --- CHANGE #1: Updated column name here ---
        let query = `
            SELECT 
                dd.*, 
                dm.draw_name, 
                dm.opening_date_time, 
                dm.active,
                am.name AS advisor_name  
            FROM 
                property.draw_draft dd 
            JOIN 
                property.draw_master dm ON dd.draw_id = dm.draw_id
            LEFT JOIN 
                property.advisor_master am ON dd.adv_id = am.adv_id
            WHERE 
        `;
        const values = [];
        let index = 1;
        try {
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
            if (params.approved && params.approved.length > 0) {
                const placeholders = params.approved.map(() => `$${index++}`).join(', ');
                query += `dd.approved IN (${placeholders}) AND `;
                values.push(...params.approved);
            }
            if (params.search) {
                query += `(dd.name LIKE $${index} OR dd.phone LIKE $${index}) AND `;
                values.push(`%${params.search}%`);
                index += 1;
            }
            if (query.endsWith('WHERE ')) {
                query = query.slice(0, -6);
            }
            else {
                query = query.slice(0, -5);
            }
            // sorting
            if (params.sorting_type && params.sorting_field) {
                // --- CHANGE #2: Updated column name in the allowed list ---
                const allowedSortFields = ['ticket_id', 'name', 'opening_date_time', 'draw_name'];
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
    // --- NEW METHOD ---
    /**
     * Fetches all winning records from the same draws that a specific user has won in.
     * @param user_id The ID of the user to check winnings for.
     */
    async fetchWinnersByDrawsOfUser(user_id) {
        const startMS = new Date().getTime();
        const resModel = { ...response_entity_1.ResponseEntity };
        let queryModel = { ...query_entity_1.QueryEntity };
        // This advanced query does the following:
        // 1. The subquery `(SELECT DISTINCT draw_id ...)` finds all the draw IDs where the given user_id has a winning ticket.
        // 2. The main query then selects ALL winning tickets (from any user) that belong to those specific draw IDs.
        const query = `
            SELECT 
                dd.*, 
                dm.draw_name, 
                dm.opening_date_time, 
                dm.active,
                am.name AS advisor_name  
            FROM 
                property.draw_draft dd 
            JOIN 
                property.draw_master dm ON dd.draw_id = dm.draw_id
            LEFT JOIN 
                property.advisor_master am ON dd.adv_id = am.adv_id
            WHERE 
                dd.alloted = TRUE 
            AND 
                dd.draw_id IN (
                    SELECT DISTINCT draw_id FROM property.draw_draft WHERE user_id = $1 AND alloted = TRUE
                )
            ORDER BY dm.opening_date_time DESC, dd.ticket_id ASC
        `;
        const values = [user_id];
        try {
            queryModel = await this.sql.executeQuery(query, values);
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
            this.logger.error(`DB Fetch Error: ${query} - Error: ${JSON.stringify(error)}`, 'DraftModel: fetchWinnersByDrawsOfUser');
        }
        finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }
        return resModel;
    }
    // --- NEW METHOD FOR PROFILE PAGE ---
    /**
     * Fetches the latest profile information for a specific user.
     * @param user_id The ID of the user whose profile is to be fetched.
     */
    async fetchProfileByUserId(user_id) {
        const startMS = new Date().getTime();
        const resModel = { ...response_entity_1.ResponseEntity };
        let queryModel = { ...query_entity_1.QueryEntity };
        // This query is optimized to get only the necessary fields
        // from the user's most recent draft submission.
        const query = `
            SELECT 
                name,
                email,
                phone,
                profile_image,
                father_name
            FROM 
                property.draw_draft
            WHERE 
                user_id = $1
            ORDER BY 
                ticket_id DESC  -- Assuming higher ticket_id is more recent
            LIMIT 1;            -- Fetches only the single most recent record
        `;
        const values = [user_id];
        try {
            queryModel = await this.sql.executeQuery(query, values);
            if (queryModel.status === constants_util_1.Constants.SUCCESS) {
                resModel.status = queryModel.status;
                resModel.info = `OK: DB Query: ${queryModel.info}`;
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
            this.logger.error(`DB Fetch Error: ${query} - Error: ${JSON.stringify(error)}`, 'DraftModel: fetchProfileByUserId');
        }
        finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }
        return resModel;
    }
}
exports.DraftModel = DraftModel;
