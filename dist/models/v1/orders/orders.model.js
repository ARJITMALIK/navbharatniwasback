"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModel = void 0;
const query_entity_1 = require("../../../entities/core/query.entity");
const response_entity_1 = require("../../../entities/core/response.entity");
const constants_util_1 = require("../../../utils/constants.util");
const master_model_1 = __importDefault(require("../../master.model"));
class OrdersModel extends master_model_1.default {
    constructor() {
        super();
    }
    async updateEntityWithCondition(schema, tableName, whereConditions, updateData) {
        const startMS = new Date().getTime();
        const resModel = { ...response_entity_1.ResponseEntity };
        let queryModel = { ...query_entity_1.QueryEntity };
        try {
            // Build SET clause
            const setClause = [];
            const values = [];
            let index = 1;
            // Add update fields to SET clause
            for (const [key, value] of Object.entries(updateData)) {
                setClause.push(`${key} = $${index}`);
                values.push(value);
                index++;
            }
            // Build WHERE clause
            const whereClause = [];
            for (const [key, value] of Object.entries(whereConditions)) {
                if (value === null) {
                    whereClause.push(`${key} IS NULL`);
                }
                else {
                    whereClause.push(`${key} = $${index}`);
                    values.push(value);
                    index++;
                }
            }
            // Construct the complete UPDATE query
            const query = `UPDATE ${schema}.${tableName} SET ${setClause.join(', ')} WHERE ${whereClause.join(' AND ')}`;
            this.logger.info(`Executing update query: ${query} with values: ${JSON.stringify(values)}`, 'OrdersModel: updateEntityWithCondition');
            // Execute the query
            queryModel = await this.sql.executeQuery(query, values);
            // Build the response based on query success or failure
            if (queryModel.status === constants_util_1.Constants.SUCCESS) {
                resModel.status = queryModel.status;
                resModel.info = `OK: DB Update: ${queryModel.info} : ${queryModel.tat} : ${queryModel.message}`;
                resModel.data = queryModel;
            }
            else {
                resModel.status = constants_util_1.Constants.ERROR;
                resModel.info = `ERROR: DB Update: ${JSON.stringify(queryModel)}`;
            }
        }
        catch (error) {
            resModel.status = -33;
            resModel.info = `catch : ${resModel.info} : ${JSON.stringify(error)}`;
            this.logger.error(`DB Update Error: Error: ${JSON.stringify(error)}`, 'OrdersModel: updateEntityWithCondition');
        }
        finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }
        return resModel;
    }
    async fetch(params, limit = 1) {
        const startMS = new Date().getTime();
        const resModel = { ...response_entity_1.ResponseEntity };
        let queryModel = { ...query_entity_1.QueryEntity };
        let query = 'SELECT o.oid,o.updated_at,o.pushed,o.del_id,o.updated_by,o.booked_from, o.menu_items, o.customer_info, o.mode,o.created_at, o.delivery_date,o.status,o.discount_amount,o.irctc_discount,o.vendor_discount,o.delivery_details,o.comment,o.outlet_id,r.outlet_name AS outlet_name, r.gst, r.fssai, r.phone,r.fssai_valid,r.address,r.city,r.state,r.rlname,r.rlphone,r.rlemail,s.station_name,s.station_code,rv.rating,rv.review FROM orders.orders_master o JOIN restraunts.restraunt_master r ON o.outlet_id = r.outlet_id JOIN stations.stations_master s ON o.station_code = s.station_code LEFT JOIN restraunts.reviews rv ON o.cid = rv.user_id AND o.oid = rv.order_id WHERE ';
        const values = [];
        let index = 1;
        try {
            // filter with oid
            if (params.oid) {
                query += `o.oid = $${index} AND `;
                values.push(params.oid);
                index += 1;
            }
            // filter with cid
            if (params.cid) {
                query += `o.cid = $${index} AND `;
                values.push(params.cid);
                index += 1;
            }
            // filter with res_id
            if (params.outlet_id) {
                query += `o.outlet_id = $${index} AND `;
                values.push(params.outlet_id);
                index += 1;
            }
            // filter with station_id
            if (params.station_id) {
                query += `o.station_id = $${index} AND `;
                values.push(params.station_id);
                index += 1;
            }
            // filter with mode
            if (params.mode) {
                query += `o.mode = $${index} AND `;
                values.push(params.mode);
                index += 1;
            }
            // Filter with amount_high
            if (params.amount_high) {
                query += `o.amount < $${index}::double precision AND `;
                values.push(params.amount_high);
                index += 1;
            }
            // Filter with amount_low
            if (params.amount_low) {
                query += `o.amount > $${index}::double precision AND `;
                values.push(params.amount_low);
                index += 1;
            }
            // filter with status
            if (params.status && params.status.length > 0) {
                const statusArray = params.status.split(',').map((status) => status);
                const placeholders = statusArray.map(() => `$${index++}`).join(', ');
                query += `o.status IN (${placeholders}) AND `;
                values.push(...params.status);
            }
            // // search filter
            // if (params.search) {
            //     query += `(location LIKE $${index}) AND `;
            //     values.push(`%${params.search}%`);
            //     index += 1;
            // }
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
            this.logger.error(`DB Fetch Error: ${query} - Error: ${JSON.stringify(error)}`, 'ordersModel: fetch');
        }
        finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }
        return resModel;
    }
    async fetchIRCTC(params, limit = 1) {
        const startMS = new Date().getTime();
        const resModel = { ...response_entity_1.ResponseEntity };
        let queryModel = { ...query_entity_1.QueryEntity };
        let query = 'SELECT oid, cid, res_id, station_id, booking_date, delivery_date, amount_payable, delivery_charge, discount_amount, total_amount, total_margin, coupan_code, irctc_discount_amount, vendor_discount_amount, payment_type, status, comment, rv.rating, rv.review FROM orders.orders o LEFT JOIN restraunts.reviews rv ON o.cid = rv.user_id WHERE ';
        const values = [];
        let index = 1;
        try {
            // filter with oid
            if (params.oid) {
                query += `oid = $${index} AND `;
                values.push(params.oid);
                index += 1;
            }
            // filter with res_id
            if (params.res_id) {
                query += `res_id = $${index} AND `;
                values.push(params.res_id);
                index += 1;
            }
            // filter with station_id
            if (params.station_id) {
                query += `station_id = $${index} AND `;
                values.push(params.station_id);
                index += 1;
            }
            // filter with cid
            if (params.cid) {
                query += `cid = $${index} AND `;
                values.push(params.cid);
                index += 1;
            }
            // filter with mode
            if (params.mode) {
                query += `mode = $${index} AND `;
                values.push(params.mode);
                index += 1;
            }
            // filter with status
            if (params.status && params.status.length > 0) {
                const statusArray = params.status.split(',').map((status) => status);
                const placeholders = statusArray.map(() => `$${index++}`).join(', ');
                query += `o.status IN (${placeholders}) AND `;
                values.push(...params.status);
            }
            // // search filter
            // if (params.search) {
            //     query += `(location LIKE $${index}) AND `;
            //     values.push(`%${params.search}%`);
            //     index += 1;
            // }
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
            this.logger.error(`DB Fetch Error: ${query} - Error: ${JSON.stringify(error)}`, 'ordersModel: fetch');
        }
        finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }
        return resModel;
    }
}
exports.OrdersModel = OrdersModel;
