const formatDateString = (dateString) => {
    const options = {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    const formattedDate = new Date(parseInt(dateString)).toLocaleString(
      "en-US",
      options
    );
    return formattedDate.replace(",", "").replace(/\//g, ".");
  };
