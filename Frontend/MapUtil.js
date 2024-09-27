async function addressToCoordinates(token, address) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    address
  )}.json?access_token=${token}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      return { longitude, latitude };
    } else {
      throw new Error("No matching location found");
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

async function coordinatesToAddress(token, longitude, latitude) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const address = data.features[0].place_name;
      return address;
    } else {
      throw new Error("No address found for these coordinates");
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation is not supported by your browser");
    } else {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
      });
    }
  });
}
