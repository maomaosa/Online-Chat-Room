import DatabaseManager from "../data/DatabaseManager.js";
class ESNGuideData {

    
    static async getQuestionairs() {
        const query = 'SELECT * FROM esn_questionnaire ORDER BY questionnaires_name';

        try {
            const result = await DatabaseManager.getDb().query(query);
            return result.rows;
        } catch (error) {
            console.error("Error getting ESNQuestionair:", error);
            throw new Error("Error getting ESNQuestionair");
        }

    }

    static async getQuestionairById(questionairId) {
        const query = 'SELECT * FROM esn_questionnaire WHERE questionnaire_id = $1';
        const values = [questionairId];

        try {
            const result = await DatabaseManager.getDb().query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error("Error getting ESNQuestionair:", error);
            throw new Error("Error getting ESNQuestionair");
        }
    }

    static async saveQuestionair(questionair) {
        const query = `
        INSERT INTO esn_questionnaire (questionnaires_name, question_1, question_2, question_3, question_4, question_5)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `;

        const values = [
            questionair.questionnaires_name,
            questionair.question_1,
            questionair.question_2,
            questionair.question_3,
            questionair.question_4,
            questionair.question_5];

        try {
            await DatabaseManager.getDb().query(query, values);
            return ("Questionair saved successfully");

        } catch (error) {
            console.error("Error Saving Questionair", error);
            throw new Error("Error Saving Questionair");
        }
    }

    static async deleteQuestionair(questionairId) {
        const query = 'DELETE FROM esn_questionnaire WHERE questionnaire_id = $1';
        const values = [questionairId];

        // if questionair does not exist, throw an error
        const questionair = await ESNGuideData.getQuestionairById(questionairId);
        if (!questionair) {
            throw new Error("Try to Delete a non-existing Questionair");
        }

        try {
            await DatabaseManager.getDb().query(query, values);
            return ("Questionair deleted successfully");
        } catch (error) {
            console.error("Error deleting ESNQuestionair:", error);
            throw new Error("Error deleting ESNQuestionair");
        }

    }

    static async updateQuestionair(questionairId, questionair) {
        const query = `
        UPDATE esn_questionnaire
        SET questionnaires_name = $1, question_1 = $2, question_2 = $3, question_3 = $4, question_4 = $5, question_5 = $6
        WHERE questionnaire_id = $7
        RETURNING *
        `;

        const values = [
            questionair.questionnaires_name,
            questionair.question_1,
            questionair.question_2,
            questionair.question_3,
            questionair.question_4,
            questionair.question_5,
            questionairId
        ];

        try {
            await DatabaseManager.getDb().query(query, values);
            return ("Questionair updated successfully");
        } catch (error) {
            console.error("Error updating ESNQuestionair:", error);
            throw new Error("Error updating ESNQuestionair");
        }
    }
}

export default ESNGuideData;

