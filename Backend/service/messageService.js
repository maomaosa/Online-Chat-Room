import MessageData from "../model/MessageData.js";
import MessageFactory from "../entity/MessageFactory.js";
import UserStatusService from "./UserStatusService.js";
import fs from "fs";
import { isPrivilegePermitted } from "../util/permissionUtil.js";
import { MESSAGE_TYPE } from "../CONST.js";

class MessageService {
  static io;

  static connect(io) {
    MessageService.io = io;
  }

  static async postPublicMessage(req, res) {
    try {
      const { content, messageStatus } = req.body;
      const message = MessageFactory.createMessage(
        "public",
        content,
        req.userInfo.userId,
        messageStatus
      );

      const insertResult = await MessageData.insertMessage(message);
      if (insertResult.statusCode === 201) {
        MessageService.io.emit("messageUpdated", insertResult.data);
      }
      res.status(insertResult.statusCode).send(insertResult.data);
    } catch (error) {
      console.error("Error posting public message:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async getPublicMessage(req, res) {
    try {
      const getPublicMessagesData = await MessageData.getMessagesByType(
        null,
        MESSAGE_TYPE.PUBLIC
      );
      res
        .status(getPublicMessagesData.statusCode)
        .send(getPublicMessagesData.data);
    } catch (error) {
      console.error("Error getting public messages:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async getFilteredPublicMessages(req, res) {
    const criteriaContent = req.params.criteriaContent
      .replace(/_/g, " ")
      .toLowerCase();

    if (MessageService.isStopWords(criteriaContent)) {
      res.status(200).send("Searching Word is banned!");
      return;
    }

    try {
      const getSelectedPublicMessagesData = await MessageData.getMessagesByType(
        criteriaContent,
        MESSAGE_TYPE.PUBLIC
      );
      res
        .status(getSelectedPublicMessagesData.statusCode)
        .send(getSelectedPublicMessagesData.data);
    } catch (error) {
      console.error("Error getting selected public messages:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async postPrivateMessage(req, res) {
    try {
      const { content, messageStatus, receiverId, receiverUsername } = req.body;
      const message = MessageFactory.createMessage(
        "private",
        content,
        req.userInfo.userId,
        messageStatus,
        0,
        receiverId
      );
      const insertResult = await MessageData.insertMessage(message);
      if (insertResult.statusCode === 201) {
        MessageService.io
          .to(receiverUsername)
          .emit("privateMessageUpdated", insertResult.data);
      }
      res.status(insertResult.statusCode).send(insertResult.data);
    } catch (error) {
      console.error("Error posting private message:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async getPrivateMessage(req, res) {
    try {
      const receiverId = req.params.receiverId;
      const getMessagesBetweenData = await MessageData.getMessagesBetween(
        receiverId,
        req.userInfo.userId,
        null
      );

      const updateMessagesReadData =
        await MessageData.updateMessagesReadBetween(
          receiverId,
          req.userInfo.userId
        );

      if (updateMessagesReadData.statusCode === 200) {
        MessageService.io
          .to(req.userInfo.username)
          .emit("messagesRead", updateMessagesReadData.data);
        res
          .status(getMessagesBetweenData.statusCode)
          .send(getMessagesBetweenData.data);
      } else {
        res
          .status(updateMessagesReadData.statusCode)
          .send(updateMessagesReadData.data);
      }
    } catch (error) {
      console.error("Error getting private messages:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async getFilteredPrivateMessages(req, res) {
    const criteriaContent = req.params.criteriaContent
      .replace(/_/g, " ")
      .toLowerCase();
    if (MessageService.isStopWords(criteriaContent)) {
      res.status(200).send("Searching Word is banned!");
      return;
    }

    try {
      const receiverId = req.params.receiverId;
      let getSelectedMessagesBetweenData;
      if (criteriaContent === "status") {
        getSelectedMessagesBetweenData =
          await UserStatusService.getTenLatestShareStatus(receiverId);
      } else {
        getSelectedMessagesBetweenData = await MessageData.getMessagesBetween(
          receiverId,
          req.userInfo.userId,
          criteriaContent
        );
      }
      res
        .status(getSelectedMessagesBetweenData.statusCode)
        .send(getSelectedMessagesBetweenData.data);
    } catch (error) {
      console.error("Error getting selected private messages:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async getCurrentUserUreadPrivateMessage(req, res) {
    try {
      const currentUserId = req.userInfo.userId;
      const getUnreadData = await MessageData.getUserUnreadMessages(
        currentUserId
      );
      res.status(getUnreadData.statusCode).send(getUnreadData.data);
    } catch (error) {
      console.error("Error getting unread private messages:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async postAnnouncement(req, res) {
    try {
      if (
        !isPrivilegePermitted("postAnnouncement", req.userInfo.privilegeLevel)
      ) {
        return res.status(500).send("Permission denied!");
      }
      const { content, messageStatus } = req.body;
      const message = MessageFactory.createMessage(
        "announcement",
        content,
        req.userInfo.userId,
        messageStatus
      );
      const insertResult = await MessageData.insertMessage(message);
      if (insertResult.statusCode === 201) {
        MessageService.io.emit("messageUpdated", insertResult.data);
      }
      res.status(insertResult.statusCode).send(insertResult.data);
    } catch (error) {
      console.error("Error posting announcement:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async getAnnouncement(req, res) {
    try {
      const getAnnouncementsData = await MessageData.getMessagesByType(
        null,
        MESSAGE_TYPE.ANNOUNCEMENT
      );
      res
        .status(getAnnouncementsData.statusCode)
        .send(getAnnouncementsData.data);
    } catch (error) {
      console.error("Error getting announcements:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async getFilteredAnnouncement(req, res) {
    const criteriaContent = req.params.criteriaContent
      .replace(/_/g, " ")
      .toLowerCase();

    if (MessageService.isStopWords(criteriaContent)) {
      res.status(200).send("Searching Word is banned!");
      return;
    }

    try {
      const getSelectedAnnouncementsData = await MessageData.getMessagesByType(
        criteriaContent,
        MESSAGE_TYPE.ANNOUNCEMENT
      );
      res
        .status(getSelectedAnnouncementsData.statusCode)
        .send(getSelectedAnnouncementsData.data);
    } catch (error) {
      console.error("Error getting selected announcements:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static isStopWords(criteriaContent) {
    let content = criteriaContent.toLowerCase();
    const data = fs.readFileSync(`${process.cwd()}/StopWords.txt`, "utf8");
    const stopWords = data.split(",");
    return stopWords.includes(content);
  }
}

export default MessageService;
