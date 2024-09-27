import UserStatusData from "../model/UserStatusData.js";
import ESNDirectoryService from "./esnDirectoryService.js";

class UserStatusService {
  static io;
  static connect(io) {
    UserStatusService.io = io;
  }

  static async getUserShareStatus(userId) {
    try {
      const shareStatusData = await UserStatusData.getUserShareStatus(userId);
      return shareStatusData;
    } catch (error) {
      console.error("Error fetching share status:", error);
      throw new Error(error.message);
    }
  }

  static async changeCurrentUserShareStatus(req, res) {
    try {
      const currentUserId = req.userInfo.userId;
      const currentUsername = req.userInfo.username;
      const newStatus = req.body.status;

      const updateResult = await UserStatusData.updateUserShareStatus(
        currentUserId,
        newStatus
      );
      const messageHistory = {
        userId: currentUserId,
        status: newStatus,
        timestamp: Date.now(),
      };
      await UserStatusData.addUserStatusHistory(messageHistory);
      if (updateResult.statusCode === 200) {
        await ESNDirectoryService.updateESNDirectoryShareStatus(
          currentUserId,
          newStatus
        );
        UserStatusService.io
          .to(currentUsername)
          .emit("shareStatusChanged", newStatus);
      }
      res.status(updateResult.statusCode).send({ share_status: newStatus });
    } catch (error) {
      console.error("Error changing current user share status:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async addCurrentUserShareStatus(userId) {
    try {
      const addShareStatusData = await UserStatusData.addUserShareStatus(
        userId
      );
      return {
        statusCode: addShareStatusData.statusCode,
        data: addShareStatusData.data,
      };
    } catch (error) {
      console.error("Error adding current user share status", error);
      return {
        statusCode: addShareStatusData.statusCode,
        data: addShareStatusData.data,
      };
    }
  }

  static async getTenLatestShareStatus(userId) {
    try {
      const getTenLatestShareStatusData =
        await UserStatusData.getTenLatestShareStatusHistory(userId);
      return {
        statusCode: getTenLatestShareStatusData.statusCode,
        data: getTenLatestShareStatusData.data,
      };
    } catch (error) {
      console.error("Error gettingten latest share status history", error);
      return {
        statusCode: getTenLatestShareStatusData.statusCode,
        data: getTenLatestShareStatusData.data,
      };
    }
  }
}
export default UserStatusService;
