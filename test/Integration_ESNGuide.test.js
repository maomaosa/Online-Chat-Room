import DatabaseManager from "../Backend/data/DatabaseManager.js";
import ESNGuideData from "../Backend/model/ESNGuideData.js";
import ESNGuideService from "../Backend/service/esnGuideService.js";


beforeAll(async () => {
    await DatabaseManager.connectToDatabase("esn_test");
  });

afterEach(async () => {
    await DatabaseManager.getDb().query("DELETE FROM esn_questionnaire");
  });

afterAll(async () => {
await DatabaseManager.closeDatabase();
});



// 7 integration tests

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

    const req = {};
    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    await ESNGuideService.getQuestionair(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
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

    const savedQuestionair = await ESNGuideData.getQuestionairs();

    const req = {
      params: { id: savedQuestionair[0].questionnaire_id },
    };
    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

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

    const savedQuestionair = await ESNGuideData.getQuestionairs();

    const req = {
      params: { id: savedQuestionair[0].questionnaire_id },
      body: updatedQuestionair,
    };
    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

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

    const req = {
      body: newQuestionair,
    };
    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    await ESNGuideService.createQuestionair(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith("Questionair saved successfully");
  }
);

test("deleteQuestionair deletes a questionair", async () => {
    await ESNGuideData.saveQuestionair({
      questionnaires_name: "Test Questionair",
      question_1: "Question 1",
      question_2: "Question 2",
      question_3: "Question 3",
      question_4: "Question 4",
      question_5: "Question 5",
    });


    const savedQuestionair = await ESNGuideData.getQuestionairs();
    const req = {
      params: { id: savedQuestionair[0].questionnaire_id },
    };
    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    await ESNGuideService.deleteQuestionair(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith("Questionair deleted successfully");
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

    const req = {
      body: newQuestionair,
    };
    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    await ESNGuideService.createQuestionair(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

  }
);









  


