import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import API_BASE_URL from '../config';

const ChapterReader = () => {
    const { chapterId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const chapter = location.state?.chapter;

    useEffect(() => {
        if (chapter?.attributes?.externalUrl) {
            setLoading(false);
            return;
        }
        fetchPages();
    }, [chapterId, chapter]);

    const fetchPages = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/chapter/${chapterId}`);
            if (!response.ok) throw new Error('Failed to fetch chapter pages');

            const data = await response.json();

            if (data.baseUrl && data.chapter && data.chapter.data && data.chapter.data.length > 0) {
                const imageUrls = data.chapter.data.map(filename =>
                    `${data.baseUrl}/data/${data.chapter.hash}/${filename}`
                );
                setPages(imageUrls);
            } else {
                // If data is empty, it might be external but we didn't catch it via state,
                // or it's just empty/unavailable.
                if (!chapter?.attributes?.externalUrl) {
                    setError('No pages found for this chapter.');
                }
            }
        } catch (err) {
            console.error('Reader error:', err);
            setError('Failed to load chapter. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (chapter?.attributes?.externalUrl) {
        return (
            <div className="reader-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
                <h2>External Chapter</h2>
                <p>This chapter is hosted on an external site.</p>
                <a
                    href={chapter.attributes.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}
                >
                    Read on External Site
                </a>
                <br />
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                    style={{ marginTop: '2rem' }}
                >
                    &larr; Back to Manga
                </button>
            </div>
        );
    }

    return (
        <div className="reader-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                >
                    &larr; Back
                </button>
                <span style={{ color: 'var(--text-secondary)' }}>
                    {chapter ? `Ch. ${chapter.attributes.chapter} - ${chapter.attributes.title || ''}` : 'Chapter Reader'}
                </span>
            </div>

            {loading && <div style={{ textAlign: 'center', padding: '2rem' }}>Loading pages...</div>}

            {error && (
                <div style={{ textAlign: 'center', color: 'red', padding: '2rem' }}>
                    {error}
                    <br />
                    <button className="btn btn-primary" onClick={fetchPages} style={{ marginTop: '1rem' }}>
                        Retry
                    </button>
                </div>
            )}

            <div className="pages-list" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                {pages.map((url, index) => (
                    <img
                        key={index}
                        src={url}
                        alt={`Page ${index + 1}`}
                        style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                    />
                ))}
            </div>

            {!loading && pages.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate(-1)}
                    >
                        Back to Manga
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChapterReader;
