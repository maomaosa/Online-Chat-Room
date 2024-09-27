import express from "express";
import ESNGuideService from "../service/esnGuideService.js";
const router = express.Router();

router.get("/get", ESNGuideService.getQuestionair);

router.get("/get/:id", ESNGuideService.getQuestionairById);

router.post("/save", ESNGuideService.createQuestionair);

router.post("/delete/:id", ESNGuideService.deleteQuestionair);

router.put("/update/:id", ESNGuideService.updateQuestionair);

router.post("/getGuide", ESNGuideService.getGuide);

export default router;
