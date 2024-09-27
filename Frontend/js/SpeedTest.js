document.addEventListener("DOMContentLoaded", function () {
  const speedTestForm = document.getElementById("speedTestForm");
  const resultsDiv = document.getElementById("results");
  const stopButton = document.getElementById("stopButton");
  let stopTest = false;

  stopButton.addEventListener("click", function () {
    stopTest = true;

    fetch("/speedTests/stop", {
      method: "POST",
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else {
          throw new Error("Request failed.");
        }
      })
      .then(() => {
        resultsDiv.innerHTML = "<p>Speed test stopped.</p>";
      })
      .catch((error) => {
        console.error("Error:", error);
        resultsDiv.innerHTML =
          "<p>An error occurred while stopping the speed test.</p>";
      });
  });

  speedTestForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const duration = document.getElementById("testDuration").value;
    const interval = document.getElementById("requestInterval").value;

    fetch("/speedTests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else if (res.status === 401) {
          throw new Error("Unauthorized: Invalid token.");
        } else {
          throw new Error("Failed to start speed test");
        }
      })
      .then(async (data) => {
        if (data.status === "Success") {
          // Display message indicating test is running

          resultsDiv.innerHTML = "<p>Speed test is running...</p>";

          // Perform POST requests

          const postPerformance = await performPostRequests(duration, interval);

          // Perform GET requests
          const getPerformance = await performGetRequests(duration, interval);

          resultsDiv.innerHTML = `
            <div class="performance-results">
              <h3>Performance Results</h3>
              <div class="result-item">
                <span class="result-label">POST :</span>
                <span class="result-value">${postPerformance.toFixed(
                  2
                )} Requests/Sec</span>
              </div>
              <div class="result-item">
                <span class="result-label">GET :</span>
                <span class="result-value">${getPerformance.toFixed(
                  2
                )} Requests/Sec</span>
              </div>
            </div>
            `;

          fetch("/speedTests/resume", {
            method: "POST",
          })
            .then((res) => {
              if (res.status === 200) {
                return res.json();
              } else {
                throw new Error("Request failed.");
              }
            })
            .then(() => {})
            .catch((error) => {
              console.error("Error:", error);
            });
        } else {
          resultsDiv.innerHTML = `<p>Error: ${data.message}</p>`;
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        resultsDiv.innerHTML =
          "<p>An error occurred during the speed test.</p>";
      });
  });

  async function performPostRequests(duration, interval) {
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;
    let postRequestCount = 0;

    while (Date.now() < endTime && !stopTest) {
      const postMessageURL = "/messages/public";
      try {
        const response = await fetch(postMessageURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messageStatus: 0,
            content: "This is a test message".padEnd(20, "."),
          }),
        });

        if (response.ok) {
          postRequestCount++;
        }
      } catch (error) {
        console.error("Error during POST request:", error);
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    const actualDuration = (Date.now() - startTime) / 1000;
    return postRequestCount / actualDuration;
  }

  async function performGetRequests(duration, interval) {
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;
    let getRequestCount = 0;

    while (Date.now() < endTime && !stopTest) {
      const getPublicMessagesURL = "/messages/public";
      try {
        const response = await fetch(getPublicMessagesURL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          getRequestCount++;
        }
      } catch (error) {
        console.error("Error during GET request:", error);
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    const actualDuration = (Date.now() - startTime) / 1000;
    return getRequestCount / actualDuration;
  }
});
