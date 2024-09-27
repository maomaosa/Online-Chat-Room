document.addEventListener("DOMContentLoaded", function () {
  // Save button
  document.getElementById("saveBtn").addEventListener("click", function () {
    QuestionairName = document.getElementById("questionairName");
    Question1 = document.getElementById("question1");
    Question2 = document.getElementById("question2");
    Question3 = document.getElementById("question3");
    Question4 = document.getElementById("question4");
    Question5 = document.getElementById("question5");

    const questionair = {
      questionnaires_name: QuestionairName.value,
      question_1: Question1.value,
      question_2: Question2.value,
      question_3: Question3.value,
      question_4: Question4.value,
      question_5: Question5.value,
    };

    // if questionair name is empty
    if (questionair.questionnaires_name === "") {
      alert("Questionair name cannot be empty");
      return;
    }

    // if questions are empty
    if (
      questionair.question_1 === "" ||
      questionair.question_2 === "" ||
      questionair.question_3 === "" ||
      questionair.question_4 === "" ||
      questionair.question_5 === ""
    ) {
      alert("Please Enter all Five Questions");
      return;
    }

    fetch("/esnGuides/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(questionair),
    })
      .then((res) => {
        if (res.status === 201) {
          alert("Questionair saved successfully");
          window.location.href = "../ESNGuide.html";
        } else {
          alert("Questionair not saved successfully, Something is wrong");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });

  document.getElementById("backBtn").addEventListener("click", function () {
    window.location.href = "../ESNGuide.html";
  });
});
