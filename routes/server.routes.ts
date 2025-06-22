import { Router } from "express";
import { VendorController } from "../controllers/v1/api/vendor.controller";


import multer from "multer";
import path from "path";
import { DepartmentsController } from "../controllers/v1/api/hr/departments.controller";
import { RolesController } from "../controllers/v1/api/hr/roles.controller";
import { EmployeesController } from "../controllers/v1/api/hr/employees.controller";
import { SiteController } from "../controllers/v1/api/site.controller";
import { DrawController } from "../controllers/v1/api/draw.controller";
import { BlogController } from "../controllers/v1/api/blog.controller";
import { AdvController } from "../controllers/v1/api/advisor.controller";
import { DraftController } from "../controllers/v1/api/draft.controller";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype ===
    "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Please upload an Pdf file."), false);
  }
};

const upload = multer({ storage, fileFilter });

export class Routes {
  public readonly router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  private routes(): void {

    // middlewares

    // controllers

    const vendorController = new VendorController();

    const departmentController = new DepartmentsController();
    const rolesController = new RolesController();
    const employeesController = new EmployeesController();
    const siteController = new SiteController();
    const drawController = new DrawController();
    const blogController = new BlogController();
    const advController = new AdvController();
    const draftController = new DraftController();
   



    // department routes
    this.router.get(`/departments`, departmentController.fetchDep);
    this.router.post(`/department`,  departmentController.createdep);
    this.router.put(`/department/:id`,  departmentController.updatedep);
    this.router.delete(`/department/:id`,  departmentController.deletedep);

    // roles routes
    this.router.get(`/roles`, rolesController.fetchRole);
    this.router.post(`/role`,  rolesController.createRole);
    this.router.put(`/role/:id`,  rolesController.updateRole);
    this.router.delete(`/role/:id`, rolesController.deleteRole);

    //employee routes
    this.router.get(`/employees`, employeesController.fetchEmployee);
    this.router.post(`/employee`, employeesController.createEmployee);
    this.router.put(`/employee/:id`, employeesController.updateEmployee);
    this.router.delete(`/employee/:id`, employeesController.deleteEmployee);  

    
    this.router.post(`/send-allotment`,upload.single("file"), draftController.createdAllotmentMail);
    this.router.post(`/send-recipt`,upload.single("file"), draftController.createdReciptMail);




    //vendor routes
    this.router.post(`/send-otp`,vendorController.createUser);
    this.router.post(`/verify-otp`,vendorController.verifyUser);
    this.router.get(`/get-otp`,vendorController.fetchVendor);

    //site routes
     this.router.get(`/sites`,siteController.fetchSite);
    this.router.post(`/create-site`, siteController.createSite);
    this.router.put(`/site/:id`,  siteController.updateSite);
    this.router.delete(`/site/:id`, siteController.deleteSite);

    //draw routes
    this.router.get(`/draw`,drawController.fetchdraw);
    this.router.post(`/create-draw`, drawController.createdraw);
    this.router.put(`/draw/:id`,  drawController.updatedraw);
    this.router.delete(`/draw/:id`, drawController.deletedraw);

    //blog routes
    this.router.get(`/blog`,blogController.fetchblog);
    this.router.post(`/create-blog`, blogController.createblog);
    this.router.put(`/blog/:id`,  blogController.updateblog);
    this.router.delete(`/blog/:id`, blogController.deleteblog);

    //advisor routes
   this.router.get(`/adv`,advController.fetchadv);
    this.router.post(`/create-adv`, advController.createadv);
    this.router.put(`/adv/:id`,  advController.updateadv);
    this.router.delete(`/adv/:id`, advController.deleteadv);

    //form filled routes
    this.router.get(`/draft`,draftController.fetchdraft);
    this.router.post(`/create-draft`,draftController.createdraft);
    this.router.put(`/draft/:id`,draftController.updatedraft);
    this.router.delete(`/draft/:id`,draftController.deletedraft);


     this.router.post(`/login/send-otp`,vendorController.LoginUser);
    this.router.post(`/login/verify-otp`,vendorController.verifyUserlogin);

    
  }
}