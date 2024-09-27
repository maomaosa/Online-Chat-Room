document.addEventListener("DOMContentLoaded", function () {
    const questionnaireList = document.getElementById('questionnaireList');
  
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
              <button class="btn btn-primary btn-sm viewBtn" data-id="${questionnaire.questionnaire_id}">View</button>
              <button class="btn btn-danger btn-sm deleteBtn" data-id="${questionnaire.questionnaire_id}">Delete</button>
            </div>
          `;
          questionnaireList.appendChild(listItem);
        });

        // add event listeners for the "Delete" buttons
        const deleteBtns = document.querySelectorAll('.deleteBtn');
        deleteBtns.forEach((deleteBtn) => {
          deleteBtn.addEventListener("click", function () {
            const questionnaireId = this.getAttribute('data-id');
            fetch(`/esnGuides/delete/${questionnaireId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              }
            })
              .then((res) => {
                if (res.status === 201) {
                  alert("Questionnaire deleted successfully");
                  window.location.href = "../ESNGuide/QuestionairList.html";
                }
              })
              .catch((error) => {
                console.error('Error deleting questionnaire:', error);
              });
          });
        });

  
        // Add event listeners for the "View" buttons
        const viewBtns = document.querySelectorAll('.viewBtn');
        viewBtns.forEach((viewBtn) => {
          viewBtn.addEventListener("click", function () {
            const questionnaireId = this.getAttribute('data-id');
            navigateToUpdatePage(questionnaireId);
          });
        });
      })
      .catch((error) => {
        console.error('Error retrieving questionnaires:', error);
      });
  
    function navigateToUpdatePage(questionnaireId) {
      window.location.href = `../ESNGuide/UpdateQuestionair.html?id=${questionnaireId}`;
    }
  
    document.getElementById("backBtn").addEventListener("click", function () {
      window.location.href = "../ESNGuide.html";
    });
  });