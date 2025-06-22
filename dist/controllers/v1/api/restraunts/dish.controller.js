"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DishController = void 0;
const constants_util_1 = require("../../../../utils/constants.util");
const response_entity_1 = require("../../../../entities/core/response.entity");
const master_controller_1 = __importDefault(require("../../../master.controller"));
const dish_model_1 = require("../../../../models/v1/restraunts/dish.model");
const axios_1 = __importDefault(require("axios"));
class DishController extends master_controller_1.default {
    constructor() {
        super();
        this.dishModel = new dish_model_1.DishModel();
        // bindings
        this.fetchDishes = this.fetchDishes.bind(this);
        this.createDish = this.createDish.bind(this);
        this.updateDish = this.updateDish.bind(this);
        this.deleteDish = this.deleteDish.bind(this);
        this.pushDishToIRCTC = this.pushDishToIRCTC.bind(this);
        this.ImportBulkItems = this.ImportBulkItems.bind(this);
        this.DeleteBulkItemsByOutlet = this.DeleteBulkItemsByOutlet.bind(this);
    }
    async fetchDishes(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let params;
        try {
            params = req.query;
            resModel = await this.dishModel.fetch(params);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchDishes`);
        }
    }
    async pushDishToIRCTC(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        resModel.endDT = new Date();
        resModel.tat = (new Date().getTime() - startMS) / 1000;
        try {
            // Extract station code from params
            const { outletid, stationCode } = req.params;
            // Validate required parameter
            if (!outletid) {
                return res.status(constants_util_1.Constants.HTTP_OK).json({
                    status: false,
                    errorDetails: {
                        message: "Missing required parameter. Please provide outletid in the URL."
                    }
                });
            }
            // Get outlet data from request body
            const itemData = req.body;
            // console.log(itemData)
            // Validate that the outlet data exists
            if (!itemData || itemData.menuItems.length === 0) {
                return res.status(constants_util_1.Constants.HTTP_OK).json({
                    status: false,
                    errorDetails: {
                        message: "Missing menuitem data in request body."
                    }
                });
            }
            // Make API call to push outlet data to IRCTC
            let response = await axios_1.default.post(`https://stage-ecatering.ipsator.com/api/v1/vendor/aggregator/station/${stationCode}/outlet/${outletid}`, itemData, {
                headers: {
                    'Authorization': '80d171c2-8bef-4b02-884f-fabffc769776',
                    'Content-Type': 'application/json'
                }
            });
            console.log("IRCTC Push Menu Item API RESPONSE: ", response.data);
            res.status(constants_util_1.Constants.HTTP_OK).json({
                resdata: response.data,
                status: true,
                message: "Menu Item successfully pushed to IRCTC"
            });
        }
        catch (error) {
            // Enhanced error handling
            console.log("ERROR pushing menuitem to IRCTC: ", error);
            // Get more details about the error
            if (axios_1.default.isAxiosError(error)) {
                console.log("Request was made and server responded with error");
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log("Error data:", error.response.data);
                    console.log("Error status:", error.response.status);
                    console.log("Error headers:", error.response.headers);
                    res.status(constants_util_1.Constants.HTTP_OK).json({
                        status: false,
                        errorDetails: {
                            status: error.response.status,
                            data: error.response.data,
                            message: error.message
                        }
                    });
                }
                else if (error.request) {
                    // The request was made but no response was received
                    console.log("No response received:", error.request);
                    res.status(constants_util_1.Constants.HTTP_OK).json({
                        status: false,
                        errorDetails: {
                            type: "No response",
                            message: "The request was made but no response was received"
                        }
                    });
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    console.log("Error setting up request:", error.message);
                    res.status(constants_util_1.Constants.HTTP_OK).json({
                        status: false,
                        errorDetails: {
                            type: "Request setup error",
                            message: error.message
                        }
                    });
                }
            }
            else {
                // Handle non-Axios errors
                res.status(constants_util_1.Constants.HTTP_OK).json({
                    status: false,
                    errorDetails: {
                        message: error.message || "Unknown error occurred"
                    }
                });
            }
        }
    }
    async createDish(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            // make sure required keys exist
            const verifyKeys = this.verifyKeys(req.body, ['item_name', 'vendor_price', 'description', 'opening_time', 'closing_time', 'tax', 'cuisine']);
            if (verifyKeys.length !== 0) {
                resModel.status = -9;
                resModel.info = "error: Missing keys: " + verifyKeys + " : " + resModel.info;
                return res.status(constants_util_1.Constants.HTTP_BAD_REQUEST).json(resModel);
            }
            resModel = await this.dishModel.createEntity(payload, "restraunts", "dish_master", "item_id");
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : dishController`);
        }
    }
    async updateDish(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            resModel = await this.dishModel.updateEntity("restraunts", "dish_master", { item_id: req.params.id }, payload);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : updateDish`);
        }
    }
    async deleteDish(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        try {
            resModel = await this.dishModel.deleteEntity("restraunts", "dish_master", "item_id", req.params.id);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : deleteDish`);
        }
    }
    async DeleteBulkItemsByOutlet(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        try {
            const outletId = req.params.id;
            // Validate outlet ID
            if (!outletId) {
                resModel.status = -9;
                resModel.info = "error: No outlet ID provided";
                return res.status(constants_util_1.Constants.HTTP_BAD_REQUEST).json(resModel);
            }
            // Log the deletion attempt
            this.logger.info(`Attempting to delete all items for outlet ID: ${outletId}`, `${this.constructor.name} : DeleteBulkItemsByOutlet`);
            //   console.log(outletId)
            // First, fetch all items with the given outlet_id
            // Fetch items to be deleted
            const fetchResult = await this.dishModel.fetch({ outlet_id: outletId });
            if (!fetchResult || !fetchResult.data.rows || fetchResult?.data?.rows?.length === 0) {
                resModel.status = 0;
                resModel.info = `No items found for outlet ID: ${outletId}`;
                resModel.endDT = new Date();
                resModel.tat = (new Date().getTime() - startMS) / 1000;
                return res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
            }
            const itemsToDelete = fetchResult?.data?.rows;
            const deletedItems = [];
            const failedItems = [];
            // Delete each item individually
            for (const item of itemsToDelete) {
                try {
                    const deleteResult = await this.dishModel.deleteEntity("restraunts", "dish_master", "item_id", item.item_id);
                    if (deleteResult && deleteResult.status === 1) {
                        deletedItems.push(item.item_id);
                    }
                    else {
                        failedItems.push({
                            item_id: item.item_id,
                            error: "Failed to delete item"
                        });
                    }
                }
                catch (error) {
                    failedItems.push({
                        item_id: item.item_id,
                        error: error.message || "Error during deletion"
                    });
                }
            }
            // Prepare successful response
            resModel.status = 1;
            resModel.info = `Processed ${itemsToDelete.length} items for deletion`;
            resModel.data = {
                data: itemsToDelete,
                total: itemsToDelete.length,
                deleted: deletedItems.length,
                failed: failedItems.length,
                failedItems: failedItems,
                outletId: outletId
            };
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            return res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : DeleteBulkItemsByOutlet`);
            return res.status(constants_util_1.Constants.HTTP_INTERNAL_SERVER_ERROR).json(resModel);
        }
    }
    async ImportBulkItems(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        try {
            // Check if file is included in the request
            if (!req.file) {
                resModel.status = -9;
                resModel.info = "error: No file uploaded";
                return res.status(constants_util_1.Constants.HTTP_BAD_REQUEST).json(resModel);
            }
            const file = req.file;
            const outletId = req.params.id;
            // Parse the Excel file into JSON
            const extractedData = this.parseExcelToJson(file.path);
            //   console.log("Extracted data:", extractedData);
            if (!extractedData || extractedData.length === 0) {
                resModel.status = -9;
                resModel.info = "error: Excel file is empty or invalid";
                return res.status(constants_util_1.Constants.HTTP_BAD_REQUEST).json(resModel);
            }
            // Process and format the data
            const formattedData = extractedData.map((item) => {
                return {
                    ...item,
                    opening_time: this.convertExcelTimeToHHMM(item.opening_time),
                    closing_time: this.convertExcelTimeToHHMM(item.closing_time),
                    // Convert string values to numbers
                    base_price: Number(item?.base_price) > 0 ? Number(item?.base_price) : 0,
                    vendor_price: Number(item.vendor_price),
                    is_vegeterian: Number(item.is_vegeterian),
                    tax: Number(item.tax) > 0 ? Number(item.tax) : 0,
                    status: 1,
                    outlet_id: outletId // Add outlet ID to each record
                };
            });
            console.log(extractedData);
            //   console.log("Formatted data:", formattedData);
            // Save all items to the database
            const savedItems = [];
            const errors = [];
            // Process each item
            for (const item of formattedData) {
                try {
                    // Save item to database
                    const result = await this.dishModel.createEntity(item, "restraunts", "dish_master", "item_id");
                    savedItems.push(result);
                }
                catch (error) {
                    // Record any errors for specific items
                    errors.push({
                        item: item.item_name,
                        error: error.message || "Failed to save item"
                    });
                }
            }
            // Prepare response
            resModel.status = 1;
            resModel.info = `Successfully imported ${savedItems.length} items`;
            resModel.data = {
                successful: savedItems.length,
                failed: errors.length,
                errors: errors
            };
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            return res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : ImportBulkItems`);
            return res.status(constants_util_1.Constants.HTTP_INTERNAL_SERVER_ERROR).json(resModel);
        }
    }
    convertExcelTimeToHHMM(excelTime) {
        // Ensure we're working with a number
        excelTime = parseFloat(excelTime);
        if (isNaN(excelTime)) {
            throw new Error('Invalid Excel time format');
        }
        // Excel stores dates as days since 1900-01-01
        // 1.0 = one day, 0.5 = 12 hours, 0.041666... = 1 hour, etc.
        // Calculate total minutes
        const totalMinutes = Math.round(excelTime * 24 * 60);
        // Extract hours and minutes
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        // Format as HH:MM with leading zeros
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        return `${formattedHours}:${formattedMinutes}`;
    }
    parseExcelToJson(filePath) {
        const XLSX = require("xlsx");
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        return XLSX.utils.sheet_to_json(sheet);
    }
}
exports.DishController = DishController;
