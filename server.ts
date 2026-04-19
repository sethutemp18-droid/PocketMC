import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Server data state (starts empty)
  let servers: any[] = [];
  const logs: Record<string, any[]> = {};

  // API Routes
  app.get('/api/servers', (req, res) => {
    res.json(servers);
  });

  app.get('/api/servers/:id', (req, res) => {
    const server = servers.find(s => s.id === req.params.id);
    if (server) res.json(server);
    else res.status(404).json({ error: 'Server not found' });
  });

  app.post('/api/servers/:id/start', (req, res) => {
    const server = servers.find(s => s.id === req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found' });
    
    server.status = 'STARTING';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (!logs[server.id]) logs[server.id] = [];
    logs[server.id].push({ timestamp, level: 'info', message: 'Initiating boot sequence (API requested)...' });

    // Simulate boot
    setTimeout(() => {
      server.status = 'RUNNING';
      server.memoryUsage = 420;
      server.cpuUsage = 5;
    }, 3000);

    res.json({ status: 'ok', server });
  });

  app.post('/api/servers/:id/stop', (req, res) => {
    const server = servers.find(s => s.id === req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found' });
    
    server.status = 'STOPPING';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (!logs[server.id]) logs[server.id] = [];
    logs[server.id].push({ timestamp, level: 'info', message: 'Sending shutdown signal (API requested)...' });

    // Simulate stop
    setTimeout(() => {
      server.status = 'STOPPED';
      server.memoryUsage = 0;
      server.cpuUsage = 0;
      server.players = 0;
    }, 2000);

    res.json({ status: 'ok', server });
  });

  app.post('/api/servers', (req, res) => {
    const { 
      name, version, software, description, worldType, worldSeed, viewDistance, simDistance,
      maxPlayers, gamemode, difficulty, cracked, tier 
    } = req.body;

    const newServer = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description: description || '',
      status: 'STOPPED',
      uptime: 0,
      memoryUsage: 0,
      maxMemory: tier === 'God-Mode' ? 8192 : tier === 'Power' ? 4096 : 1536,
      cpuUsage: 0,
      players: 0,
      maxPlayers: maxPlayers || 20,
      version,
      software,
      port: 25565 + servers.length,
      publicIp: `${name.toLowerCase().replace(/\s+/g, '-')}.netherite.gg`,
      worldType: worldType || 'Default',
      worldSeed: worldSeed || '',
      viewDistance: viewDistance || 10,
      simDistance: simDistance || 10,
      gamemode: gamemode || 'Survival',
      difficulty: difficulty || 'Normal',
      cracked: cracked || false,
      tier: tier || 'Starter',
      playersList: []
    };
    servers.push(newServer);
    res.status(201).json(newServer);
  });

  app.patch('/api/servers/:id', (req, res) => {
    const serverIndex = servers.findIndex(s => s.id === req.params.id);
    if (serverIndex === -1) return res.status(404).json({ error: 'Server not found' });
    
    servers[serverIndex] = { ...servers[serverIndex], ...req.body };
    res.json(servers[serverIndex]);
  });

  app.get('/api/servers/:id/logs', (req, res) => {
    res.json(logs[req.params.id] || []);
  });

  app.post('/api/servers/:id/command', (req, res) => {
    const { command } = req.body;
    const serverId = req.params.id;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    if (!logs[serverId]) logs[serverId] = [];
    logs[serverId].push({ timestamp, level: 'info', message: command });

    // Mock specific command reactions
    const cmdTrimmed = command.trim();
    if (cmdTrimmed === '/list') {
      const srv = servers.find(s => s.id === serverId);
      setTimeout(() => {
        const ts1 = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        if (srv && srv.playersList) {
          const onlinePlayers = srv.playersList.filter(p => p.online);
          const names = onlinePlayers.map(p => p.name).join(', ');
          logs[serverId].push({ timestamp: ts1, level: 'info', message: `There are ${onlinePlayers.length} of a max of ${srv.maxPlayers} players online: ${names}` });
        } else {
          logs[serverId].push({ timestamp: ts1, level: 'info', message: `There are 0 of a max of 20 players online:` });
        }
      }, 50);
    } else if (cmdTrimmed.startsWith('/promote ')) {
      const parts = cmdTrimmed.split(' ');
      if (parts.length >= 3) {
        const playerName = parts[1];
        const role = parts[2].toUpperCase();
        
        // Update player internally
        const srv = servers.find(s => s.id === serverId);
        if (srv && srv.playersList) {
          const p = srv.playersList.find(pl => pl.name.toLowerCase() === playerName.toLowerCase());
          if (p) p.role = role;
          else {
            // dynamically add them if not there for the mock
            srv.playersList.push({ name: playerName, role: role, ping: 30, online: true, uuid: Math.random().toString(36).substring(7) });
          }
        }
        
        // Push the success log
        setTimeout(() => {
          const ts1 = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          logs[serverId].push({ timestamp: ts1, level: 'info', message: `[Server] Promoted ${playerName} to ${role} successfully` });
        }, 300);

        // Push a mock chat message from that player showing their new role
        setTimeout(() => {
          const ts2 = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          logs[serverId].push({ timestamp: ts2, level: 'chat', message: `[${role}] <${playerName}> thanks for the promotion!` });
        }, 1500);
      } else {
        setTimeout(() => {
          const tsErr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          logs[serverId].push({ timestamp: tsErr, level: 'warn', message: 'Usage: /promote <playername> <role>' });
        }, 100);
      }
    }
    
    res.json({ status: 'ok' });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
