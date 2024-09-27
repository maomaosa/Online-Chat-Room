const getUserInfo = async () => {
    let getCurrentUserInfoURL = "/users/currentUser/info";
    try {
      let response = await fetch(getCurrentUserInfoURL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      let userInfo = await response.json();
      return userInfo;
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const getRenderUserShareStatus = (shareStatus) => {
    switch (shareStatus) {
      case 1:
        return '<i class="fa fa-check-circle fa-lg" aria-hidden="true"></i>';
      case 2:
        return '<i class="fa fa-exclamation-circle fa-lg" aria-hidden="true"></i>';
      case 3:
        return '<i class="fa fa-plus-square fa-lg" aria-hidden="true"></i>';
      case 0:
      default:
        return '<i class="fa fa-ban fa-lg" aria-hidden="true"></i>';
    }
  };