import express from "express";
import EmergencyPostService from "../service/emergencyPostService.js";
const router = express.Router();

//middleware to upload pictures to memory first
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", EmergencyPostService.getEmergencyPosts);

router.post(
  "/pictures",
  upload.single("image"),
  EmergencyPostService.postEmergencyPostPicture
);

router.post("/", EmergencyPostService.postEmergencyPost);

router.get("/:postid", EmergencyPostService.getSingleEmergencyPost);

router.post("/:postid/comments", EmergencyPostService.postComment);

router.get("/:postid/comments", EmergencyPostService.getComments);

router.post("/:postid/help", EmergencyPostService.helpEmergencyPost);

router.post("/:postid/clear", EmergencyPostService.clearEmergencyPost);

router.get("/:postid/help", EmergencyPostService.getHelpList);

router.get("/:postid/clear", EmergencyPostService.getClearList);

router.delete("/:postid/help", EmergencyPostService.deleteHelp);

router.delete("/:postid/clear", EmergencyPostService.deleteClear);

router.put("/:postid/subscribe", EmergencyPostService.subscribeEmergencyPost);

router.put(
  "/:postid/unsubscribe",
  EmergencyPostService.unsubscribeEmergencyPost
);

export default router;
