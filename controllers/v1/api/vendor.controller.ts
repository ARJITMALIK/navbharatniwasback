import { Request, Response } from "express";
import { Constants } from "../../../utils/constants.util";
import { ResponseEntity } from "../../../entities/core/response.entity";
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import MasterController from "../../master.controller";
import { VendorModel } from "../../../models/v1/vendor.model";
import axios from "axios";
import { OtpModel } from "../../../models/v1/otp.model";

dotenv.config();

export class VendorController extends MasterController {

    private vendorModel: VendorModel;
    private otpModel: OtpModel;

    constructor() {
        super();

        this.vendorModel = new VendorModel();
        this.otpModel = new OtpModel();

        // bindings
        this.fetchVendor = this.fetchVendor.bind(this);
        this.createUser = this.createUser.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.verifyUser = this.verifyUser.bind(this);
        this.verifyUserlogin = this.verifyUserlogin.bind(this);
        this.LoginUser = this.LoginUser.bind(this);
    }

    async fetchVendor(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity }
        let params;
        try {
            params = req.query;
            resModel = await this.vendorModel.fetch(params);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);
        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchUsers`);
        }
    }
   
    private SendOtp = async(mobile:any,otp:any)=>{
        try {
          
            return await axios.get(`http://glocious.in/api.php?username=25GNAVBHARAT&password=491186&sender=NBNIWS&sendto=${mobile}&message=Dear%20User,%20Welcome%20to%20NavBharat%20Niwas,%20your%20OTP%20for%20login%20is%20${otp}%20Never%20share%20your%20OTP%20with%20anyone.%20NavBharat%20Niwas%20-%20Safe,%20Verified,%20Trusted.&PEID=1701174980266934198&templateid=1707174998301992764`);
   } catch (error) {
       
   }
    }

   
      
      async verifyUser(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        let payload;
      
        try {
          payload = req.body;
          let phone = payload.phone;
          let otp = payload.otp;
          let name = payload.name;
          let email = payload.email;
         

         const otpdata = await this.otpModel.fetch({phone});
          console.log(otpdata);
          let data:any = otpdata;
        
          
          if(data?.data?.rows[0].otp==otp) {
           resModel= await this.vendorModel.createEntity({phone,email,name}, "auth", "user_master", "user_id");
           await this.otpModel.deleteEntity("auth", "otp", "otp_id",data?.data?.rows[0].otp_id )
           resModel.status = 1;
           resModel.info="user created";
            return res.status(Constants.HTTP_OK).json(resModel);
          }
         
          else {
            console.log("Invalid OTP or User not found");
            return res.status(Constants.HTTP_OK).json({ status: false, message: "Invalid OTP " });
          }
        } catch (error) {
          console.error("Error in verifyUser:", error);
      
          resModel.status = -9;
          resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
          this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : verifyUser`);
      
          return res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json({ status: false, error: "Internal Server Error" });
        }
      }
   
    async createUser(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        let payload;
        
        try {
            payload = req.body;
            const phone = payload.phone;
    console.log(phone)
             let user: any = await this.vendorModel.fetch({ phone: payload.phone })
             console.log(user.data.rows.length>0)
            if (user.data.rows.length>0) {
                resModel.status = -9;
                resModel.info = "error: " + "User already exists";
                return res.status(200).json(resModel);
            }

         const otp = Math.floor(100000 + Math.random() * 900000);

          let sendotp:any =   await this.SendOtp(phone,otp);
         const otpdata:any = await this.otpModel.fetch({phone});
         if(otpdata?.data?.rows[0]?.otp){
          await this.otpModel.deleteEntity("auth", "otp", "otp_id",otpdata?.data?.rows[0].otp_id )
         }
      
          await this.otpModel.createEntity({phone,otp}, "auth", "otp", "otp_id");
          
          let data = sendotp?.data?.type
          console.log("send otp",sendotp);
                 

            resModel.info = "OTP sent.";
            resModel.data = {data};
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
    
            return res.status(Constants.HTTP_OK).json(resModel);
        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : createUser`);
            return res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json(resModel);
        }
    }

 async verifyUserlogin(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        let payload;
      
        try {
          payload = req.body;
          let phone = payload.phone;
          let otp = payload.otp;
         

         const otpdata = await this.otpModel.fetch({phone});
          console.log(otpdata);
          let data:any = otpdata;
        
          
          if(data?.data?.rows[0]?.otp==otp) {
           await this.otpModel.deleteEntity("auth", "otp", "otp_id",data?.data?.rows[0]?.otp_id )
           resModel = await this.vendorModel.fetch({phone});
           resModel.status = 1;
           resModel.info="user logged in successfully";
            return res.status(Constants.HTTP_OK).json(resModel);
          }
         
          else {
            console.log("Invalid OTP or User not found");
            return res.status(Constants.HTTP_OK).json({ status: false, message: "Invalid OTP " });
          }
        } catch (error) {
          console.error("Error in verifyUser:", error);
      
          resModel.status = -9;
          resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
          this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : verifyUser`);
      
          return res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json({ status: false, error: "Internal Server Error" });
        }
      }

    
 async LoginUser(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        let payload;
        
        try {
            payload = req.body;
            const phone = payload.phone;
             let user: any = await this.vendorModel.fetch({ phone: payload.phone })

            if (user.data.rows.length<=0) {
                resModel.status = -9;
                resModel.info = "error: " + "User not registerd!";
                return res.status(200).json(resModel);
            }

         const otp = Math.floor(100000 + Math.random() * 900000);

          let sendotp:any =   await this.SendOtp(phone,otp);
         const otpdata:any = await this.otpModel.fetch({phone});
         if(otpdata?.data?.rows[0]?.otp){
          await this.otpModel.deleteEntity("auth", "otp", "otp_id",otpdata?.data?.rows[0].otp_id )
         }
      
          await this.otpModel.createEntity({phone,otp}, "auth", "otp", "otp_id");
          
          let data = sendotp?.data?.type
          console.log("send otp",sendotp);
                 

            resModel.info = "OTP sent.";
            resModel.data = {data};
            resModel.endDT = new Date();
            resModel.status=1;
            resModel.tat = (new Date().getTime() - startMS) / 1000;
    
            return res.status(Constants.HTTP_OK).json(resModel);
        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : createUser`);
            return res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json(resModel);
        }
    }
    


    async updateUser(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity }
        let payload;
        try {
            payload = req.body;

            resModel = await this.vendorModel.updateEntity("users", "users_master", { user_id: req.params.id }, payload);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : updateUser`);
        }
    }
}