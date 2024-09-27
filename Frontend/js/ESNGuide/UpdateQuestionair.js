document.addEventListener("DOMContentLoaded", function () {
    const questionairId = getQuestionairIdFromUrl();
  
    fetch(`/esnGuides/get/${questionairId}`)
      .then((response) => response.json())
      .then((questionair) => {
        document.getElementById("questionairName").value = questionair.questionnaires_name;
        document.getElementById("question1").value = questionair.question_1;
        document.getElementById("question2").value = questionair.question_2;
        document.getElementById("question3").value = questionair.question_3;
        document.getElementById("question4").value = questionair.question_4;
        document.getElementById("question5").value = questionair.question_5;
      })
      .catch((error) => {
        console.error("Error retrieving questionair:", error);
      });
  
    document.getElementById("updateBtn").addEventListener("click", function () {
      const updatedQuestionair = {
        questionnaires_name: document.getElementById("questionairName").value,
        question_1: document.getElementById("question1").value,
        question_2: document.getElementById("question2").value,
        question_3: document.getElementById("question3").value,
        question_4: document.getElementById("question4").value,
        question_5: document.getElementById("question5").value,
      };


        // if questionair name is empty
        if (updatedQuestionair.questionnaires_name === "") {
          alert("Questionair name cannot be empty");
          return;
      }

      // if questions are empty
      if (updatedQuestionair.question_1 === "" || updatedQuestionair.question_2 === "" || updatedQuestionair.question_3 === "" || updatedQuestionair.question_4 === "" || updatedQuestionair.question_5 === "") {
          alert("Please Enter all Five Questions");
          return;
      }


      fetch(`/esnGuides/update/${questionairId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedQuestionair),
      })
        .then((response) => {
          if (response.ok) {
            alert("Questionair updated successfully");
            window.location.href = "../ESNGuide.html";
          } else {
            alert("Failed to update questionair");
          }
        })
        .catch((error) => {
          console.error("Error updating questionair:", error);
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