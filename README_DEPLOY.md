    # Quick deploy (Render.com recommended)

    1. Create a GitHub repo and push this project.
2. Sign up at https://render.com and connect your GitHub account.
3. Dashboard → New → Web Service → Select your repo.
4. Choose branch `main`, set build command: `npm install` and start command: `npm start`.
5. Deploy. Render will provide a live URL (e.g. `https://your-app.onrender.com`).

Notes:
- Ensure HTTPS is enabled (Render provides TLS by default).
- Protect `/records` behind auth in production.
- For production-level storage of snapshots, configure AWS S3 and replace local storage code.
