const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');

const upload = multer({ dest: 'uploads/' });
const app = express();
app.use(helmet());
app.use(express.static('public'));

const records = [];

function getClientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (xf) return xf.split(',')[0].trim();
  return req.socket.remoteAddress;
}

const ADMIN_PASS = process.env.ADMIN_PASS || 'changeme';

function adminAuth(req, res, next) {
  const pass = req.headers['x-admin-pass'] || req.query.admin_pass;
  if (pass && pass === ADMIN_PASS) return next();
  res.status(401).send('Unauthorized');
}

app.post('/capture', upload.single('snapshot'), (req, res) => {
  try {
    const ip = getClientIp(req);
    const { lat, lon, accuracy } = req.body;

    if (!req.file) return res.status(400).json({ error: 'No snapshot uploaded' });

    fs.mkdirSync('stored_snapshots', { recursive: true });
    const filename = `snap_${Date.now()}_${Math.random().toString(36).slice(2,8)}.jpg`;
    const newPath = path.join('stored_snapshots', filename);
    fs.renameSync(req.file.path, newPath);

    const record = {
      id: records.length + 1,
      timestamp: new Date().toISOString(),
      ip,
      lat: lat ? Number(lat) : null,
      lon: lon ? Number(lon) : null,
      accuracy: accuracy ? Number(accuracy) : null,
      file: newPath
    };

    records.push(record);
    console.log('New capture:', { id: record.id, ip: record.ip, lat: record.lat, file: record.file });

    res.json({ success: true, id: record.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

app.get('/records', adminAuth, (req, res) => res.json(records));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Server listening on', port));
