const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const downloader = require('./downloader');

const net = require('net');
const { exec } = require('child_process');

const app = express();
const DEFAULT_PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const MANGADEX_API_URL = 'https://api.mangadex.org';

// Proxy for searching manga
app.get('/api/search', async (req, res) => {
    try {
        const { title } = req.query;
        const response = await axios.get(`${MANGADEX_API_URL}/manga`, {
            params: {
                title: title,
                limit: 20,
                'order[relevance]': 'desc',
                'includes[]': 'cover_art'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Search error:', error.message);
        res.status(500).json({ error: 'Failed to fetch manga' });
    }
});

// Proxy for manga details
app.get('/api/manga/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`${MANGADEX_API_URL}/manga/${id}`, {
            params: {
                'includes[]': 'cover_art'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Manga details error:', error.message);
        res.status(500).json({ error: 'Failed to fetch manga details' });
    }
});

// Proxy for chapter feed
app.get('/api/manga/:id/feed', async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 100, offset = 0, order = 'desc' } = req.query;
        console.log(`Fetching feed for manga: ${id}, limit: ${limit}, offset: ${offset}, order: ${order}`);
        const response = await axios.get(`${MANGADEX_API_URL}/manga/${id}/feed`, {
            params: {
                translatedLanguage: ['en'],
                'order[chapter]': order,
                limit: limit,
                offset: offset
            }
        });
        console.log(`Feed response: ${response.data.data.length} chapters found.`);
        res.json(response.data);
    } catch (error) {
        console.error('Chapter feed error:', error.message);
        if (error.response) {
            console.error('API Response:', error.response.data);
        }
        res.status(500).json({ error: 'Failed to fetch chapters' });
    }
});

// Proxy for chapter pages
app.get('/api/chapter/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Fetching pages for chapter: ${id}`);
        const response = await axios.get(`${MANGADEX_API_URL}/at-home/server/${id}`);
        res.json(response.data);
    } catch (error) {
        console.error('Chapter pages error:', error.message);
        res.status(500).json({ error: 'Failed to fetch chapter pages' });
    }
});

// Download endpoint
app.post('/api/download', async (req, res) => {
    const { chapterId, mangaTitle, chapterTitle } = req.body;
    if (!chapterId || !mangaTitle || !chapterTitle) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Start download in background (or await if we want to block)
        // For better UX, we might want to return "Download started" and use a socket or polling for progress.
        // For MVP, we'll just await it or fire and forget. Let's await for now to see errors.
        const downloadPath = await downloader.downloadChapter(chapterId, mangaTitle, chapterTitle);
        res.json({ message: 'Download completed successfully', downloadPath });
    } catch (error) {
        console.error('Download error:', error.message);
        res.status(500).json({ error: 'Download failed' });
    }
});

app.post('/api/open-folder', (req, res) => {
    const { path: folderPath } = req.body;
    if (!folderPath) {
        return res.status(400).json({ error: 'Missing path' });
    }

    console.log(`Opening folder: ${folderPath}`);

    let command;
    if (process.platform === 'win32') {
        command = `explorer "${folderPath}"`;
    } else if (process.platform === 'darwin') {
        command = `open "${folderPath}"`;
    } else {
        command = `xdg-open "${folderPath}"`;
    }

    exec(command, (error) => {
        if (error) {
            console.error('Failed to open folder:', error);
            return res.status(500).json({ error: 'Failed to open folder' });
        }
        res.json({ message: 'Folder opened' });
    });
});

const findAvailablePort = (startPort) => {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.listen(startPort, () => {
            const { port } = server.address();
            server.close(() => resolve(port));
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(findAvailablePort(parseInt(startPort) + 1));
            } else {
                reject(err);
            }
        });
    });
};

const startServer = async () => {
    try {
        const port = await findAvailablePort(DEFAULT_PORT);
        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
