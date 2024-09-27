import express from "express";
import UserService from "../service/userService.js";

const router = express.Router();

router.post("/", UserService.register);

router.put("/online", UserService.login);

router.put("/currentUser/offline", UserService.logout);

router.get("/:username", UserService.getUserByUsername);

router.get("/currentUser/info", UserService.getCurrentUser);

router.put("/profiles", UserService.updateUserProfile);

router.put(
  "/currentUser/acknowledgeStatus",
  UserService.changeAcknowledgeStatus
);

router.get("/profiles/info", UserService.getAllUserInfo);

router.put("/userId", UserService.updateUserProfileById);

export default router;
