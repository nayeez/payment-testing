# Consent-first Payment Portal - Ready to Deploy

This project is a minimal, consent-first demo that requests explicit user consent to capture a one-time camera snapshot and geolocation for payment verification/fraud prevention. It logs the visitor IP server-side (standard web behavior). Use only with clear user consent and a published privacy policy.

## What's included
- Static frontend (`public/`) with consent UI, camera & geolocation capture.
- Express backend (`server.js`) that accepts the snapshot and stores it locally.

## To run locally
1. Install Node.js (18+ recommended).
2. From project root:

```
npm install
npm start
```

3. Visit `http://localhost:3000` and test the flow.

> Note: Camera and geolocation APIs require HTTPS in most browsers. For local testing, use `localhost`.
