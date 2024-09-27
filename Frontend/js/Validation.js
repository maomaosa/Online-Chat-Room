async function getBannedUsernames() {
  try {
    const response = await fetch("../../BannedUsernames.txt");
    const data = await response.text();
    const bannedUsernames = data.split(",");
    return bannedUsernames;
  } catch (error) {
    console.error("Error fetching banned usernames:", error);
    return [];
  }
}
async function isValidateUsername(usernameValue) {
    const bannedUsernames = await getBannedUsernames();
    if (usernameValue == undefined || usernameValue.length < 3) {
      displayAlert("Invalid username. Please set another.");
      return false;
    } else if (
      bannedUsernames &&
      bannedUsernames.includes(usernameValue.trim().toLowerCase())
    ) {
      displayAlert("Username banned! Please set another.");
      return false;
    }
    return true;
  }
  function isValidatePassword(passwordValue) {
    if (passwordValue == undefined || passwordValue.length < 4) {
      displayAlert("Invalid password. Please enter another.");
      return false;
    }
    return true;
  }

async function getExistingUser(username) {
    let getExistingUserURL = `/users/${encodeURIComponent(
      username.toLowerCase()
    )}`;
    try {
      let response = await fetch(getExistingUserURL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if(response.status === 401){
        displayAlert("You Cannot Register during Speed Test");
        return null;
      }
      if (response.status === 400) {
        return null;
      }
      let userInfo = await response.json();
      return userInfo;
    } catch (error) {
      console.error("Error:", error);
    }
  }