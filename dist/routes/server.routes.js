"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Routes = void 0;
const express_1 = require("express");
const vendor_controller_1 = require("../controllers/v1/api/vendor.controller");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const departments_controller_1 = require("../controllers/v1/api/hr/departments.controller");
const roles_controller_1 = require("../controllers/v1/api/hr/roles.controller");
const employees_controller_1 = require("../controllers/v1/api/hr/employees.controller");
const site_controller_1 = require("../controllers/v1/api/site.controller");
const draw_controller_1 = require("../controllers/v1/api/draw.controller");
const blog_controller_1 = require("../controllers/v1/api/blog.controller");
const advisor_controller_1 = require("../controllers/v1/api/advisor.controller");
const draft_controller_1 = require("../controllers/v1/api/draft.controller");
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Ensure this folder exists
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype ===
        "application/pdf") {
        cb(null, true);
    }
    else {
        cb(new Error("Invalid file type. Please upload an Pdf file."), false);
    }
};
const upload = (0, multer_1.default)({ storage, fileFilter });
class Routes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        // middlewares
        // controllers
        const vendorController = new vendor_controller_1.VendorController();
        const departmentController = new departments_controller_1.DepartmentsController();
        const rolesController = new roles_controller_1.RolesController();
        const employeesController = new employees_controller_1.EmployeesController();
        const siteController = new site_controller_1.SiteController();
        const drawController = new draw_controller_1.DrawController();
        const blogController = new blog_controller_1.BlogController();
        const advController = new advisor_controller_1.AdvController();
        const draftController = new draft_controller_1.DraftController();
        // department routes
        this.router.get(`/departments`, departmentController.fetchDep);
        this.router.post(`/department`, departmentController.createdep);
        this.router.put(`/department/:id`, departmentController.updatedep);
        this.router.delete(`/department/:id`, departmentController.deletedep);
        // roles routes
        this.router.get(`/roles`, rolesController.fetchRole);
        this.router.post(`/role`, rolesController.createRole);
        this.router.put(`/role/:id`, rolesController.updateRole);
        this.router.delete(`/role/:id`, rolesController.deleteRole);
        //employee routes
        this.router.get(`/employees`, employeesController.fetchEmployee);
        this.router.post(`/employee`, employeesController.createEmployee);
        this.router.put(`/employee/:id`, employeesController.updateEmployee);
        this.router.delete(`/employee/:id`, employeesController.deleteEmployee);
        this.router.post(`/send-allotment`, upload.single("file"), draftController.createdAllotmentMail);
        this.router.post(`/send-recipt`, upload.single("file"), draftController.createdReciptMail);
        //vendor routes
        this.router.post(`/send-otp`, vendorController.createUser);
        this.router.post(`/verify-otp`, vendorController.verifyUser);
        this.router.get(`/get-otp`, vendorController.fetchVendor);
        //site routes
        this.router.get(`/sites`, siteController.fetchSite);
        this.router.post(`/create-site`, siteController.createSite);
        this.router.put(`/site/:id`, siteController.updateSite);
        this.router.delete(`/site/:id`, siteController.deleteSite);
        //draw routes
        this.router.get(`/draw`, drawController.fetchdraw);
        this.router.post(`/create-draw`, drawController.createdraw);
        this.router.put(`/draw/:id`, drawController.updatedraw);
        this.router.delete(`/draw/:id`, drawController.deletedraw);
        //blog routes
        this.router.get(`/blog`, blogController.fetchblog);
        this.router.post(`/create-blog`, blogController.createblog);
        this.router.put(`/blog/:id`, blogController.updateblog);
        this.router.delete(`/blog/:id`, blogController.deleteblog);
        //advisor routes
        this.router.get(`/adv`, advController.fetchadv);
        this.router.post(`/create-adv`, advController.createadv);
        this.router.put(`/adv/:id`, advController.updateadv);
        this.router.delete(`/adv/:id`, advController.deleteadv);
        //form filled routes
        this.router.get(`/draft`, draftController.fetchdraft);
        this.router.post(`/create-draft`, draftController.createdraft);
        this.router.put(`/draft/:id`, draftController.updatedraft);
        this.router.delete(`/draft/:id`, draftController.deletedraft);
        this.router.post(`/login/send-otp`, vendorController.LoginUser);
        this.router.post(`/login/verify-otp`, vendorController.verifyUserlogin);
    }
}
exports.Routes = Routes;
