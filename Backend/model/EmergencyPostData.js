import DatabaseManager from "../data/DatabaseManager.js";

class EmergencyPostData {
    //insert emergency post
    static async insertEmergencyPost(emergencyPost) {
        try{
            const { type, title, address, content, fileurl, user_id, user_name } = emergencyPost;

            const sqlQuery = `
                INSERT INTO esn_emergency_post (accident_category, title, address, content, picture_url, user_id, user_name) 
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *;`;
            const values = [type, title, address, content, fileurl, user_id, user_name];
            const result = await DatabaseManager.getDb().query(sqlQuery, values);
            if (result.rows.length > 0) {
                const insertedPost = result.rows[0];
                return { statusCode: 201, data: insertedPost };
            } else {
                throw new Error("Insertion failed: No rows returned");
            }
        }
        catch (error) {
            console.error("Error inserting emergency post:", error);
            throw new Error("Error inserting emergency post");
        }
    }

    //get all emergency posts
    static async getEmergencyPosts() {
        const sqlQuery = "SELECT * FROM esn_emergency_post";
        try {
            const result = await DatabaseManager.getDb().query(sqlQuery);
            return { statusCode: 201, data: result.rows };
        } catch (error) {
            console.error("Error getting emergency posts:", error);
            throw new Error("Error getting emergency posts: " + error.message);
        }
    }

    //get single emergency post by post id
    static async getEmergencyPostById(postid) {
        const sqlQuery = "SELECT * FROM esn_emergency_post WHERE post_id = $1";
        const values = [postid];
        try {
            const result = await DatabaseManager.getDb().query(sqlQuery, values);
            return { statusCode: 201, data: result.rows };
        } catch (error) {
            console.error("Error getting emergency post:", error);
            throw new Error("Error getting emergency post: " + error.message);
        }
    }

    //insert commnet 
    static async insertComment(comment) {
        try {
            const { post_id, user_id, user_name, content } = comment;
            const sqlQuery = `
                INSERT INTO esn_post_comment (post_id, user_id, user_name, comment_content) 
                VALUES ($1, $2, $3, $4)
                RETURNING *;`;
            const values = [post_id, user_id, user_name, content];
            const result = await DatabaseManager.getDb().query(sqlQuery, values);
            if (result.rows.length > 0) {
                const insertedComment = result.rows[0];
                return { statusCode: 201, data: insertedComment };
            } else {
                throw new Error("Insertion failed: No rows returned");
            }
        }
        catch (error) {
            console.error("Error inserting comment:", error);
            throw new Error("Error inserting comment");
        }
    }

    //get comments for a post
    static async getComments(postid) {
        const sqlQuery = "SELECT * FROM esn_post_comment WHERE post_id = $1";
        const values = [postid];
        try {
            const result = await DatabaseManager.getDb().query(sqlQuery, values);
            return { statusCode: 201, data: result.rows };
        } catch (error) {
            console.error("Error getting comments:", error);
            throw new Error("Error getting comments: " + error.message);
        }
    }

    static async helpEmergencyPost(postid, user_id) {
        const sqlQuery = `
            INSERT INTO esn_post_can_help (post_id, user_id) 
            VALUES ($1, $2)
            RETURNING *;`;
        const values = [postid, user_id];
        try {
            const result = await DatabaseManager.getDb().query(sqlQuery, values);
            if (result.rows.length > 0) {
                const insertedHelp = result.rows[0];
                return { statusCode: 201, data: insertedHelp };
            } else {
                throw new Error("Insertion failed: No rows returned");
            }
        } catch (error) {
            console.error("Error helping emergency post:", error);
            throw new Error("Error helping emergency post: " + error.message);
        }
    }

    static async clearEmergencyPost(postid, user_id) {
        const sqlQuery = `
            INSERT INTO esn_post_cleared (post_id, user_id) 
            VALUES ($1, $2)
            RETURNING *;`;
        const values = [postid, user_id];
        try {
            const result = await DatabaseManager.getDb().query(sqlQuery, values);
            if (result.rows.length > 0) {
                const insertedClear = result.rows[0];
                return { statusCode: 201, data: insertedClear };
            } else {
                throw new Error("Insertion failed: No rows returned");
            }
        } catch (error) {
            console.error("Error clearing emergency post:", error);
            throw new Error("Error clearing emergency post: " + error.message);
        }
    }

    static async getHelpList(postid) {
        const sqlQuery = "SELECT * FROM esn_post_can_help WHERE post_id = $1";
        const values = [postid];
        try {
            const result = await DatabaseManager.getDb().query(sqlQuery, values);
            return { statusCode: 201, data: result.rows };
        } catch (error) {
            console.error("Error getting help list:", error);
            throw new Error("Error getting help list: " + error.message);
        }
    }

    static async getClearList(postid) {
        const sqlQuery = "SELECT * FROM esn_post_cleared WHERE post_id = $1";
        const values = [postid];
        try {
            const result = await DatabaseManager.getDb().query(sqlQuery, values);
            return { statusCode: 201, data: result.rows };
        } catch (error) {
            console.error("Error getting clear list:", error);
            throw new Error("Error getting clear list: " + error.message);
        }
    }

    static async deleteHelp(postid, user_id) {
        const sqlQuery = "DELETE FROM esn_post_can_help WHERE post_id = $1 AND user_id = $2";
        const values = [postid, user_id];
        try {
            await DatabaseManager.getDb().query(sqlQuery, values);
            return { statusCode: 201, data: postid };
        } catch (error) {
            console.error("Error deleting help label:", error);
            throw new Error("Error deleting help label: " + error.message);
        }
    }

    static async deleteClear(postid, user_id) {
        const sqlQuery = "DELETE FROM esn_post_cleared WHERE post_id = $1 AND user_id = $2";
        const values = [postid, user_id];
        try {
            await DatabaseManager.getDb().query(sqlQuery, values);
            return { statusCode: 201, data: postid };
        } catch (error) {
            console.error("Error deleting clear label:", error);
            throw new Error("Error deleting clear label: " + error.message);
        }
    }

}

export default EmergencyPostData;