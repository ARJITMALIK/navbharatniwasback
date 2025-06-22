"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_database_1 = __importDefault(require("../database/postgres.database"));
const query_entity_1 = require("../entities/core/query.entity");
const response_entity_1 = require("../entities/core/response.entity");
const constants_util_1 = require("../utils/constants.util");
const logger_util_1 = __importDefault(require("../utils/logger.util"));
const method_util_1 = __importDefault(require("../utils/method.util"));
class MasterModel {
    constructor() {
        this.sql = new postgres_database_1.default();
        this.logger = new logger_util_1.default();
        this.methods = new method_util_1.default();
    }
    async createEntity(payload, schema, table, primary_key) {
        const startMS = new Date().getTime();
        const resModel = { ...response_entity_1.ResponseEntity };
        let queryModel = { ...query_entity_1.QueryEntity };
        let query = "";
        try {
            // Prepare column names and values
            const columns = Object.keys(payload);
            const values = Object.values(payload).map((val) => {
                if (val === null || val === undefined) {
                    return "NULL"; // Ensure NULL is correctly inserted
                }
                else if (Array.isArray(val)) {
                    return `ARRAY[${val.map((v) => `'${v}'`).join(", ")}]::text[]`;
                }
                else if (val instanceof Date) {
                    return `'${val.toISOString().split("T")[0]}'::DATE`;
                }
                else if (typeof val === "object") {
                    return `'${JSON.stringify(val)}'::jsonb`;
                }
                else if (typeof val === "number") {
                    return `${val}`; // Avoid wrapping numbers in quotes
                }
                else {
                    return `'${this.methods._SQLTEXT_HANDLE(`${val}`)}'`;
                }
            });
            // Construct the SQL query
            query = `INSERT INTO ${schema}.${table} (${columns.join(", ")}) VALUES (${values.join(", ")}) RETURNING ${primary_key} AS id`;
            // Execute the query
            queryModel = await this.sql.executeQuery(query, []);
            if (queryModel.status == constants_util_1.Constants.SUCCESS) {
                resModel.status = queryModel.status;
                resModel.info =
                    "OK: DB Query: " +
                        queryModel.info +
                        " : " +
                        queryModel.tat +
                        " : " +
                        queryModel.message;
                resModel.data = queryModel;
            }
            else {
                resModel.status = constants_util_1.Constants.ERROR;
                resModel.info = "ERROR: DB Query: " + JSON.stringify(queryModel);
            }
        }
        catch (error) {
            resModel.status = -33;
            resModel.info = "catch : " + resModel.info + " : " + JSON.stringify(error);
            console.log(error);
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : createEntity : ${table}`);
        }
        finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }
        return resModel;
    }
    async updateEntity(schema, table, params, payload) {
        const startMS = new Date().getTime();
        const resModel = { ...response_entity_1.ResponseEntity };
        let queryModel = { ...query_entity_1.QueryEntity };
        let query = "";
        const values = [];
        try {
            // Building the UPDATE clause
            query = `UPDATE ${schema}.${table} SET `;
            // Add each field to the SET clause with placeholders
            Object.keys(payload).forEach((field, index) => {
                query += `${field} = $${index + 1}, `;
                values.push(payload[field]);
            });
            // Remove trailing comma and space from the SET clause
            query = this.methods.rtrim(query, ", ");
            // Building the WHERE clause
            const paramStartIndex = values.length + 1; // Start from the next placeholder index
            query += ' WHERE ';
            Object.entries(params).forEach(([key, value], index) => {
                query += `${key} = $${paramStartIndex + index} AND`;
                values.push(value);
            });
            // Remove trailing AND from the WHERE clause
            query = this.methods.rtrim(query, " AND");
            // Execute the query with parameters
            queryModel = await this.sql.executeQuery(query, values);
            if (queryModel.status === constants_util_1.Constants.SUCCESS) {
                resModel.status = queryModel.status;
                resModel.info =
                    "OK: DB Query: " +
                        queryModel.info +
                        " : " +
                        queryModel.tat +
                        " : " +
                        queryModel.message;
                resModel.data = queryModel;
            }
            else {
                resModel.status = constants_util_1.Constants.ERROR;
                resModel.info = "ERROR: DB Query: " + JSON.stringify(queryModel);
            }
        }
        catch (error) {
            resModel.status = -33;
            resModel.info = "catch : " + resModel.info + " : " + JSON.stringify(error);
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : updateEntity : ${table}`);
        }
        finally {
            resModel.tat = (new Date().getTime() - startMS) / 100;
        }
        return resModel;
    }
    async createMultipleEntities(payloadArray, schema, table, primary_key) {
        const startMS = new Date().getTime();
        const resModel = { ...response_entity_1.ResponseEntity };
        let queryModel = { ...query_entity_1.QueryEntity };
        let query = "";
        try {
            if (payloadArray.length === 0) {
                throw new Error("Payload array is empty.");
            }
            // Extract column names from first payload
            const columns = Object.keys(payloadArray[0]);
            // Construct values placeholder
            const valuesPlaceholders = [];
            const values = [];
            payloadArray.forEach((payload, rowIndex) => {
                const rowValues = columns.map((key, colIndex) => {
                    const value = payload[key];
                    const paramIndex = values.length + 1; // Generate parameter index
                    if (Array.isArray(value)) {
                        values.push(value);
                        return `$${paramIndex}::text[]`; // PostgreSQL array type
                    }
                    else if (typeof value === "object") {
                        values.push(JSON.stringify(value));
                        return `$${paramIndex}::jsonb`; // PostgreSQL JSONB
                    }
                    else {
                        values.push(value);
                        return `$${paramIndex}`; // Standard type
                    }
                });
                valuesPlaceholders.push(`(${rowValues.join(", ")})`);
            });
            // Construct the final query
            query = `INSERT INTO ${schema}.${table} (${columns.join(", ")}) VALUES ${valuesPlaceholders.join(", ")} RETURNING ${primary_key} AS id`;
            // Execute the query
            queryModel = await this.sql.executeQuery(query, values);
            if (queryModel.status === constants_util_1.Constants.SUCCESS) {
                resModel.status = queryModel.status;
                resModel.info =
                    "OK: Bulk DB Query: " +
                        queryModel.info +
                        " : " +
                        queryModel.tat +
                        " : " +
                        queryModel.message;
                resModel.data = queryModel;
            }
            else {
                resModel.status = constants_util_1.Constants.ERROR;
                resModel.info = "ERROR: Bulk DB Query: " + JSON.stringify(queryModel);
            }
        }
        catch (error) {
            resModel.status = -33;
            resModel.info = "catch : " + resModel.info + " : " + JSON.stringify(error);
            console.log(error);
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : createMultipleEntities : ${table}`);
        }
        finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }
        return resModel;
    }
    async deleteEntity(schema, table, primaryKeyColumn, primaryKey) {
        const startMS = new Date().getTime();
        const resModel = { ...response_entity_1.ResponseEntity };
        let queryModel = { ...query_entity_1.QueryEntity };
        let query = "";
        try {
            if (!primaryKey) {
                throw new Error("Primary key is required.");
            }
            // Construct the DELETE query
            query = `DELETE FROM ${schema}.${table} WHERE ${primaryKeyColumn} = $1 RETURNING ${primaryKeyColumn} AS id`;
            // Execute the query
            queryModel = await this.sql.executeQuery(query, [primaryKey]);
            if (queryModel.status === constants_util_1.Constants.SUCCESS) {
                resModel.status = queryModel.status;
                resModel.info = `OK: Delete Query: ${queryModel.info} : ${queryModel.tat} : ${queryModel.message}`;
                resModel.data = queryModel;
            }
            else {
                resModel.status = constants_util_1.Constants.ERROR;
                resModel.info = `ERROR: Delete Query: ${JSON.stringify(queryModel)}`;
            }
        }
        catch (error) {
            resModel.status = -33;
            resModel.info = `catch : ${resModel.info} : ${JSON.stringify(error)}`;
            console.error(error);
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : deleteEntity : ${table}`);
        }
        finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }
        return resModel;
    }
    async updateOrCreate(schema, table, params, payload, primaryKeyColumn) {
        const startMS = new Date().getTime();
        const resModel = { ...response_entity_1.ResponseEntity };
        let queryModel = { ...query_entity_1.QueryEntity };
        let query = "";
        let values = [];
        try {
            let findQuery = `SELECT * FROM ${schema}.${table}`;
            const selectValues = [];
            // Add WHERE clause if params exist
            if (Object.keys(params).length > 0) {
                findQuery += " WHERE ";
                Object.entries(params).forEach(([key, value], index) => {
                    findQuery += `${key} = $${index + 1} AND `;
                    selectValues.push(value);
                });
                // Trim the trailing "AND" from the query
                findQuery = this.methods.rtrim(findQuery, " AND");
            }
            console.log("heuuya", selectValues);
            if (selectValues.length > 0) {
                console.log("heuuy", queryModel);
                query = `UPDATE ${schema}.${table} SET `;
                let updateValues = [];
                // Update only the `otp` field using the payload
                query += `otp = $1 `;
                updateValues.push(payload.otp); // Assuming the `otp` field is in the payload
                // Use `mobile` from params in the WHERE clause
                query += `WHERE mobile = $2`;
                updateValues.push(params.mobile); // Assuming the `mobile` field is in the params (e.g., params.mobile)
                // Execute the update query
                queryModel = await this.sql.executeQuery(query, updateValues);
                resModel.info = "OTP updated successfully.";
            }
            else {
                // Entry doesn't exist, perform an insert
                const columns = Object.keys(payload);
                const insertValues = Object.values(payload).map((val) => {
                    if (typeof val === "object" && !Array.isArray(val)) {
                        return `'${JSON.stringify(val)}'::jsonb`;
                    }
                    return `'${this.methods._SQLTEXT_HANDLE(String(val))}'`;
                });
                query = `INSERT INTO ${schema}.${table} (${columns.join(", ")}) VALUES (${insertValues.join(", ")}) RETURNING ${primaryKeyColumn} AS id`;
                queryModel = await this.sql.executeQuery(query, []);
                resModel.info = "Record inserted successfully.";
            }
            if (queryModel.status === constants_util_1.Constants.SUCCESS) {
                resModel.status = queryModel.status;
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
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : updateOrCreate : ${table}`);
        }
        finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }
        return resModel;
    }
}
exports.default = MasterModel;
