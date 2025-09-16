"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DraftController = void 0;
const constants_util_1 = require("../../../utils/constants.util");
const response_entity_1 = require("../../../entities/core/response.entity");
const master_controller_1 = __importDefault(require("../../master.controller"));
const draft_model_1 = require("../../../models/v1/draft.model");
const nodemailer_1 = __importDefault(require("nodemailer"));
class DraftController extends master_controller_1.default {
    constructor() {
        super();
        this.draftModel = new draft_model_1.DraftModel();
        // bindings
        this.fetchdraft = this.fetchdraft.bind(this);
        this.createdraft = this.createdraft.bind(this);
        this.updatedraft = this.updatedraft.bind(this);
        this.deletedraft = this.deletedraft.bind(this);
        this.createdAllotmentMail = this.createdAllotmentMail.bind(this);
        this.createdReciptMail = this.createdReciptMail.bind(this);
    }
    async createdAllotmentMail(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            const transporter = nodemailer_1.default.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || "587"),
                secure: process.env.SECURE,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            const htmltemplate = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Lucky Draw Result</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 20px; color: #333;">
    
    <h2 style="color: #2c5aa0;">Lucky Draw Result - Congratulations ${payload.name} ✓</h2>
    
    <p>Mr/Mrs/Ms. ${payload.name},</p>
    
    <p>Congratulations as you're selected to get property under <strong>Navbharat Niwas Smart City Development Plan!</strong>!</p>
    
    <p>We're excited to announce that you are one of the fortunate few to have the opportunity to invest in ${payload.project} under Navbharat Niwas Smart City Development Plan (NNSCDP)!</p>
    
    <p>We promise this will be one of your best decisions, offering significant returns in the near future.</p>
    
    <p>Please find your welcome letter in attachment.</p>
    
    <br>
    <p>Thanks<br>
    Navbharat Niwas!<br>
    B-92 , Sec-63 , Noida,UP - 201301</p>

</body>
</html>`;
            const mailOptions = {
                from: `NavbharatNiwas <${process.env.SMTP_USER}>`,
                to: payload.email,
                subject: "Allotment Letter",
                html: htmltemplate,
                attachments: [
                    {
                        filename: "Allotment_Letter.pdf",
                        path: req.file.path,
                        contentType: "application/pdf",
                        contentDisposition: "attachment"
                    }
                ]
            };
            await transporter.sendMail(mailOptions);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} :EmailController`);
        }
    }
    async createdReciptMail(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            const transporter = nodemailer_1.default.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || "587"),
                secure: process.env.SECURE,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Your Payment</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            background-color: #f4f4f4;
            padding: 20px;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 40px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .checkmark {
            display: inline-block;
            width: 24px;
            height: 24px;
            background-color: #4CAF50;
            border-radius: 50%;
            margin-left: 10px;
            position: relative;
        }
        .checkmark::after {
            content: '✓';
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-weight: bold;
            font-size: 14px;
        }
        .content {
            padding: 40px;
        }
        .greeting {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 20px;
        }
        .main-text {
            font-size: 16px;
            line-height: 1.7;
            color: #555;
            margin-bottom: 25px;
        }
        .invoice-section {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }
        .invoice-text {
            font-size: 16px;
            color: #2c3e50;
            margin: 0;
        }
        .attachments {
            margin: 25px 0;
        }
        .attachment-item {
            display: inline-block;
            background-color: #e3f2fd;
            border: 1px solid #bbdefb;
            border-radius: 6px;
            padding: 12px 16px;
            margin: 5px 10px 5px 0;
            font-size: 14px;
            color: #1976d2;
            text-decoration: none;
        }
        .attachment-item:hover {
            background-color: #bbdefb;
        }
        .attachment-icon {
            margin-right: 8px;
        }
        .closing {
            font-size: 16px;
            color: #2c3e50;
            margin: 25px 0;
        }
        .signature {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        .signature-name {
            font-size: 18px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        .signature-address {
            font-size: 14px;
            color: #7f8c8d;
            line-height: 1.4;
        }
        .footer {
            background-color: #f8f9fa;
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #7f8c8d;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 10px 0;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Thank You for Your Payment <span class="checkmark"></span></h1>
        </div>
        
        <div class="content">
            <div class="greeting">Dear ${payload?.name},</div>
            
            <div class="main-text">
                We wanted to extend our sincere gratitude for your recent payment. Your promptness is greatly appreciated and helps us continue providing exceptional service.
            </div>
            
            <div class="invoice-section">
                <p class="invoice-text">
                    <strong>📋 Invoice & Records</strong><br>
                    Please find the attached invoice for your records. If you have any questions or need further assistance, feel free to reach out to us at any time.
                </p>
            </div>
            
          
            
            <div class="closing">
                Thank you once again for your business and trust in us.
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="mailto:info@navbharatniwas.in" class="button">Contact Us</a>
            </div>
            
            <div class="signature">
                <div class="signature-name">Warm regards,</div>
                <div class="signature-name">NavBharatNiwas</div>
                <div class="signature-address">
                    Sector 63, Noida, Uttar Pradesh - 208003 <br>
                    Email: info@navbharatniwas.in
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>This is an automated email. Please do not reply directly to this message.</p>
            <p>© 2025 NavbharatNiwas. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
            const mailOptions = {
                from: `NavbharatNiwas <${process.env.SMTP_USER}>`,
                to: payload?.email,
                subject: "Payment reciept!",
                html: htmlTemplate,
                attachments: [
                    {
                        filename: "Payment_reciept.pdf",
                        path: req?.file?.path,
                        contentType: "application/pdf",
                        contentDisposition: 'inline'
                    }
                ]
            };
            await transporter.sendMail(mailOptions);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json({ sucess: true });
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} :EmailController`);
        }
    }
    async fetchdraft(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let params;
        try {
            params = req.query;
            resModel = await this.draftModel.fetch(params);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchdraft`);
        }
    }
    async createdraft(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            resModel = await this.draftModel.createEntity(payload, "property", "draw_draft", "ticket_id");
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : draftController`);
        }
    }
    async updatedraft(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            resModel = await this.draftModel.updateEntity("property", "draw_draft", { ticket_id: req.params.id }, payload);
            // --- PRODUCTION-READY TRIGGER LOGIC ---
            // Check if the update was successful and the status is 'rejected' (approved = 2)
            if (payload.approved === 2 && payload.email) {
                // Call the helper method to send the email in the background.
                // We do NOT await this call, so the API response is not delayed.
                // A .catch is added to log any errors from the email sending process
                // without crashing the main application thread.
                this._sendRejectionEmailHelper(payload).catch(err => {
                    this.logger.error(`Unhandled error in email helper: ${err}`, `${this.constructor.name} :updatedraft:email-trigger`);
                });
            }
            // --- END TRIGGER LOGIC ---
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : updatedraft`);
            // Ensure you send a response in the catch block as well
            res.status(constants_util_1.Constants.HTTP_INTERNAL_SERVER_ERROR).json(resModel);
        }
    }
    // Add this new private method inside your DraftController class
    /**
     * Sends a rejection email. This is a private helper method and does not handle HTTP responses.
     * @param payload - The data for the email, must include `name` and `email`.
     */
    async _sendRejectionEmailHelper(payload) {
        try {
            this.logger.info(`Attempting to send rejection email to: ${payload.email}`, "sendRejectionMail");
            const transporter = nodemailer_1.default.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || "587"),
                secure: process.env.SECURE,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Application Status Update</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px; }
                .email-container { background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
                .header { background-color: #34495e; color: white; padding: 30px 40px; text-align: center; }
                .header h1 { margin: 0; font-size: 24px; font-weight: 500; }
                .content { padding: 40px; }
                .greeting { font-size: 18px; color: #2c3e50; margin-bottom: 20px; }
                .main-text { font-size: 16px; line-height: 1.7; color: #555; margin-bottom: 25px; }
                .closing { font-size: 16px; color: #2c3e50; margin: 25px 0; }
                .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
                .signature-name { font-size: 18px; font-weight: 600; color: #2c3e50; margin-bottom: 5px; }
                .signature-address { font-size: 14px; color: #7f8c8d; line-height: 1.4; }
                .footer { background-color: #f8f9fa; text-align: center; padding: 20px; font-size: 12px; color: #7f8c8d; }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header"><h1>Update on Your Application</h1></div>
                <div class="content">
                    <div class="greeting">Dear ${payload?.email},</div>
                    <div class="main-text">
                        <p>Thank you for your interest in the Navbharat Niwas Smart City Development Plan and for taking the time to submit your application.</p>
                        <p>We received a large number of applications, and the selection process was very competitive. After careful review and consideration, we regret to inform you that your application was not selected to move forward at this time.</p>
                        <p>This decision does not reflect on your potential, and we encourage you to apply for future opportunities with us.</p>
                    </div>
                    <div class="closing">We wish you the best in your future endeavors.</div>
                    <div class="signature">
                        <div class="signature-name">Sincerely,</div>
                        <div class="signature-name">The Navbharat Niwas Team</div>
                        <div class="signature-address">Sector 63, Noida, Uttar Pradesh - 208003 <br>Email: info@navbharatniwas.in</div>
                    </div>
                </div>
                <div class="footer">
                    <p>This is an automated email. Please do not reply directly to this message.</p>
                    <p>© 2025 NavbharatNiwas. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;
            const mailOptions = {
                from: `NavbharatNiwas <${process.env.SMTP_USER}>`,
                to: payload.email,
                subject: "An Update Regarding Your Application with Navbharat Niwas",
                html: htmlTemplate,
            };
            await transporter.sendMail(mailOptions);
            this.logger.info(`Rejection email successfully sent to: ${payload.email}`, "updateDraft");
        }
        catch (error) {
            // Log the error but do not throw, so it doesn't interrupt the main API flow.
            this.logger.error(`Failed to send rejection email to ${payload.email}: ${JSON.stringify(error)}`, `${this.constructor.name} :_sendRejectionEmailHelper`);
        }
    }
    async deletedraft(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        try {
            resModel = await this.draftModel.deleteEntity("property", "draw_draft", "ticket_id", req.params.id);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : deletedraft`);
        }
    }
}
exports.DraftController = DraftController;
