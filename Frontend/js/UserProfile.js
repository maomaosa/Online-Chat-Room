const modalUsername=document.getElementById('modalUsername')
const userId = document.getElementById('modalUserId')
const modalPrivilegeLevel=document.getElementById('modalPrivilegeLevel')
const modalAccountStatus=document.getElementById('modalAccountStatus')
const modalPassword=document.getElementById('modalPassword')
const usersTableBody = document.getElementById('usersTableBody');
const editUserForm=document.getElementById('editUserForm')
const alertDisplayDOM = document.getElementById("alert-display");
document.addEventListener("DOMContentLoaded", function () {

    fetch("/users/profiles/info", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => response.json())
    .then(data => {
        data.data.forEach(user => {
            const row = usersTableBody.insertRow();
            row.setAttribute('data-user-id', user.user_id); // Set data attribute for the row
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.account_status === 0 ? 'Active' : 'Inactive'}</td>
                <td>${['User', 'Coordinator', 'Administrator'][user.privilege_level]}</td>
                <td><button class="btn btn-primary edit-btn" data-bs-toggle="modal" data-bs-target="#editUserModal" data-user-id="${user.user_id}" onclick="populateModal(${user.user_id})">Edit</button></td>
            `;
        });
        
    })
    .catch(error => console.error('Error loading users:', error));
});

function populateModal(userId) {
    // Find the row using data attribute
    const row = document.querySelector(`[data-user-id='${userId}']`);
    if (!row) {
        console.error('User row not found');
        return;
    }
    const cells = row.querySelectorAll('td'); // This fetches all cells in the row
    modalUserId.value = userId;
    modalUsername.value = cells[0].innerText;
    modalUsername.setAttribute('data-original-username', cells[0].innerText);
    modalPrivilegeLevel.value = {
        'User': '0', 
        'Coordinator': '1', 
        'Administrator': '2'
    }[cells[2].innerText];
    modalAccountStatus.value = cells[1].innerText === 'Active' ? '0' : '1';
    modalPassword.value = '......'; // Reset password field
}

function displayAlert(message) {
    alertDisplayDOM.innerHTML = message;
    alertDisplayDOM.style.display = "block";
  }
  
function hideAlert() {
    alertDisplayDOM.style.display = "none";
}
editUserForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const userId = modalUserId.value;
    const username = modalUsername.value;
    const password = modalPassword.value; 
    const privilegeLevel = modalPrivilegeLevel.value;
    const accountStatus = modalAccountStatus.value;
    const originalUsername = modalUsername.getAttribute('data-original-username'); 
    const requestBody = {
        user_id: userId,
        username: username,
        passwordHash: CryptoJS.MD5(password).toString(), 
        privilege_level: privilegeLevel,
        account_status: accountStatus
    };
    if (username !== originalUsername) {
        if (await isValidateUsername(username) ) {
            const existingUser = await checkExistingUser(username);
            if (!existingUser) {
                displayAlert("Username already exists. Please choose another username.");
                return;
            }
        } else {
            return;
        }
    }
    if(!isValidatePassword(password)){
        displayAlert("password invalid.");
        return;
    }
    fetch(`/users/userId`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    }).then(response => {
        if(response.status==451){
            alert("system onlt exits one admin,cannot change Privilege Level")
            return;
        }else{
            $('#confirmationModal').modal('show');
        setTimeout(() => {
            $('#confirmationModal').modal('hide');
            $('#confirmationModal').on('hidden.bs.modal', function () {
                hideAlert(); 
                location.reload();
            });
        }, 1000);

        }
       
    })
    .catch(error => {
        console.error('Error:', error);
    });

});
async function checkExistingUser(username) {
    const userInfoData = await getExistingUser(username);
    let userInfo = userInfoData.data;
    if (userInfo == null) {
      hideAlert();
      return true;
    } 
    return false;
}
const closeButtons = document.querySelectorAll('[data-bs-dismiss="modal"], [data-dismiss="modal"]');

closeButtons.forEach(button => {
  button.addEventListener('click', hideAlert);
});