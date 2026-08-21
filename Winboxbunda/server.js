const express = require('express');
const app = express();
app.use(express.json());

let devices = {};

// Receiver dari MikroTik
app.post('/api/webhook', (req, res) => {
  const { name, ip, status } = req.body;
  devices[ip] = { name, ip, status, updated: new Date().toLocaleTimeString('id-ID') };
  res.status(200).send('OK');
});

// Endpoint untuk Dashboard
app.get('/api/status', (req, res) => {
  res.json(Object.values(devices));
});

// Dashboard Web
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Netwatch Live Dashboard</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: sans-serif; background: #121212; color: #fff; padding: 20px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; }
        .card { padding: 15px; border-radius: 8px; background: #1e1e1e; border-left: 6px solid #666; }
        .UP { border-color: #2e7d32; }
        .DOWN { border-color: #c62828; }
        .badge { padding: 4px 8px; border-radius: 4px; font-weight: bold; float: right; }
        .badge-UP { background: #2e7d32; }
        .badge-DOWN { background: #c62828; }
      </style>
    </head>
    <body>
      <h2>Netwatch Network Status</h2>
      <div id="app" class="grid">Memuat data...</div>
      <script>
        async function loadData() {
          const res = await fetch('/api/status');
          const data = await res.json();
          document.getElementById('app').innerHTML = data.map(d => \`
            <div class="card \${d.status}">
              <span class="badge badge-\${d.status}">\${d.status}</span>
              <h3>\${d.name}</h3>
              <p>IP: \${d.ip}</p>
              <small>Update: \${d.updated}</small>
            </div>
          \`).join('');
        }
        setInterval(loadData, 3000);
        loadData();
      </script>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));