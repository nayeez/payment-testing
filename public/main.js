// public/main.js — CSP-safe external script

(function () {
  try {
    const consentCheckbox = document.getElementById('consent');
    const startBtn = document.getElementById('startBtn');
    const status = document.getElementById('status');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');

    if (!consentCheckbox || !startBtn) {
      console.error("Consent UI elements missing", { consentCheckbox, startBtn });
      if (startBtn) startBtn.disabled = false;
      return;
    }

    function updateButtonState() {
      try {
        startBtn.disabled = !consentCheckbox.checked;
      } catch (err) {
        console.error("updateButtonState error", err);
        startBtn.disabled = false;
      }
    }

    consentCheckbox.addEventListener('change', updateButtonState);
    updateButtonState();

    startBtn.addEventListener('click', async () => {
      try {
        if (!consentCheckbox.checked) return;

        status.textContent = "Requesting permissions...";

        const geo = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            pos => resolve({
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
              accuracy: pos.coords.accuracy
            }),
            err => reject(err),
            { enableHighAccuracy: true, timeout: 15000 }
          );
        });

        status.textContent = "Location OK. Requesting camera...";

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" }
        });

        video.srcObject = stream;
        video.removeAttribute("hidden");

        status.textContent = "Camera ready. Capturing in 2 seconds...";
        await new Promise(r => setTimeout(r, 2000));

        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.removeAttribute("hidden");

        stream.getTracks().forEach(t => t.stop());
        video.setAttribute("hidden", "");

        status.textContent = "Sending snapshot...";

        const snapshotBlob = await new Promise(resolve =>
          canvas.toBlob(resolve, "image/jpeg", 0.85)
        );

        const formData = new FormData();
        formData.append("snapshot", snapshotBlob, "snapshot.jpg");
        formData.append("lat", geo.lat);
        formData.append("lon", geo.lon);
        formData.append("accuracy", geo.accuracy);

        const resp = await fetch("/capture", {
          method: "POST",
          body: formData
        });

        if (!resp.ok) throw new Error("Server returned " + resp.status);

        const data = await resp.json();
        status.textContent = "Capture OK. Reference: " + data.id;
      } catch (err) {
        console.error(err);
        status.innerHTML = "<span class='danger'>Error: " + (err.message || err) + "</span>";
      }
    });

  } catch (err) {
    console.error("Fatal init error", err);
    const btn = document.getElementById("startBtn");
    if (btn) btn.disabled = false;
  }
})();