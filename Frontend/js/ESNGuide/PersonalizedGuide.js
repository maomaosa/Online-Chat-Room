document.addEventListener("DOMContentLoaded", function () {
  const questionnaireList = document.getElementById('questionnaireGuideList');

  fetch("/esnGuides/get", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })
    .then((res) => {
      if (res.status === 201) {
        return res.json();
      }
    })
    .then((questionnaires) => {
      questionnaires.forEach((questionnaire) => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        listItem.innerHTML = `
          ${questionnaire.questionnaires_name}
          <div>
            <button class="btn btn-primary btn-sm startBtn" data-id="${questionnaire.questionnaire_id}">Start</button>
          </div>
        `;
        questionnaireList.appendChild(listItem);
      });

      // Add event listeners for the "Start" buttons
      const startBtn = document.querySelectorAll('.startBtn');
      startBtn.forEach((startBtn) => {
          startBtn.addEventListener("click", function () {
          const questionnaireId = this.getAttribute('data-id');
          navigateToUpdatePage(questionnaireId);
        });
      });
    })
    .catch((error) => {
      console.error('Error retrieving questionnaires:', error);
    });

  function navigateToUpdatePage(questionnaireId) {
    window.location.href = `../ESNGuide/AnsweringQuestionair.html?id=${questionnaireId}`;
  }

  document.getElementById("backBtn").addEventListener("click", function () {
    window.location.href = "../ESNGuide.html";
  });
});