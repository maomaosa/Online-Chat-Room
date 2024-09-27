import UserProfileData from "../model/UserProfileData.js";

class UserProfileService {
  static io;
  static connect(io) {
    UserProfileService.io = io;
  }
  static numberTostring(jobType) {
    let jobTypeString;
    switch (jobType) {
      case "0":
        jobTypeString = "Null";
        break;
      case "1":
        jobTypeString = "Doctor";
        break;
      case "2":
        jobTypeString = "Dentist";
        break;
      case "3":
        jobTypeString = "Nurse";
        break;
      case "4":
        jobTypeString = "Psychologist";
        break;
      case "5":
        jobTypeString = "Police";
        break;
      case "6":
        jobTypeString = "FireFighter";
        break;
      default:
        jobTypeString = "Unknown Job Type";
    }
    return jobTypeString;
  }
  static checkCompleteness(profileData) {
    if (!profileData) {
      throw new Error("Missing or empty required fields");
    } else {
      return profileData;
    }
  }

  static async getProfilesByJobType(req, res) {
    try {
      const jobType = req.params.jobType;
      UserProfileService.checkCompleteness(jobType);
      let jobTypeString;
      jobTypeString = UserProfileService.numberTostring(jobType);
      if (jobTypeString === "Unknown Job Type") {
        res.status(400).send("Invalid jobType");
      } else {
        const profiles = await UserProfileData.getProfilesByJobType(jobType);
        res.status(200).json({ jobType: jobTypeString, profiles });
      }
    } catch (error) {
      res.status(500).send("Server error: " + error.message);
    }
  }

  static async getProfilesByUsername(req, res) {
    try {
      const { username } = req.params;
      UserProfileService.checkCompleteness(username);
      const profiles = await UserProfileData.getUserAndProfileByUsername(
        username
      );
      res.status(200).json(profiles);
    } catch (error) {
      res.status(500).send("Server error: " + error.message);
    }
  }

  static async postUserProfile(req, res) {
    try {
      const profileData = req.body;
      if (profileData.user_id == null) {
        return res.status(400).send("null user_id");
      }
      const { user_id } = req.body;

      const profile = await UserProfileData.insertUserProfile(
        user_id,
        profileData
      );
      res.status(201).json(profile);
    } catch (error) {
      res.status(500).send("Server error: " + error.message);
    }
  }

  static async deleteUserProfile(req, res) {
    try {
      const userId = req.userInfo.userId;
      const deleteId = req.body.userId;
      if (userId !== deleteId) {
        return res.status(400).send("user id not match");
      }
      const data = await UserProfileData.deleteUserProfile(userId);
      res.status(200).send(data);
    } catch (error) {
      res.status(500).send("Server error: " + error.message);
    }
  }

  static async updateUserProfile(req, res) {
    try {
      const updatedProfileData = req.body;
      if (updatedProfileData.user_id == null) {
        return res.status(400).send("null user_id");
      }
      const updatedProfile = await UserProfileData.updateUserProfile(
        updatedProfileData
      );
      res.status(200).json(updatedProfile);
    } catch (error) {
      res.status(500).send("Server error: " + error.message);
    }
  }
}

export default UserProfileService;
