const axios = require('axios');

const PORT = 5002;
const API_URL = `http://localhost:${PORT}/api/search?title=Naruto`;

async function debugSearch() {
    try {
        console.log(`Fetching from ${API_URL}...`);
        const response = await axios.get(API_URL);
        const data = response.data;

        if (data.data && data.data.length > 0) {
            const firstManga = data.data[0];
            console.log('First Manga ID:', firstManga.id);
            console.log('First Manga Title:', firstManga.attributes.title);

            const coverRel = firstManga.relationships.find(rel => rel.type === 'cover_art');
            console.log('Cover Relationship:', JSON.stringify(coverRel, null, 2));

            if (coverRel && coverRel.attributes) {
                console.log('Cover FileName:', coverRel.attributes.fileName);
                const url = `https://uploads.mangadex.org/covers/${firstManga.id}/${coverRel.attributes.fileName}.256.jpg`;
                console.log('Constructed URL:', url);

                try {
                    const imgResponse = await axios.get(url);
                    console.log('Image fetch status:', imgResponse.status);
                    console.log('Image content length:', imgResponse.headers['content-length']);
                } catch (imgError) {
                    console.error('Failed to fetch image:', imgError.message);
                }
            } else {
                console.log('Cover attributes missing!');
            }
        } else {
            console.log('No results found.');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

debugSearch();
