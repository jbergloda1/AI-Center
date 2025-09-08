import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CVBuilderPage from './pages/CVBuilderPage';
import TranslatorPage from './pages/TranslatorPage';
import AIWriterPage from './pages/AIWriterPage';
import AIEsitorPage from './pages/AIEsitorPage';

// FIX: Implement the main App component to provide application structure and routing.
// This resolves module not found errors in index.tsx.
function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/cv-builder" replace />} />
            <Route path="/cv-builder" element={<CVBuilderPage />} />
            <Route path="/translator" element={<TranslatorPage />} />
            <Route path="/writer" element={<AIWriterPage />} />
            <Route path="/editor" element={<AIEsitorPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;