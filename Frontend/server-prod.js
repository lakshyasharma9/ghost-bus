import { createServer } from 'http';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Import the built server
const serverPath = join(__dirname, 'dist', 'server', 'index.js');
let handler;

try {
  const serverModule = await import(serverPath);
  handler = serverModule.default || serverModule.handler;
} catch (error) {
  console.error('Failed to load server module:', error);
  process.exit(1);
}

const server = createServer(async (req, res) => {
  try {
    if (handler) {
      await handler(req, res);
    } else {
      res.writeHead(500);
      res.end('Server handler not found');
    }
  } catch (error) {
    console.error('Request error:', error);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
