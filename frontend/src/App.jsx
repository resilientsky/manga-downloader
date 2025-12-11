import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Search from './components/Search';
import MangaDetails from './components/MangaDetails';
import ChapterReader from './components/ChapterReader';

function App() {
  return (
    <>
      <header>
        <div className="container header-content">
          <div className="logo">
            MangaDownloader
          </div>
        </div>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Search />} />
          <Route path="/manga/:id" element={<MangaDetails />} />
          <Route path="/read/:chapterId" element={<ChapterReader />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
