import express from "express";
import MessageService from "../service/messageService.js";
const router = express.Router();

// public messages
router.post("/public", MessageService.postPublicMessage);

router.get("/public", MessageService.getPublicMessage);

router.get(
  "/public/criteriaContent/:criteriaContent",
  MessageService.getFilteredPublicMessages
);

// private messages
router.post("/private", MessageService.postPrivateMessage);

router.get("/private/:receiverId", MessageService.getPrivateMessage);

router.get(
  "/private/:receiverId/criteriaContent/:criteriaContent",
  MessageService.getFilteredPrivateMessages
);

router.get("/unread", MessageService.getCurrentUserUreadPrivateMessage);

// announcements
router.post("/announcement", MessageService.postAnnouncement);

router.get("/announcement", MessageService.getAnnouncement);

router.get(
  "/announcement/criteriaContent/:criteriaContent",
  MessageService.getFilteredAnnouncement
);

export default router;
