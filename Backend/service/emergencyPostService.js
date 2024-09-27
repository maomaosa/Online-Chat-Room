import EmergencyPostData from "../model/EmergencyPostData.js";
import AWS from "aws-sdk";
import SubscribeManager from "../entity/SubscribeManager.js";
import PostObserver from "../entity/PostObserver.js";

const postManagerPairs = new Map();

//AWS setting
const s3 = new AWS.S3({
  accessKeyId: "",
  secretAccessKey: "",
  region: "",
});

class EmergencyPostService {
  //IO setting
  static io;
  static connect(io) {
    EmergencyPostService.io = io;
  }

  //post picture to s3
  static async postEmergencyPostPicture(req, res) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(401).send("Please upload a file.");
      }

      const s3Params = {
        Bucket: "i4yuyangfanpicture/i4picture",
        Key: `${Date.now()}_${file.originalname}`,
        Body: file.buffer,
      };

      s3.upload(s3Params, (error, data) => {
        if (error) {
          return res.status(402).send(error);
        } else {
          return res.status(201).send(data.Location);
        }
      });
    } catch (error) {
      console.error("Error uploading picture:", error);
      res.status(400).send("Error uploading picture");
    }
  }

  //post emergency post
  static async postEmergencyPost(req, res) {
    try {
      const { type, title, address, content, fileurl } = req.body;
      const emergencyPost = {
        type,
        title,
        address,
        content,
        fileurl,
        user_id: req.userInfo.userId,
        user_name: req.userInfo.username,
      };

      const insertResult = await EmergencyPostData.insertEmergencyPost(
        emergencyPost
      );
      if (insertResult.statusCode === 201) {
        EmergencyPostService.io.emit("newPost", insertResult.data);
        res.status(201).send(insertResult.data);
      }
    } catch (error) {
      console.error("Error posting emergency post:", error);
      res.status(400).send("Internal Server Error");
    }
  }

  //get all emergency posts
  static async getEmergencyPosts(req, res) {
    try {
      const posts = await EmergencyPostData.getEmergencyPosts();
      res.status(201).json(posts);
    } catch (error) {
      console.error("Error getting emergency posts:", error);
      res.status(400).send("Internal Server Error");
    }
  }

  //get single emergency post
  static async getSingleEmergencyPost(req, res) {
    const postid = req.params.postid;
    try {
      const post = await EmergencyPostData.getEmergencyPostById(postid);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error getting emergency post:", error);
      res.status(400).send("Internal Server Error");
    }
  }

  //post commet for emergency post
  static async postComment(req, res) {
    //const postid = req.params.postid;
    const { content, postid } = req.body;
    try {
      const comment = {
        post_id: postid,
        user_id: req.userInfo.userId,
        user_name: req.userInfo.username,
        content,
      };
      const insertResult = await EmergencyPostData.insertComment(comment);
      if (insertResult.statusCode === 201) {
        //EmergencyPostService.io.emit("newComment", insertResult.data);
        let postManager;
        if (postManagerPairs.has(postid)) {
          postManager = postManagerPairs.get(postid);
        } else {
          postManager = new SubscribeManager();
          postManagerPairs.set(postid, postManager);
        }
        postManager.notify(insertResult.data);
        res.status(201).send(insertResult.data);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      res.status(400).send("Internal Server Error");
    }
  }

  //get comments for emergency post
  static async getComments(req, res) {
    const postid = req.params.postid;
    try {
      const comments = await EmergencyPostData.getComments(postid);
      res.status(201).json(comments);
    } catch (error) {
      console.error("Error getting comments:", error);
      res.status(400).send("Internal Server Error");
    }
  }

  //add help label to post
  static async helpEmergencyPost(req, res) {
    const postid = req.params.postid;
    const userid = req.userInfo.userId;
    try {
      const result = await EmergencyPostData.helpEmergencyPost(postid, userid);
      if (result.statusCode === 201) {
        EmergencyPostService.io.emit("PostLabelAddEvent", {
          post_id: result.data.post_id,
          label: "help",
        });
        res.status(201).send(result.data);
      }
    } catch (error) {
      console.error("Error helping emergency post:", error);
      res.status(400).send("Internal Server Error");
    }
  }

  //add clear label to post
  static async clearEmergencyPost(req, res) {
    const postid = req.params.postid;
    const userid = req.userInfo.userId;
    try {
      const result = await EmergencyPostData.clearEmergencyPost(postid, userid);
      if (result.statusCode === 201) {
        EmergencyPostService.io.emit("PostLabelAddEvent", {
          post_id: result.data.post_id,
          label: "clear",
        });
        res.status(201).send(result.data);
      }
    } catch (error) {
      console.error("Error clearing emergency post:", error);
      res.status(400).send("Internal Server Error");
    }
  }

  //get help list for a post
  static async getHelpList(req, res) {
    const postid = req.params.postid;
    try {
      const helps = await EmergencyPostData.getHelpList(postid);
      res.status(201).json(helps);
    } catch (error) {
      console.error("Error getting help list:", error);
      res.status(400).send("Internal Server Error");
    }
  }

  //get clear list for a post
  static async getClearList(req, res) {
    const postid = req.params.postid;
    try {
      const clears = await EmergencyPostData.getClearList(postid);
      res.status(201).json(clears);
    } catch (error) {
      console.error("Error getting clear list:", error);
      res.status(400).send("Internal Server Error");
    }
  }

  //delete help label from post
  static async deleteHelp(req, res) {
    const postid = req.params.postid;
    const userid = req.userInfo.userId;
    try {
      const result = await EmergencyPostData.deleteHelp(postid, userid);
      if (result.statusCode === 201) {
        EmergencyPostService.io.emit("PostLabelDeleteEvent", {
          post_id: result.data,
          label: "help",
        });
        res.status(201).send(result.data);
      }
    } catch (error) {
      console.error("Error deleting help label:", error);
      res.status(400).send("Internal Server Error");
    }
  }

  //delete clear label from post
  static async deleteClear(req, res) {
    const postid = req.params.postid;
    const userid = req.userInfo.userId;
    try {
      const result = await EmergencyPostData.deleteClear(postid, userid);
      if (result.statusCode === 201) {
        EmergencyPostService.io.emit("PostLabelDeleteEvent", {
          post_id: result.data,
          label: "clear",
        });
        res.status(201).send(result.data);
      }
    } catch (error) {
      console.error("Error deleting clear label:", error);
      res.status(400).send("Internal Server Error");
    }
  }

  //add subscriber to post
  static async subscribeEmergencyPost(req, res) {
    try {
      const postid = req.params.postid;
      const { socketid } = req.body;
      const socket = EmergencyPostService.io.sockets.sockets.get(socketid);
      //create post manager if not exist for certain post
      let postManager;
      if (postManagerPairs.has(postid)) {
        postManager = postManagerPairs.get(postid);
      } else {
        postManager = new SubscribeManager();
        postManagerPairs.set(postid, postManager);
      }

      const observer = new PostObserver(socket);
      postManager.subscribe(observer);
      res.status(201).send("Subscribed");
    } catch (error) {
      console.error("Error subscribing emergency post:", error);
      res.status(400).send("Internal Server Error");
    }
  }

  //remove subscriber from post
  static async unsubscribeEmergencyPost(req, res) {
    try {
      const postid = req.params.postid;
      const { socketid } = req.body;
      let postManager;
      if (postManagerPairs.has(postid)) {
        postManager = postManagerPairs.get(postid);
        postManager.unsubscribe(socketid);
      }
      res.status(201).send("Unsubscribed");
    } catch (error) {
      console.error("Error unsubscribing emergency post:", error);
      res.status(400).send("Internal Server Error");
    }
  }
}

export default EmergencyPostService;
