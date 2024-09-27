import UserData from "../model/UserData.js";
import jwt from "jsonwebtoken";
import moment from "moment";
import fs from "fs";
import { USER_STATUS, SECRET_KEY, ACCOUNT_STATUS } from "../CONST.js";
import ESNDirectoryService from "./esnDirectoryService.js";
import UserStatusService from "./UserStatusService.js";
import SpeedTestService from "./speedTestService.js";
import { isPrivilegePermitted } from "../util/permissionUtil.js";
import Redis from "ioredis";
const REDIS_URL =
  "rediss://red-cnoeulv109ks73b83j20:lmclZQWTq8ITxzUS6sr16pymG5rxJK3B@oregon-redis.render.com:6379";
// "redis://localhost:6379";
const userRedisClient = new Redis(REDIS_URL);

class UserService {
  static io;
  static socket;

  static connect(io) {
    UserService.io = io;
  }
  static connectSocket(socket) {
    UserService.socket = socket;
  }

  static async register(req, res) {
    // check if speed test is running
    if (SpeedTestService.performanceTestRunning) {
      res.status(401).send("Speed test is running. You cannot register.");
      return;
    }

    try {
      const { username, passwordHash } = req.body;

      const existingUserData = await UserData.getUserByUsername(username);
      if (existingUserData.statusCode === 200) {
        res.status(400).send("User already exists");
        return;
      }

      // Insert new user
      const insertedUserData = await UserData.insertUser(
        username,
        passwordHash
      );
      if (insertedUserData.statusCode === 500) {
        res.status(insertedUserData.statusCode).send(insertedUserData.data);
        return;
      }
      let insertedUser = insertedUserData.data;
      // Generate JWT token
      const token = UserService.generateJWTToken(insertedUser);
      res.cookie("token", token, { httpOnly: true });
      insertedUser.token = token;

      const currentUserId = insertedUser.user_id;
      const currentUsername = insertedUser.username;

      // Add user to directory
      await UserService.addUserToESNDirectory(currentUserId, currentUsername);

      // Add share status data
      await UserService.addUserShareStatus(currentUserId);
      insertedUser.share_status = 0;
      res.status(201).json(insertedUser);
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).send("Error registering user");
    }
  }

  static async addUserToESNDirectory(currentUserId, currentUsername) {
    const directoryStatusData =
      await ESNDirectoryService.addCurrentUserDirectory({
        userId: currentUserId,
        username: currentUsername,
      });
    if (directoryStatusData.statusCode === 201) {
      // Update user status in directory
      await UserService.updateESNDirectoryOnline(currentUserId);
    } else {
      console.error(
        "Failed to add user to directory:",
        directoryStatusData.data
      );
    }
  }

  static async updateESNDirectoryOnline(userId) {
    const updateStatusData = await ESNDirectoryService.updateESNDirectory(
      userId,
      USER_STATUS.ONLINE
    );
    if (updateStatusData.statusCode === 200) {
    } else {
      console.error("Failed to update directory:", updateStatusData.data);
    }
    return updateStatusData;
  }

  static async addUserShareStatus(currentUserId) {
    const addStatusData = await UserStatusService.addCurrentUserShareStatus(
      currentUserId
    );
    if (addStatusData.statusCode === 500) {
      console.error("Failed to add share status:", addStatusData.data);
    }
  }

  static async login(req, res) {
    // Check if speed test is running
    if (SpeedTestService.performanceTestRunning) {
      res.status(400).send("Speed test is running. You cannot login.");
      return;
    }

    try {
      const { username, passwordHash, isRelogin } = req.body;
      const userData = await UserData.getUserByUsername(username);
      if (userData.statusCode === 200) {
        const user = userData.data;

        if (user.account_status === ACCOUNT_STATUS.INACTIVE) {
          return res.status(403).json("Account is inactive");
        }
        if (!isRelogin && user.password_hash !== passwordHash) {
          res.status(userData.statusCode).send(userData.data);
          return;
        } else if (!isRelogin) {
          const token = UserService.generateJWTToken(user);
          user.token = token;
          res.cookie("token", token, { httpOnly: true });
          if (user.acknowledge_status === 0) {
            res.status(200).json(user);
            return;
          }
        }
        const updateStatusData = await UserService.updateESNDirectoryOnline(
          user.user_id
        );

        res.status(updateStatusData.statusCode).json(userData.data);
      } else {
        res.status(userData.statusCode).send(userData.data);
      }
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).send("Error during login");
    }
  }

  static async logout(req, res) {
    try {
      const userId = req.userInfo.userId;
      const updateResult = await ESNDirectoryService.updateESNDirectory(
        userId,
        USER_STATUS.OFFLINE
      );
      if (updateResult.statusCode === 200) {
        res.status(200).send("succeed");
      } else {
        res.status(updateResult.statusCode).send(updateResult.data);
      }
    } catch (error) {
      console.error("Error logging out:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static generateJWTToken(user) {
    const token = jwt.sign(
      {
        userId: user.user_id,
        username: user.username,
        timestamp: moment().format("MMMM Do YYYY, h:mm:ss a"),
      },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    UserService.storeUserInfoToRedis(token, user);
    return token;
  }

  static storeUserInfoToRedis(token, user) {
    const userInfo = {
      userId: user.user_id,
      username: user.username,
      privilegeLevel: user.privilege_level,
    };
    userRedisClient.set(token, JSON.stringify(userInfo));
  }

  static async getUserByUsername(req, res) {
    if (SpeedTestService.performanceTestRunning) {
      res.status(401).send("Speed test is running.");
      return;
    }
    const username = req.params.username;
    try {
      const user = await UserData.getUserByUsername(username);
      res.status(200).json(user);
    } catch (error) {
      if (error === "User not found") {
        res.status(400).send(user);
      } else {
        res.status(500).send("Internal Server Error");
      }
    }
  }

  static async changeAcknowledgeStatus(req, res) {
    try {
      const userId = req.userInfo.userId;
      const result = await UserData.changeAcknowledgeStatus(userId);
      if (result.statusCode === 200) {
        const user = {
          user_id: req.userInfo.userId,
          username: req.userInfo.username,
        };
        const directoryUpdateResult =
          await ESNDirectoryService.updateESNDirectory(
            userId,
            USER_STATUS.ONLINE
          );
        if (directoryUpdateResult.statusCode === 200) {
          res.status(200).json(user);
        } else {
          res
            .status(directoryUpdateResult.statusCode)
            .send(directoryUpdateResult.data);
        }
      } else {
        res.status(result.statusCode).send(result.data);
      }
    } catch (error) {
      console.error("Error changing acknowledge status:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async getCurrentUser(req, res) {
    try {
      const cookie = req.headers.cookie;
      const token = cookie.substring(6);
      const redisData = await userRedisClient.get(token);
      const userInfo = JSON.parse(redisData);
      const shareStatusData = await UserStatusService.getUserShareStatus(
        userInfo.userId
      );

      if (shareStatusData.statusCode !== 200) {
        res.status(shareStatusData.statusCode).send(shareStatusData.data);
        return;
      }

      userInfo.shareStatus = shareStatusData.data;

      if (!UserService.io.sockets.adapter.rooms[userInfo.username]) {
        UserService.socket.join(userInfo.username);
      }

      res.status(200).json(userInfo);
    } catch (error) {
      console.error("Error getting current user:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static checkUserName(username) {
    const data = fs.readFileSync(
      `${process.cwd()}/BannedUsernames.txt`,
      "utf8"
    );
    const bannedUsernames = data.split(",");

    if (username == undefined || username.length < 3) {
      return {
        statusCode: 500,
        data: "Invalid username. Please set another.",
      };
    } else if (
      bannedUsernames &&
      bannedUsernames.includes(username.trim().toLowerCase())
    ) {
      return {
        statusCode: 500,
        data: "Username banned! Please set another.",
      };
    } else {
      return { statusCode: 200, data: username.toLowerCase() };
    }
  }

  static checkPassword(password) {
    if (password == undefined || password.length < 4) {
      return {
        statusCode: 500,
        data: "Invalid password. Please enter another.",
      };
    } else {
      return { statusCode: 200, data: password };
    }
  }
  static isLengthTen(phoneNumber) {
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      return false;
    } else {
      return true;
    }
  }
  static async updateUserProfile(req, res) {
    try {
      if (
        !isPrivilegePermitted("updateUserProfile", req.userInfo.privilegeLevel)
      ) {
        return res.status(500).send("Permission denied!");
      }
      const { gender, phoneNumber, username } = req.body;

      if (UserService.isLengthTen(phoneNumber)) {
        const updateResult = await UserData.updateUserProfile(
          gender,
          phoneNumber,
          username
        );

        if (updateResult.statusCode === 200) {
          res.status(200).json(updateResult.data);
        } else {
          res.status(500).send("Unable to update user profile.");
        }
      } else {
        return res.status(400).send("Phone number must be 10 digits.");
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async getAllUserInfo(req, res) {
    try {
      if (
        !isPrivilegePermitted("getAllUserInfo", req.userInfo.privilegeLevel)
      ) {
        return res.status(500).send("Permission denied!");
      }
      const allUsers = await UserData.getAllUserInfo();
      res.status(200).json(allUsers);
    } catch (error) {
      console.error("Error getting all user info:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async updateUserProfileById(req, res) {
    try {
      const allowedParams = [
        "user_id",
        "username",
        "passwordHash",
        "privilege_level",
        "account_status",
      ];
      const unallowedParams = Object.keys(req.body).filter(
        (key) => !allowedParams.includes(key)
      );

      if (unallowedParams.length > 0) {
        return res
          .status(500)
          .send(
            `Unauthorized field modifications attempted: ${unallowedParams.join(
              ", "
            )}`
          );
      }
      const {
        user_id,
        username,
        passwordHash,
        privilege_level,
        account_status,
      } = req.body;

      if (passwordHash.length === 32) {
        UserService.checkPassword(passwordHash);
        UserData.updatePassword(user_id, passwordHash);
      }

      let usernameResult = UserService.checkUserName(username);

      if (usernameResult.statusCode === 500) {
        return res.status(400).send(usernameResult.data);
      }

      const updateResult = await UserData.updateUserProfileById(
        user_id,
        username,
        privilege_level,
        account_status
      );
      if (updateResult.statusCode === 200) {
        UserService.accountStatusChangePerformance(
          user_id,
          username,
          account_status
        );
      }
      res.status(updateResult.statusCode).json(updateResult.data);
    } catch (error) {
      console.error("Error updating user info:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static accountStatusChangePerformance(userId, username, accountStatus) {
    if (accountStatus === ACCOUNT_STATUS.INACTIVE) {
      UserService.io
        .to(username)
        .emit(
          "inactiveAccount",
          "Your account is inavtivated by administrator."
        );
    }

    ESNDirectoryService.updateESNDirectoryByUserAccountStatus(
      userId,
      accountStatus
    );
  }
}

export default UserService;

export { userRedisClient };
