import DatabaseManager from "../Backend/data/DatabaseManager.js";
import ESNGuideData from "../Backend/model/ESNGuideData.js";
import ESNGuideService from "../Backend/service/esnGuideService.js";

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res); // Allows chaining
    res.send = jest.fn().mockReturnValue(res); // Allows chaining
    return res;
  };
  


beforeAll(async () => {
    await DatabaseManager.connectToDatabase("esn_test");

  });

afterEach(async () => {
    const resetQuery = `
    BEGIN;

    TRUNCATE TABLE esn_user RESTART IDENTITY CASCADE;
    TRUNCATE TABLE esn_directory RESTART IDENTITY CASCADE;
    TRUNCATE TABLE esn_message RESTART IDENTITY CASCADE;
    TRUNCATE TABLE esn_user_share_status RESTART IDENTITY CASCADE;
    TRUNCATE TABLE esn_user_share_status_history RESTART IDENTITY CASCADE;
    TRUNCATE TABLE esn_questionnaire RESTART IDENTITY CASCADE;

    COMMIT;
    `;

    await DatabaseManager.db.query(resetQuery);
  });

afterAll(async () => {
await DatabaseManager.closeDatabase();
});

// 10 unit tests

test("getQuestionair returns all questionairs", async () => {
    await ESNGuideData.saveQuestionair({
      questionnaires_name: "Test Questionair",
      question_1: "Question 1",
      question_2: "Question 2",
      question_3: "Question 3",
      question_4: "Question 4",
      question_5: "Question 5",
    });

    await ESNGuideData.saveQuestionair({
        questionnaires_name: "Test Questionair2",
        question_1: "Question 1",
        question_2: "Question 2",
        question_3: "Question 3",
        question_4: "Question 4",
        question_5: "Question 5",
      });

    // mock response object
    const res = mockRes();

    await ESNGuideService.getQuestionair({}, res);
    expect(res.status).toHaveBeenCalledWith(201);
    // measure the lenght of the array
    expect(res.send).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ questionnaires_name: "Test Questionair" }),
      expect.objectContaining({ questionnaires_name: "Test Questionair2" }),
    ]));
  }
);

test("getQuestionairById returns a questionair", async () => {
    await ESNGuideData.saveQuestionair({
      questionnaires_name: "Test Questionair",
      question_1: "Question 1",
      question_2: "Question 2",
      question_3: "Question 3",
      question_4: "Question 4",
      question_5: "Question 5",
    });

    const saveQuestionair = await ESNGuideData.getQuestionairs();
    const req = { params: { id: saveQuestionair[0].questionnaire_id } };

    const res = mockRes();

    await ESNGuideService.getQuestionairById(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ questionnaires_name: "Test Questionair" }));
  }
);

test("updateQuestionair updates a questionair", async () => {
    await ESNGuideData.saveQuestionair({
      questionnaires_name: "Test Questionair",
      question_1: "Question 1",
      question_2: "Question 2",
      question_3: "Question 3",
      question_4: "Question 4",
      question_5: "Question 5",
    });

    const updatedQuestionair = {
      questionnaires_name: "Updated Questionair",
      question_1: "Question 1",
      question_2: "Question 2",
      question_3: "Question 3",
      question_4: "Question 4",
      question_5: "Question 5",
    };

    const saveQuestionair = await ESNGuideData.getQuestionairs();

    const req = { params: { id: saveQuestionair[0].questionnaire_id }, body: updatedQuestionair };

    const res = mockRes();

    await ESNGuideService.updateQuestionair(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith("Questionair updated successfully");
  }
);

test("createQuestionair creates a questionair", async () => {
    const newQuestionair = {
      questionnaires_name: "Test Questionair",
      question_1: "Question 1",
      question_2: "Question 2",
      question_3: "Question 3",
      question_4: "Question 4",
      question_5: "Question 5",
    };

    const req = { body: newQuestionair };
    const res = mockRes();

    await ESNGuideService.createQuestionair(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith("Questionair saved successfully");

  }
);

test("createQuestionair throws an error if questionnaires_name is missing", async () => {
    const newQuestionair = {
      question_1: "Question 1",
      question_2: "Question 2",
      question_3: "Question 3",
      question_4: "Question 4",
      question_5: "Question 5",
    };

    const req = { body: newQuestionair };
    const res = mockRes();

    await ESNGuideService.createQuestionair(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Questionair name cannot be empty");
    
  }
);

test("deleteQuestionair deletes a questionair", async () => {
    const savedQuestionair = await ESNGuideData.saveQuestionair({
      questionnaires_name: "Test Questionair",
      question_1: "Question 1",
      question_2: "Question 2",
      question_3: "Question 3",
      question_4: "Question 4",
      question_5: "Question 5",
    });

    const saveQuestionair = await ESNGuideData.getQuestionairs();
    const req = { params: { id: saveQuestionair[0].questionnaire_id } };
    const res = mockRes();

    await ESNGuideService.deleteQuestionair(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith("Questionair deleted successfully");
  }
);

test("deleteQuestionair throws an error if questionair does not exist", async () => {
    const req = { params: { id: 3 } };
    const res = mockRes();

    try {
      await ESNGuideService.deleteQuestionair(req, res);
    } catch (error) {
      expect(error.message).toBe("Error getting ESNQuestionair");
    }
  }
);




// test if questionair name is missing
test("saveQuestionair throws an error if questionnaires_name is missing", async () => {
    const newQuestionair = {
      question_1: "Question 1",
      question_2: "Question 2",
      question_3: "Question 3",
      question_4: "Question 4",
      question_5: "Question 5",
    };

    try {
      await ESNGuideData.saveQuestionair(newQuestionair);
    } catch (error) {
      expect(error.message).toBe("Error Saving Questionair");
    }
  }
);

// test saveQuestionair
test("saveQuestionair saves a questionair", async () => {
    const newQuestionair = {
      questionnaires_name: "Test Questionair",
      question_1: "Question 1",
      question_2: "Question 2",
      question_3: "Question 3",
      question_4: "Question 4",
      question_5: "Question 5",
    };

    const result = await ESNGuideData.saveQuestionair(newQuestionair);
    expect(result).toBe("Questionair saved successfully");
  }
);

// test get getGuide if prompt is missing
test("getGuide throws an error if prompt is missing", async () => {
    const req = { body: {} };
    const res = mockRes();
    try {
      await ESNGuideService.getGuide(req, res);
    } catch (error) {
      expect(error.message).toBe("Prompt is required");
    }

  }
);

