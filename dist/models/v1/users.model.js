"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModel = void 0;
const query_entity_1 = require("../../entities/core/query.entity");
const response_entity_1 = require("../../entities/core/response.entity");
const constants_util_1 = require("../../utils/constants.util");
const master_model_1 = __importDefault(require("../master.model"));
class UsersModel extends master_model_1.default {
    constructor() {
        super();
    }
    async fetch(params, limit = 1) {
        const startMS = new Date().getTime();
        const resModel = { ...response_entity_1.ResponseEntity };
        let queryModel = { ...query_entity_1.QueryEntity };
        let query = 'SELECT user_id, email, first_name, last_name, profile_picture, role_id, created_at, updated_at, status FROM users.users_master WHERE ';
        const values = [];
        let index = 1; // To keep track of placeholder positions dynamically
        try {
            // filter with user_id
            if (params.user_id) {
                query += `user_id = $${index} AND `;
                values.push(params.user_id);
                index += 1;
            }
            // filter with role_id
            if (params.role_id) {
                query += `role_id = $${index} AND `;
                values.push(params.role_id);
                index += 1;
            }
            // filter with email
            if (params.email) {
                query += `email = $${index} AND `;
                values.push(params.email);
                index += 1;
            }
            // filter with first_name
            if (params.first_name) {
                query += `first_name = $${index} AND `;
                values.push(params.first_name);
                index += 1;
            }
            // filter with last_name
            if (params.last_name) {
                query += `last_name = $${index} AND `;
                values.push(params.last_name);
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
                query += `(first_name LIKE $${index + 1}) AND `;
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
            this.logger.error(`DB Fetch Error: ${query} - Error: ${JSON.stringify(error)}`, 'userModel: fetch');
        }
        finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }
        return resModel;
    }
    async fetchWithProfileAndRole(params, limit = 1) {
        const startMS = new Date().getTime();
        const resModel = { ...response_entity_1.ResponseEntity };
        let queryModel = { ...query_entity_1.QueryEntity };
        let query = `
    SELECT 
        um.email, 
        um.password, 
        um.first_name, 
        um.last_name, 
        um.profile_picture, 
        um.role_id,
        r.name AS role_name
    FROM users.users_master um
    LEFT JOIN auth.roles r ON um.role_id = r.role_id
    WHERE `;
        const values = [];
        let index = 1; // To keep track of placeholder positions dynamically
        try {
            // filter with email
            if (params.email) {
                query += `um.email = $${index} AND `;
                values.push(params.email);
                index += 1;
            }
            // filter with role_id
            if (params.role_id) {
                query += `um.role_id = $${index} AND `;
                values.push(params.role_id);
                index += 1;
            }
            // search filter
            if (params.search) {
                query += `(um.first_name LIKE $${index} OR um.last_name LIKE $${index + 1} OR um.email LIKE $${index + 2}) AND `;
                values.push(`%${params.search}%`, `%${params.search}%`, `%${params.search}%`);
                index += 3;
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
            this.logger.error(`DB Fetch Error: ${query} - Error: ${JSON.stringify(error)}`, 'userModel: fetch');
        }
        finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }
        return resModel;
    }
    async fetchUserWithPassword(params, limit = 1) {
        const startMS = new Date().getTime();
        const resModel = { ...response_entity_1.ResponseEntity };
        let queryModel = { ...query_entity_1.QueryEntity };
        let query = `
    SELECT 
        um.email, 
        um.password,
        um.role_id,
        um.first_name,
        um.last_name,
        um.profile_picture
    FROM users.users_master um
    WHERE `; // Start filtering here
        const values = [];
        let index = 1; // To keep track of placeholder positions dynamically
        try {
            // filter with email
            if (params.email) {
                query += `um.email = $${index} AND `;
                values.push(params.email);
                index += 1;
            }
            // Remove trailing 'AND' or 'WHERE' if no conditions are applied
            query = query.endsWith('WHERE ') ? query.slice(0, -6) : query.slice(0, -4);
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
            this.logger.error(`DB Fetch Error: ${query} - Error: ${JSON.stringify(error)}`, 'userModel: fetchWithPassword');
        }
        finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }
        return resModel;
    }
}
exports.UsersModel = UsersModel;
