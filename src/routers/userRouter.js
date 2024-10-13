import express from "express";
import * as controller from "../controllers/userController.js"
const router = express.Router();

router.get('/getUsers', controller.getAllUsers);


export default router;
