document.addEventListener("DOMContentLoaded", function () {
    const questionairId = getQuestionairIdFromUrl();
    const getGuideBtn = document.getElementById("getGuideBtn");
    const questionnaireSection = document.getElementById("questionnaireSection");
    const guideSection = document.getElementById("guideSection");
    let questions = [];
    let answers = [];

    fetch(`/esnGuides/get/${questionairId}`)
    .then((response) => response.json())
    .then((questionair) => {
        questions = [questionair.question_1, questionair.question_2, questionair.question_3, questionair.question_4, questionair.question_5];
        document.getElementById("questionairName").textContent = questionair.questionnaires_name;
        document.getElementById("labelQuestion1").textContent = questionair.question_1;
        document.getElementById("labelQuestion2").textContent = questionair.question_2;
        document.getElementById("labelQuestion3").textContent = questionair.question_3;
        document.getElementById("labelQuestion4").textContent = questionair.question_4;
        document.getElementById("labelQuestion5").textContent = questionair.question_5;

        answers = [document.getElementById("answer1"), document.getElementById("answer2"), document.getElementById("answer3"), document.getElementById("answer4"), document.getElementById("answer5")];
    })
    .catch((error) => {
        console.error("Error retrieving questionnaire:", error);
    });

    getGuideBtn.addEventListener("click", function () {
        const userAnswers = answers.map((answer) => answer.value);
        const prompt = generatePrompt(questions, userAnswers);
      
        fetch("/esnGuides/getGuide", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: prompt }),
        })
        .then((res) => {
            if (res.status === 201) {
                res.text().then((guide) => {
                    displayGuide(guide);
                    hideQuestionnaire();
                    showGuideSection();
                });
            }
        }) 
        .catch((error) => {
            console.error("Error retrieving guide:", error);
        });

       
    });

    document.getElementById("backBtn").addEventListener("click", function () {
      window.location.href = "../ESNGuide.html";
    });
});

function getQuestionairIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
}

function generatePrompt(questions, answers) {
    let prompt = "Based on the following questions and answers, generate a personalized guide(return just paragraphs): \n\n";
    for (let i = 0; i < questions.length; i++) {
        prompt += `Question ${i + 1}: ${questions[i]}\n`;
        prompt += `Answer: ${answers[i]}\n\n`;
    }
    return prompt;
}

function hideQuestionnaire() {
    questionnaireSection.style.display = "none";
}

function showGuideSection() {
    guideSection.style.display = "block";
}

function displayGuide(guide) {
    const guideElement = document.getElementById("guideContent");
    guideElement.innerHTML = ""; // Clear previous content

    const guideLines = guide.split("\n");
    guideLines.forEach((line) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = line;
        guideElement.appendChild(paragraph);
    });

}