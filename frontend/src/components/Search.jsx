import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.trim()) {
                searchManga();
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const searchManga = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/search?title=${encodeURIComponent(query)}`);
            const data = await response.json();
            setResults(data.data || []);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCoverArt = (manga) => {
        const coverRel = manga.relationships.find(rel => rel.type === 'cover_art');
        if (coverRel && coverRel.attributes && coverRel.attributes.fileName) {
            return `https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes.fileName}.256.jpg`;
        }
        return 'https://via.placeholder.com/200x300?text=No+Cover';
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, #8b5cf6, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Discover Manga
                </h1>
                <input
                    type="text"
                    className="input"
                    placeholder="Search for a manga..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ maxWidth: '600px' }}
                />
            </div>

            {loading && <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Searching...</div>}

            <div className="manga-grid">
                {results.map((manga) => (
                    <div key={manga.id} className="manga-card" onClick={() => navigate(`/manga/${manga.id}`)}>
                        <div className="manga-cover">
                            <img
                                src={getCoverArt(manga)}
                                alt={manga.attributes.title.en || 'Manga Cover'}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                referrerPolicy="no-referrer"
                            />
                        </div>
                        <div className="manga-info">
                            <h3 className="manga-title">{manga.attributes.title.en || Object.values(manga.attributes.title)[0]}</h3>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {manga.attributes.year || 'Unknown Year'}
                            </div>
                        </div>
                    </div>
                ))}
            </div >
        </div >
    );
};

export default Search;
