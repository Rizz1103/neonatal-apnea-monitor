document.addEventListener("DOMContentLoaded", () => {
  updateSnapshotTime();

  // Update the telemetry clock once per second.
  setInterval(updateSnapshotTime, 1000);

  const monitorButton = document.getElementById("monitor-button");

  if (monitorButton) {
    monitorButton.addEventListener("click", () => {
      window.location.href = "./pages/live-monitoring.html";
    });
  }
});


function updateSnapshotTime() {
  const element = document.getElementById("snapshot-time");

  if (!element) {
    return;
  }

  const now = new Date();

  element.textContent = now.toLocaleTimeString("en-IN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}