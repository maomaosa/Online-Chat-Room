import ESNGuideData from "../model/ESNGuideData.js";

class ESNGuideService {
  static io;
  static connect(io) {
    ESNGuideService.io = io;
  }

  static async getQuestionair(req, res) {
    try {
      const result = await ESNGuideData.getQuestionairs();
      res.status(201).send(result);
    } catch (error) {
      res.status(400).send("Error getting questionair");
    }
  }

  static async getQuestionairById(req, res) {
    try {
      const result = await ESNGuideData.getQuestionairById(req.params.id);
      res.status(201).send(result);
    } catch (error) {
      res.status(400).send("Error getting questionair");
    }
  }

  static validateQuestionnaire(req, res) {
    if (!req.body.questionnaires_name) {
      res.status(400).send("Questionair name cannot be empty");
      return false;
    }
  
    if (
      !req.body.question_1 ||
      !req.body.question_2 ||
      !req.body.question_3 ||
      !req.body.question_4 ||
      !req.body.question_5
    ) {
      res.status(400).send("Please Enter all Five Questions");
      return false;
    }
  
    return true;
  }
  
  static async updateQuestionair(req, res) {
    if (!ESNGuideService.validateQuestionnaire(req, res)) return;
  
    try {
      const result = await ESNGuideData.updateQuestionair(req.params.id, req.body);
      res.status(201).send(result);
    } catch (error) {
      res.status(400).send("Error updating questionair");
    }
  }
  
  static async createQuestionair(req, res) {
    if (!ESNGuideService.validateQuestionnaire(req, res)) return;
  
    const newQuestionair = req.body;
  
    try {
      await ESNGuideData.saveQuestionair(newQuestionair);
      res.status(201).send("Questionair saved successfully");
    } catch (error) {
      res.status(400).send("Error saving questionair");
    }
  }
  

  static async deleteQuestionair(req, res) {
    try {
      await ESNGuideData.deleteQuestionair(req.params.id);
      res.status(201).send("Questionair deleted successfully");
    } catch (error) {
      res.status(400).send(error.message);
    }
  }

  static async getGuide(req, res) {
    const prompt = req.body.prompt;
    if (prompt) {
      try {
        let guide = await generateGuide(prompt, 0);
        res.status(201).send(guide);
      } catch (error) {}
    } else {
      res.status(400).send("Prompt is required");
    }
  }
}

export default ESNGuideService;

function generateGuide(prompt, retryCount) {
  return fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer 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",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      n: 1,
      stop: null,
      temperature: 0.7,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      return data.choices[0].message.content;
    })
    .catch((error) => {
      console.error("Error generating guide:", error);
      if (retryCount < 3) {
        return generateGuide(prompt, retryCount + 1);
      } else {
        return "Error generating guide";
      }
    });
}
