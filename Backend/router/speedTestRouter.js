import express from "express";
import SpeedTestService from "../service/speedTestService.js";
const router = express.Router();


router.post("/", SpeedTestService.startPerformanceTest);

router.post("/resume", SpeedTestService.resumeNormalOperation);

router.post("/stop", SpeedTestService.stopPerformanceTest);



export default router;