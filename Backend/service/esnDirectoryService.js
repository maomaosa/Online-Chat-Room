import ESNDirectoryData from "../model/ESNDirectoryData.js";
import { ACCOUNT_STATUS } from "../CONST.js";

class ESNDirectoryService {
  static io;
  static esnDirectory = [];

  static connect(io) {
    ESNDirectoryService.io = io;
    ESNDirectoryService.initializeESNDirectory();
  }

  static async initializeESNDirectory() {
    try {
      const result = await ESNDirectoryData.getESNDirectory(null, null);
      if (result.statusCode === 200) {
        ESNDirectoryService.esnDirectory = result.data;
        ESNDirectoryService.esnDirectory.sort(
          ESNDirectoryService.directorySort
        );
      } else {
        console.error("Error initializing ESN Directory:", result.data);
      }
    } catch (error) {
      console.error("Error initializing ESN Directory:", error);
    }
  }

  static async addCurrentUserDirectory(user) {
    const { userId, username } = user;

    try {
      const insertedData = await ESNDirectoryData.insertESNDirectory(
        userId,
        username
      );
      if (insertedData.statusCode === 201) {
        insertedData.data.share_status = 0;
        ESNDirectoryService.esnDirectory.push(insertedData.data);
        ESNDirectoryService.esnDirectory.sort(
          ESNDirectoryService.directorySort
        );
        return { statusCode: 201, data: "add user to directory succeed!" };
      } else {
        return {
          statusCode: insertedData.statusCode,
          data: insertedData.data,
        };
      }
    } catch (error) {
      console.error("Error adding user to directory:", error);
      return { statusCode: 500, data: "Error adding user to directory" };
    }
  }

  static getESNDirectory(req, res) {
    res.status(200).send(ESNDirectoryService.esnDirectory);
  }

  static async updateESNDirectory(userId, onlineStatus) {
    try {
      const updatedData = await ESNDirectoryData.updateESNDirectory(
        userId,
        onlineStatus
      );

      if (updatedData.statusCode === 200) {
        for (let user of ESNDirectoryService.esnDirectory) {
          if (user.user_id === userId) {
            user.online_status = onlineStatus;
            ESNDirectoryService.esnDirectory.sort(
              ESNDirectoryService.directorySort
            );
            ESNDirectoryService.io.emit(
              "esnDirectoryUpdated",
              ESNDirectoryService.esnDirectory
            );
            return { statusCode: 200, data: "Succeed" };
          }
        }
        //console.log("Error updating ESN Directory: User not found")
        return { statusCode: 200, data: "Succeed" };
      } else {
        return { statusCode: updatedData.statusCode, data: updatedData.data };
      }
    } catch (error) {
      console.error("Error updating ESN Directory:", error);
      return { statusCode: 500, data: "Error updating ESN Directory" };
    }
  }

  static updateESNDirectoryShareStatus(userId, status) {
    for (let index in ESNDirectoryService.esnDirectory) {
      let user = ESNDirectoryService.esnDirectory[index];
      if (user.user_id === userId) {
        user.share_status = status;
        break;
      }
    }
    ESNDirectoryService.io.emit(
      "esnDirectoryUpdated",
      ESNDirectoryService.esnDirectory
    );
  }

  static async getFilteredESNDirectory(req, res) {
    const criteriaType = req.params.criteriaType;
    const criteriaContent = req.params.criteriaContent;

    try {
      let directoryData = await ESNDirectoryData.getESNDirectory(
        criteriaType,
        criteriaContent
      );
      const sortedFilteredDirectory = directoryData.data.sort(
        ESNDirectoryService.directorySort
      );
      res.status(directoryData.statusCode).send(sortedFilteredDirectory);
    } catch (error) {
      console.error("Error getting ESN Directory:", error);
      res.status(500).send("Error getting ESN Directory");
    }
  }

  static directorySort(a, b) {
    if (a.online_status !== b.online_status) {
      return b.online_status - a.online_status;
    } else {
      return a.username.localeCompare(b.username);
    }
  }

  static async setUsersOffline() {
    try {
      await ESNDirectoryData.setAllUsersOffline();
    } catch (error) {
      console.error("Error setting users ofline:", error);
    }
  }

  static async updateESNDirectoryByUserAccountStatus(userId, accountStatus) {
    if (accountStatus === ACCOUNT_STATUS.INACTIVE) {
      ESNDirectoryService.esnDirectory =
        ESNDirectoryService.esnDirectory.filter(
          (user) => user.user_id !== userId
        );
    } else {
      const directoryInfo = await ESNDirectoryData.getESNDirectoryByUserId(
        userId
      );
      ESNDirectoryService.esnDirectory.push(directoryInfo.data[0]);
      ESNDirectoryService.esnDirectory.sort(ESNDirectoryService.directorySort);
    }

    ESNDirectoryService.io.emit(
      "esnDirectoryUpdated",
      ESNDirectoryService.esnDirectory
    );
  }
}
export default ESNDirectoryService;
