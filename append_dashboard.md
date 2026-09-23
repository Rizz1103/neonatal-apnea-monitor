
## 15. Dashboard UI and Local Server

A comprehensive front-end telemetry dashboard has been developed to visualize real-time cardiorespiratory data and output the calculated apnea risk scores.

### Starting the UI Dashboard
The web interface is a static HTML/JS frontend that can be served via any HTTP server. To start it locally:
```bash
# Navigate to the project root directory
cd neonatal-apnea-monitor

# Serve the static website files (Python 3)
python -m http.server 8000 --directory website
```
Once running, open a web browser and navigate to `http://localhost:8000`.

### Dashboard Features
- **Overview & Edge AI Documentation:** Displays technical methodology, architectural specifications, and model properties.
- **Live Monitoring Tab:** The active operational interface. 
- **Mode Toggle:** At the top of the Live Monitoring page, you can switch between `Simulated` (synthetic test waves) and `Raspberry Pi` (live edge data stream).
- **Oscillating Risk Engine:** The risk score gauge dynamically responds to the precursor model output, visualizing states from NOMINAL to PRECURSOR WARNING.

### Connecting the Hardware to the Dashboard (Integration Roadmap)
Currently, the "Connect Sensors" functionality in the UI is simulated for frontend validation. To complete the hardware integration:

1. **Host a Backend on the Pi:** Run a lightweight server (e.g., Flask, FastAPI, or WebSockets) alongside the `edge_inference.py` script on the Raspberry Pi.
2. **Expose an Endpoint:** Create an endpoint (e.g., `http://raspberrypi.local:5000/api/stream`) that emits the live analog sensor data and the calculated INT8 TFLite risk score.
3. **Update the Frontend Fetch Logic:** In `website/pages/live-monitoring.html`, replace the synthetic `simulateRpiConnect()` function with actual WebSocket or HTTP polling requests to fetch the live data from the Pi.
4. **Draw Real Waveforms:** Pipe the incoming ECG/RESP array points into the existing `renderLoop` canvas drawing functions, and map the incoming risk scalar to the `computeRiskScore` handler.
