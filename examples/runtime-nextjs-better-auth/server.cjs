const http = require("node:http");
const server = http.createServer((req, res) => { res.writeHead(req.url?.startsWith("/api/auth/") ? 200 : 404, { "content-type": "text/html" }); res.end("sign in"); });
server.listen(Number(process.env.PORT || 3000), "127.0.0.1");
process.on("SIGTERM", () => server.close(() => process.exit(0)));
