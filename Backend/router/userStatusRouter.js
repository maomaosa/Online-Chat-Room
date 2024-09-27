import express from "express";
import UserStatusService from "../service/UserStatusService.js";
const router = express.Router();

router.put("/currentUser", UserStatusService.changeCurrentUserShareStatus);
export default router;
