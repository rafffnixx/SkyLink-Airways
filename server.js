const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);
    
    // Remove query parameters
    let filePath = req.url.split('?')[0];
    
    // Default to index.html for root
    if (filePath === '/') {
        filePath = '/public/index.html';
    }
    
    // Check if request is for src folder
    if (filePath.startsWith('/src/')) {
        // Serve from src directory
        const srcPath = path.join(__dirname, filePath);
        const ext = path.extname(srcPath);
        const contentType = mimeTypes[ext] || 'application/javascript';
        
        fs.readFile(srcPath, (err, content) => {
            if (err) {
                console.error(`Error serving ${srcPath}:`, err);
                res.writeHead(404);
                res.end(`File not found: ${filePath}`);
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            }
        });
    } 
    // Check if request is for public folder (images, resources)
    else if (filePath.startsWith('/public/') || filePath.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)) {
        // Ensure path starts with /public
        if (!filePath.startsWith('/public/')) {
            filePath = '/public' + filePath;
        }
        const publicPath = path.join(__dirname, filePath);
        const ext = path.extname(publicPath);
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        
        fs.readFile(publicPath, (err, content) => {
            if (err) {
                console.error(`Error serving ${publicPath}:`, err);
                res.writeHead(404);
                res.end(`File not found: ${filePath}`);
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            }
        });
    }
    // Handle all other routes - SPA routing (serve index.html)
    else {
        // Serve index.html for client-side routing
        const indexPath = path.join(__dirname, 'public', 'index.html');
        fs.readFile(indexPath, (err, content) => {
            if (err) {
                res.writeHead(404);
                res.end('Index file not found');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            }
        });
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('\n✈️  SkyLink Airways Frontend Server');
    console.log('===================================');
    console.log(`📍 Local:    http://localhost:${PORT}`);
    console.log(`📍 Network:  http://192.168.1.101:${PORT}`);
    console.log(`\n📁 Serving from:`);
    console.log(`   📄 HTML:  ${path.join(__dirname, 'public')}`);
    console.log(`   🎨 CSS:   ${path.join(__dirname, 'src', 'styles')}`);
    console.log(`   📜 JS:    ${path.join(__dirname, 'src')}`);
    console.log(`   🖼️  Resources: ${path.join(__dirname, 'public')}`);
    console.log('===================================\n');
});