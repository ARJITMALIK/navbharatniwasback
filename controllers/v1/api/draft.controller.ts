import { Request, Response } from "express";
import { Constants } from "../../../utils/constants.util";
import { ResponseEntity } from "../../../entities/core/response.entity";
import MasterController from "../../master.controller";
import { DraftModel } from "../../../models/v1/draft.model";
import nodemailer from "nodemailer";

export class DraftController extends MasterController {

    private draftModel: DraftModel;

    constructor() {
        super();

        this.draftModel = new DraftModel();

        // bindings
        this.fetchdraft = this.fetchdraft.bind(this);
        this.createdraft = this.createdraft.bind(this);
        this.updatedraft = this.updatedraft.bind(this);
        this.deletedraft = this.deletedraft.bind(this);
        this.createdAllotmentMail = this.createdAllotmentMail.bind(this);
        this.createdReciptMail = this.createdReciptMail.bind(this);
    }

  async createdAllotmentMail(req: any, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        let payload:any;
        try {
            payload = req.body;

                  const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SECURE,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const htmltemplate =`<!DOCTYPE html>
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
</html>`


        const mailOptions = {
          from: `NavbharatNiwas <${process.env.SMTP_USER}>`,
          to: payload.email,
          subject:"Allotment Letter",
          html:htmltemplate,
           attachments: [
        {
          filename: "Allotment Letter",
          path: req.file.path
        }
      ]
        };

        await transporter.sendMail(mailOptions);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} :EmailController`);
        }
    }

     async createdReciptMail(req: any, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        let payload:any;
        try {
            payload = req.body;

                  const transporter = nodemailer.createTransport({
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
          to:payload?.email,
          subject:"Payment reciept!",
          html:htmlTemplate,
           attachments: [
        {
          filename: "Payment reciept",
          path: req?.file?.path
        }
      ]
        };

   await transporter.sendMail(mailOptions);
 

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json({sucess:true});

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} :EmailController`);
        }
    }


    async fetchdraft(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        let params;
        try {
            params = req.query;
      

                resModel = await this.draftModel.fetch(params);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);
        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchdraft`);
        }
    }



    async createdraft(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        let payload;
        try {
            payload = req.body;



            resModel = await this.draftModel.createEntity(payload, "property", "draw_draft", "ticket_id");

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : draftController`);
        }
    }

    async updatedraft(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        let payload;
        try {
            payload = req.body;

            resModel = await this.draftModel.updateEntity("property", "draw_draft", { ticket_id: req.params.id }, payload);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : updatedraft`);
        }
    }

    async deletedraft(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity }
        try {
            resModel = await this.draftModel.deleteEntity("property", "draw_draft", "ticket_id", req.params.id);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : deletedraft`);
        }
    }
}
