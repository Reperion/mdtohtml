/**
 * MDtoHTML - Web Server
 * 
 * @author LuCIDDre@mS
 * @license CC-BY-NC-4.0
 * @description Express server for batch Markdown conversion with history tracking
 * 
 * Developed with assistance from Anthropic's Claude AI via Antigravity IDE
 * Copyright (c) 2026 LuCIDDre@mS
 */

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { convertContent } = require('./md2html');

const app = express();
const port = 3000;

// Multer setup for memory storage (files are small enough to process in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static('public'));

app.post('/convert', upload.array('files'), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files uploaded.');
    }

    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = months[date.getMonth()];
    const year = String(date.getFullYear()).slice(-2);

    const dirName = `${day}_${month}_${year}`;
    const baseOutputDir = path.join(__dirname, 'html_converted');
    const outputDir = path.join(baseOutputDir, dirName);

    if (!fs.existsSync(baseOutputDir)) {
        fs.mkdirSync(baseOutputDir);
    }

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const results = [];

    req.files.forEach(file => {
        const mdContent = file.buffer.toString('utf8');
        let htmlContent = convertContent(mdContent);

        // Inject title
        const title = file.originalname;
        htmlContent = htmlContent.replace('<head>', `<head>\n<title>${title}</title>`);

        const outputFilename = path.parse(file.originalname).name + '.html';
        const outputPath = path.join(outputDir, outputFilename);

        fs.writeFileSync(outputPath, htmlContent);
        results.push(outputFilename);
    });

    res.json({
        message: `Successfully converted ${results.length} files.`,
        directory: dirName,
        files: results
    });
});

// Serve converted files statically
app.use('/history', express.static(path.join(__dirname, 'html_converted')));

// API to get conversion history
app.get('/api/history', (req, res) => {
    const historyDir = path.join(__dirname, 'html_converted');

    if (!fs.existsSync(historyDir)) {
        return res.json([]);
    }

    try {
        const items = fs.readdirSync(historyDir).map(name => {
            const fullPath = path.join(historyDir, name);
            const stats = fs.statSync(fullPath);
            return { name, path: fullPath, mtime: stats.mtime, isDirectory: stats.isDirectory() };
        })
            .filter(item => item.isDirectory)
            .sort((a, b) => b.mtime - a.mtime)
            .slice(0, 10); // Latest 10

        const history = items.map(item => {
            const files = fs.readdirSync(item.path)
                .filter(f => f.endsWith('.html'));
            return {
                directory: item.name,
                files: files
            };
        });

        res.json(history);
    } catch (err) {
        console.error('Error reading history:', err);
        res.status(500).json({ error: 'Failed to retrieve history' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
