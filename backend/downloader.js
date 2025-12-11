const axios = require('axios');
const fs = require('fs');
const path = require('path');

const DOWNLOAD_DIR = path.join(__dirname, '../downloads');

// Ensure download directory exists
if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR);
}

const downloadChapter = async (chapterId, mangaTitle, chapterTitle) => {
    try {
        console.log(`Starting download for: ${mangaTitle} - ${chapterTitle}`);

        // 1. Get Chapter Metadata
        const metadataResponse = await axios.get(`https://api.mangadex.org/at-home/server/${chapterId}`, {
            headers: {
                'User-Agent': 'MangaDownloader/1.0.0 (https://github.com/example/manga-downloader)'
            }
        });
        const { baseUrl, chapter } = metadataResponse.data;
        const { hash, data: images } = chapter;

        // Sanitize folder names
        const safeMangaTitle = mangaTitle.replace(/[<>:"/\\|?*]/g, '');
        const safeChapterTitle = chapterTitle.replace(/[<>:"/\\|?*]/g, '');

        const chapterDir = path.join(DOWNLOAD_DIR, safeMangaTitle, safeChapterTitle);

        if (!fs.existsSync(chapterDir)) {
            fs.mkdirSync(chapterDir, { recursive: true });
        }

        // 2. Download Images
        for (let i = 0; i < images.length; i++) {
            const filename = images[i];
            const imageUrl = `${baseUrl}/data/${hash}/${filename}`;
            const localPath = path.join(chapterDir, `${i + 1}.jpg`); // Save as 1.jpg, 2.jpg, etc.

            console.log(`Downloading image ${i + 1}/${images.length}: ${imageUrl}`);

            const writer = fs.createWriteStream(localPath);
            const response = await axios({
                url: imageUrl,
                method: 'GET',
                responseType: 'stream',
                headers: {
                    'User-Agent': 'MangaDownloader/1.0.0 (https://github.com/example/manga-downloader)'
                }
            });

            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            // Small delay to be nice to the server
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        console.log(`Download complete: ${mangaTitle} - ${chapterTitle}`);
        return chapterDir;

    } catch (error) {
        console.error('Error in downloadChapter:', error);
        throw error;
    }
};

module.exports = { downloadChapter };
