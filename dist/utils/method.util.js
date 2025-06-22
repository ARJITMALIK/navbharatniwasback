"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_util_1 = __importDefault(require("./logger.util"));
const xlsx_1 = require("xlsx");
const axios_1 = __importDefault(require("axios"));
class Methods {
    constructor() {
        this.logger = new logger_util_1.default();
        this.ltrim = (str, chr) => {
            var rgxtrim = (!chr) ? new RegExp('^\\s+') : new RegExp('^' + chr + '+');
            return str.replace(rgxtrim, '');
        };
    }
    formatDatetime(date, format) {
        const _padStart = (value) => value.toString().padStart(2, "0");
        try {
            if (isNaN(date.getTime())) {
                throw new Error("Invalid Date provided");
            }
            return format
                .replace(/yyyy/g, _padStart(date.getFullYear()))
                .replace(/dd/g, _padStart(date.getDate()))
                .replace(/mm/g, _padStart(date.getMonth() + 1))
                .replace(/hh/g, _padStart(date.getHours()))
                .replace(/mi/g, _padStart(date.getMinutes()))
                .replace(/ss/g, _padStart(date.getSeconds()))
                .replace(/ms/g, _padStart(date.getMilliseconds()));
        }
        catch (error) {
            throw new Error("formatDatetime : " + JSON.stringify(error));
        }
    }
    formatUTCDatetime(date, format) {
        const _padStart = (value) => value.toString().padStart(2, "0");
        try {
            if (isNaN(date.getTime())) {
                throw new Error("Invalid Date provided");
            }
            return format
                .replace(/yyyy/g, _padStart(date.getUTCFullYear()))
                .replace(/dd/g, _padStart(date.getUTCDate()))
                .replace(/mm/g, _padStart(date.getUTCMonth() + 1))
                .replace(/hh/g, _padStart(date.getUTCHours()))
                .replace(/mi/g, _padStart(date.getUTCMinutes()))
                .replace(/ss/g, _padStart(date.getUTCSeconds()))
                .replace(/ms/g, _padStart(date.getUTCMilliseconds()));
        }
        catch (error) {
            throw new Error("formatUTCDatetime : " + JSON.stringify(error));
        }
    }
    getDateTimeStamp() {
        try {
            // today = yyyy + '' + mm + '' + dd + '' + hh + '' + min + '' + ss;
            return this.formatDatetime(new Date(), "yyyymmddhhmiss");
        }
        catch (error) {
            throw error;
        }
    }
    getDateMySQL() {
        try {
            // today = yyyy + '-' + mm + '-' + dd;
            return this.formatDatetime(new Date(), "yyyy-mm-dd");
        }
        catch (error) {
            throw error;
        }
    }
    getDate() {
        try {
            //today = yyyy + '' + mm + '' + dd
            return this.formatDatetime(new Date(), "yyyymmdd");
        }
        catch (error) {
            throw error;
        }
    }
    getDTS() {
        try {
            //today = (yyyy + '' + mm + '' + dd + '' + hh + '' + min + '' + ss + '.' + ms);
            return this.formatDatetime(new Date(), "yyyymmddhhmiss.ms");
        }
        catch (error) {
            throw error;
        }
    }
    getUTCDateTimeStamp() {
        try {
            // today = yyyy + '' + mm + '' + dd + '' + hh + '' + min + '' + ss;
            return this.formatUTCDatetime(new Date(), "yyyymmddhhmiss");
        }
        catch (error) {
            throw error;
        }
    }
    getUTCDateMySQL() {
        try {
            // today = yyyy + '-' + mm + '-' + dd;
            return this.formatUTCDatetime(new Date(), "yyyy-mm-dd");
        }
        catch (error) {
            throw error;
        }
    }
    getUTCDate() {
        try {
            //today = yyyy + '' + mm + '' + dd
            return this.formatUTCDatetime(new Date(), "yyyymmdd");
        }
        catch (error) {
            throw error;
        }
    }
    getUTCDTS() {
        try {
            //today = (yyyy + '' + mm + '' + dd + '' + hh + '' + min + '' + ss + '.' + ms);
            return this.formatUTCDatetime(new Date(), "yyyymmddhhmiss.ms");
        }
        catch (error) {
            throw error;
        }
    }
    async getRandom4Digit() {
        try {
            let otp = 0;
            while (1 > 0) {
                otp = Math.floor(1000 + Math.random() * 9000);
                if (otp >= 1000)
                    break;
            }
            return otp;
        }
        catch (error) {
            throw "getRandom4Digit: " + error;
        }
    }
    async getRandomPassword() {
        let pass = "";
        let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "abcdefghijklmnopqrstuvwxyz0123456789@#$";
        for (let i = 1; i <= 8; i++) {
            let char = Math.floor(Math.random() * str.length + 1);
            pass += str.charAt(char);
        }
        return pass;
    }
    // to replace all ' to ` in sql query
    _SQLTEXT_HANDLE(text) {
        try {
            // text = text.split("'").join("\\'")
            if (text) {
                text = text ? (text = text.replace(/'/g, "\\'")) : "";
            }
            return text;
        }
        catch (error) {
            this.logger.error(`${JSON.stringify(error)}`, 'Methods._MYSQLTEXT_HANDLE');
            throw new Error(`_MYSQLTEXT_HANDLE ::: ${JSON.stringify(error)}`);
        }
    }
    URIEncode(text) {
        try {
            return encodeURIComponent(text);
        }
        catch (error) {
            throw new Error(`UrlEncode method error: ${JSON.stringify(error)}`);
        }
    }
    URIDecode(text) {
        try {
            return decodeURIComponent(text);
        }
        catch (error) {
            throw new Error(`UrlEncode method error: ${JSON.stringify(error)}`);
        }
    }
    _OnDuplicate(columns) {
        try {
            return (" ON DUPLICATE KEY UPDATE " +
                columns.map((cl) => `${cl} = VALUES(${cl})`));
        }
        catch (err) {
            throw new Error(`_OnDuplicate method failed :: ${err}`);
        }
    }
    _RemoveElementArray(array, removeElement) {
        try {
            let index = array.indexOf(removeElement);
            if (index >= 0) {
                array.splice(index, 1);
            }
        }
        catch (err) {
            throw new Error(`_`);
        }
        return array;
    }
    rtrim(str, chr) {
        var rgxtrim = (!chr) ? new RegExp('\\s+$') : new RegExp(chr + '+$');
        return str.replace(rgxtrim, '');
    }
    verifyEmail(email) {
        let regExp = /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
        if (!email)
            return false;
        var emailParts = email.split('@');
        if (emailParts.length !== 2)
            return false;
        /** get account 7 address */
        var account = emailParts[0];
        var address = emailParts[1];
        /** validate account & address lengths */
        if (account.length > 64)
            return false;
        if (address.length > 255)
            return false;
        /** address validation */
        var domainParts = address.split('.');
        if (domainParts.some(function (part) {
            return part.length > 63;
        }))
            return false;
        /** validate with req expression */
        if (!regExp.test(email))
            return false;
        /** assume all okay */
        return true;
    }
    verifyMobileNumber(mobile) {
        let regExp = /^[5-9]{1}[0-9]{9}$/im;
        if (!regExp.test(mobile))
            return false;
        return true;
    }
    capitalizeFirstLetter(key) {
        if (typeof key === 'string') {
            return key.charAt(0).toUpperCase() + key.slice(1);
        }
        return key;
    }
    capitalizeEachWord(str) {
        return str.split(' ').map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
    }
    empty(obj = null) {
        if (obj == null)
            return true;
        var length = Object.keys(obj).length;
        if (length > 0)
            return false;
        return true;
    }
    isObject(value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    }
    ;
    excelDateToJSDate(serial) {
        /** number of days since January 1, 1900, minus the offset to convert to UNIX time */
        const utc_days = Math.floor(serial - 25569);
        /** convert days to seconds (1 day = 86400 seconds) */
        const utc_value = utc_days * 86400;
        /** create a Date object from the UNIX time value (in milliseconds) */
        const date_info = new Date(utc_value * 1000);
        /** return a new Date object with year, month, and day from the Date object */
        return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
    }
    convertDateSerials(json) {
        return json.map(row => {
            /** Check if the 'dob' property exists, is a number, and is greater than the base date for Excel serial dates */
            if (typeof row.dob === 'number' && row.dob > 25569) {
                /** Convert the serial date number to a JavaScript Date object */
                const dateObject = this.excelDateToJSDate(row.dob);
                /** Format the Date object as an ISO date string (YYYY-MM-DD) and update the 'dob' property */
                row.dob = dateObject.toISOString().split('T')[0];
            }
            /** Return the modified row object */
            return row;
        });
    }
    async readExcelFile(url) {
        try {
            // Fetch the Excel file from the S3 URL
            const response = await axios_1.default.get(url, {
                responseType: 'arraybuffer'
            });
            // Convert the file data to a Buffer
            const buffer = Buffer.from(response.data, 'binary');
            // Read the Excel file using xlsx
            const workbook = (0, xlsx_1.read)(buffer, { type: 'buffer' });
            // Access the first sheet (for example)
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            // Convert the sheet to JSON
            const data = xlsx_1.utils.sheet_to_json(sheet);
            return this.convertDateSerials(data);
        }
        catch (error) {
            console.error('Error reading Excel file from url:', error);
        }
    }
    // will read excel files from file Buffer
    readExcelFromBuffer(buffer) {
        try {
            // Read the Excel file using xlsx
            const workbook = (0, xlsx_1.read)(buffer, { type: 'buffer' });
            // Access the first sheet
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            // Convert the sheet data to JSON
            const jsonData = xlsx_1.utils.sheet_to_json(sheet);
            // Convert Excel serial date numbers to JavaScript dates in the 'dob' field
            return this.convertDateSerials(jsonData);
        }
        catch (error) {
            console.error('Error reading Excel file from buffer:', error);
            return null; // Return null in case of error
        }
    }
}
exports.default = Methods;
