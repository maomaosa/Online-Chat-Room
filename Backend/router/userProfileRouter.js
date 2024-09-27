import express from "express";
import UserProfileService from "../service/userProfileService.js";
const router = express.Router();

router.get("/jobType/:jobType", UserProfileService.getProfilesByJobType);

router.get("/:username", UserProfileService.getProfilesByUsername);

router.post("/currentUser", UserProfileService.postUserProfile);

router.delete("/currentUser", UserProfileService.deleteUserProfile);

router.put("/currentUser", UserProfileService.updateUserProfile);

export default router;
