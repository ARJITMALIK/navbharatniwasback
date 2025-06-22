import SQLMaster from "../database/postgres.database";
import { QueryEntity } from "../entities/core/query.entity";
import { ResponseEntity } from "../entities/core/response.entity";
import { Constants } from "../utils/constants.util";
import Logger from "../utils/logger.util";
import Methods from "../utils/method.util";

export default class MasterModel {

    protected logger: Logger;
    protected sql: SQLMaster;
    protected methods: Methods;

    constructor() {
        this.sql = new SQLMaster();
        this.logger = new Logger();
        this.methods = new Methods();
    }

    public async createEntity(payload: any, schema: string, table: string, primary_key: string) {
        const startMS = new Date().getTime();
        const resModel = { ...ResponseEntity };
        let queryModel = { ...QueryEntity };
        let query = "";
        try {
            // Prepare column names and values
            const columns = Object.keys(payload);
            const values = Object.values(payload).map((val) => {
                if (val === null || val === undefined) {
                    return "NULL"; // Ensure NULL is correctly inserted
                } else if (Array.isArray(val)) {
                    return `ARRAY[${val.map((v) => `'${v}'`).join(", ")}]::text[]`;
                } else if (val instanceof Date) {
                    return `'${val.toISOString().split("T")[0]}'::DATE`;
                } else if (typeof val === "object") {
                    return `'${JSON.stringify(val)}'::jsonb`;
                } else if (typeof val === "number") {
                    return `${val}`; // Avoid wrapping numbers in quotes
                } else {
                    return `'${this.methods._SQLTEXT_HANDLE(`${val}`)}'`;
                }
            });

            // Construct the SQL query
            query = `INSERT INTO ${schema}.${table} (${columns.join(", ")}) VALUES (${values.join(", ")}) RETURNING ${primary_key} AS id`;
            // Execute the query
            queryModel = await this.sql.executeQuery(query, []);

            if (queryModel.status == Constants.SUCCESS) {
                resModel.status = queryModel.status;
                resModel.info =
                    "OK: DB Query: " +
                    queryModel.info +
                    " : " +
                    queryModel.tat +
                    " : " +
                    queryModel.message;
                resModel.data = queryModel;
            } else {
                resModel.status = Constants.ERROR;
                resModel.info = "ERROR: DB Query: " + JSON.stringify(queryModel);
            }
        } catch (error) {
            resModel.status = -33;
            resModel.info = "catch : " + resModel.info + " : " + JSON.stringify(error);
            console.log(error);
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : createEntity : ${table}`);
        } finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }

        return resModel;
    }


    public async updateEntity(schema: string, table: string, params: any, payload: any) {
        const startMS = new Date().getTime();
        const resModel = { ...ResponseEntity };
        let queryModel = { ...QueryEntity };
        let query = "";
        const values: any[] = [];

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

            if (queryModel.status === Constants.SUCCESS) {
                resModel.status = queryModel.status;
                resModel.info =
                    "OK: DB Query: " +
                    queryModel.info +
                    " : " +
                    queryModel.tat +
                    " : " +
                    queryModel.message;
                resModel.data = queryModel;
            } else {
                resModel.status = Constants.ERROR;
                resModel.info = "ERROR: DB Query: " + JSON.stringify(queryModel);
            }
        } catch (error) {
            resModel.status = -33;
            resModel.info = "catch : " + resModel.info + " : " + JSON.stringify(error);
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : updateEntity : ${table}`);
        } finally {
            resModel.tat = (new Date().getTime() - startMS) / 100;
        }

        return resModel;
    }


    public async createMultipleEntities(payloadArray: any[], schema: string, table: string, primary_key: string) {
        const startMS = new Date().getTime();
        const resModel = { ...ResponseEntity };
        let queryModel = { ...QueryEntity };
        let query = "";
        try {
            if (payloadArray.length === 0) {
                throw new Error("Payload array is empty.");
            }

            // Extract column names from first payload
            const columns = Object.keys(payloadArray[0]);

            // Construct values placeholder
            const valuesPlaceholders: string[] = [];
            const values: any[] = [];

            payloadArray.forEach((payload, rowIndex) => {
                const rowValues: string[] = columns.map((key, colIndex) => {
                    const value = payload[key];
                    const paramIndex = values.length + 1; // Generate parameter index

                    if (Array.isArray(value)) {
                        values.push(value);
                        return `$${paramIndex}::text[]`; // PostgreSQL array type
                    } else if (typeof value === "object") {
                        values.push(JSON.stringify(value));
                        return `$${paramIndex}::jsonb`; // PostgreSQL JSONB
                    } else {
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

            if (queryModel.status === Constants.SUCCESS) {
                resModel.status = queryModel.status;
                resModel.info =
                    "OK: Bulk DB Query: " +
                    queryModel.info +
                    " : " +
                    queryModel.tat +
                    " : " +
                    queryModel.message;
                resModel.data = queryModel;
            } else {
                resModel.status = Constants.ERROR;
                resModel.info = "ERROR: Bulk DB Query: " + JSON.stringify(queryModel);
            }
        } catch (error) {
            resModel.status = -33;
            resModel.info = "catch : " + resModel.info + " : " + JSON.stringify(error);
            console.log(error);
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : createMultipleEntities : ${table}`);
        } finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }

        return resModel;
    }

    public async deleteEntity(
        schema: string,
        table: string,
        primaryKeyColumn: string,
        primaryKey: any
    ) {
        const startMS = new Date().getTime();
        const resModel = { ...ResponseEntity };
        let queryModel = { ...QueryEntity };
        let query = "";

        try {
            if (!primaryKey) {
                throw new Error("Primary key is required.");
            }

            // Construct the DELETE query
            query = `DELETE FROM ${schema}.${table} WHERE ${primaryKeyColumn} = $1 RETURNING ${primaryKeyColumn} AS id`;

            // Execute the query
            queryModel = await this.sql.executeQuery(query, [primaryKey]);

            if (queryModel.status === Constants.SUCCESS) {
                resModel.status = queryModel.status;
                resModel.info = `OK: Delete Query: ${queryModel.info} : ${queryModel.tat} : ${queryModel.message}`;
                resModel.data = queryModel;
            } else {
                resModel.status = Constants.ERROR;
                resModel.info = `ERROR: Delete Query: ${JSON.stringify(queryModel)}`;
            }
        } catch (error) {
            resModel.status = -33;
            resModel.info = `catch : ${resModel.info} : ${JSON.stringify(error)}`;
            console.error(error);
            this.logger.error(
                JSON.stringify(resModel),
                `${this.constructor.name} : deleteEntity : ${table}`
            );
        } finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }

        return resModel;
    }

    public async updateOrCreate(
        schema: string,
        table: string,
        params: any,
        payload: any,
        primaryKeyColumn: string
    ) {
        const startMS = new Date().getTime();
        const resModel = { ...ResponseEntity };
        let queryModel = { ...QueryEntity };
        let query = "";
        let values: any[] = [];

        try {
            let findQuery = `SELECT * FROM ${schema}.${table}`;
            const selectValues: any[] = [];

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
            console.log("heuuya", selectValues)

            if (selectValues.length > 0) {
                console.log("heuuy", queryModel)
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
            } else {
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

            if (queryModel.status === Constants.SUCCESS) {
                resModel.status = queryModel.status;
                resModel.data = queryModel;
            } else {
                resModel.status = Constants.ERROR;
                resModel.info = `ERROR: DB Query: ${JSON.stringify(queryModel)}`;
            }
        } catch (error) {
            resModel.status = -33;
            resModel.info = `catch : ${resModel.info} : ${JSON.stringify(error)}`;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : updateOrCreate : ${table}`);
        } finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }

        return resModel;
    }



  

}
