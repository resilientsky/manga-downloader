const axios = require('axios');

const PORT = 5002; // Try the port we saw in the last run, or we can try a range
const API_URL = `http://localhost:${PORT}/api/search?title=Naruto`;

async function debugSearch() {
    try {
        console.log(`Fetching from ${API_URL}...`);
        const response = await axios.get(API_URL);
        const data = response.data;

        if (data.data && data.data.length > 0) {
            const firstManga = data.data[0];
            console.log('First Manga Title:', firstManga.attributes.title);

            const coverRel = firstManga.relationships.find(rel => rel.type === 'cover_art');
            console.log('Cover Relationship:', JSON.stringify(coverRel, null, 2));

            if (coverRel && coverRel.attributes) {
                console.log('Cover FileName:', coverRel.attributes.fileName);
            } else {
                console.log('Cover attributes missing!');
            }
        } else {
            console.log('No results found.');
        }
    } catch (error) {
        console.error('Error:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('Connection refused. Trying port 5000...');
            // Try fallback
        }
    }
}

debugSearch();
