import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const MangaDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [manga, setManga] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState({}); // Map of chapterId -> boolean
    const [limit] = useState(100);
    const [offset, setOffset] = useState(0);
    const [order, setOrder] = useState('desc');
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchMangaDetails();
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchChapters();
        }
    }, [id, offset, order]);

    const fetchMangaDetails = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/manga/${id}`);
            const data = await response.json();
            setManga(data.data);
        } catch (error) {
            console.error('Failed to fetch manga details:', error);
        }
    };

    const fetchChapters = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/manga/${id}/feed?limit=${limit}&offset=${offset}&order=${order}`);
            const data = await response.json();
            setChapters(data.data || []);
            setTotal(data.total || 0);
        } catch (error) {
            console.error('Failed to fetch chapters:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (chapter) => {
        setDownloading(prev => ({ ...prev, [chapter.id]: true }));
        try {
            const mangaTitle = manga.attributes.title.en || Object.values(manga.attributes.title)[0];
            const chapterTitle = `Ch. ${chapter.attributes.chapter} - ${chapter.attributes.title || ''}`;

            const response = await fetch(`${API_BASE_URL}/api/download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chapterId: chapter.id,
                    mangaTitle,
                    chapterTitle
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (window.confirm(`Downloaded: ${chapterTitle}\nLocation: ${data.downloadPath}\n\nOpen folder?`)) {
                    await fetch(`${API_BASE_URL}/api/open-folder`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ path: data.downloadPath })
                    });
                }
            } else {
                alert('Download failed');
            }
        } catch (error) {
            console.error('Download error:', error);
            alert('Download error');
        } finally {
            setDownloading(prev => ({ ...prev, [chapter.id]: false }));
        }
    };

    const getCoverArt = (manga) => {
        if (!manga) return '';
        const coverRel = manga.relationships.find(rel => rel.type === 'cover_art');
        if (coverRel && coverRel.attributes && coverRel.attributes.fileName) {
            return `https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes.fileName}.256.jpg`;
        }
        return 'https://via.placeholder.com/200x300?text=No+Cover';
    };

    if (!manga) {
        return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading details...</div>;
    }

    const title = manga.attributes.title.en || Object.values(manga.attributes.title)[0];
    const description = manga.attributes.description.en || Object.values(manga.attributes.description)[0] || 'No description available.';

    return (
        <div>
            <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: '2rem' }}>
                &larr; Back to Search
            </button>

            <div className="details-header">
                <div className="details-cover">
                    <img
                        src={getCoverArt(manga)}
                        alt={title}
                        style={{ width: '200px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        referrerPolicy="no-referrer"
                    />
                </div>
                <div className="details-info" style={{ flex: 1 }}>
                    <h1>{title}</h1>
                    <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                        {description}
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <h2>Chapters</h2>
                <div>
                    <select
                        value={order}
                        onChange={(e) => { setOrder(e.target.value); setOffset(0); }}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div>Loading chapters...</div>
            ) : (
                <div className="chapter-list">
                    {chapters.map((chapter) => (
                        <div key={chapter.id} className="chapter-item">
                            <div>
                                <span style={{ fontWeight: '600', marginRight: '1rem' }}>
                                    Ch. {chapter.attributes.chapter}
                                </span>
                                <span style={{ color: 'var(--text-secondary)' }}>
                                    {chapter.attributes.title}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => navigate(`/read/${chapter.id}`, { state: { chapter } })}
                                >
                                    Read
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleDownload(chapter)}
                                    disabled={downloading[chapter.id]}
                                    style={{ opacity: downloading[chapter.id] ? 0.7 : 1 }}
                                >
                                    {downloading[chapter.id] ? 'Downloading...' : 'Download'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                <button
                    className="btn btn-secondary"
                    disabled={offset === 0}
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                >
                    Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                    Page {Math.floor(offset / limit) + 1}
                </span>
                <button
                    className="btn btn-secondary"
                    disabled={chapters.length < limit}
                    onClick={() => setOffset(offset + limit)}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default MangaDetails;
