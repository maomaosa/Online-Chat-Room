import express from "express";
import UserAppointmentService from "../service/userAppointmentService.js";

const router = express.Router();

router.post("/", UserAppointmentService.scheduleAppointment);

export default router;
