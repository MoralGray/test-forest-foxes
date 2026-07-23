import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { QueryProvider } from '@mg-nx-forge/mg-infinite-view-tanstack';
import './index.css';
import { HomePage } from './pages/HomePage.js';
import { WorklogPage } from './pages/WorklogPage.js';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryProvider>
            <BrowserRouter>
                <div className="min-h-screen bg-white text-neutral-900">
                    <header className="border-b px-4 py-2 flex items-center gap-4">
                        <Link to="/" className="font-bold text-lg">Лисий диспетчер</Link>
                        <Link to="/worklog" className="text-sm text-neutral-600 hover:text-neutral-900">AI Worklog</Link>
                    </header>
                    <main>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/worklog" element={<WorklogPage />} />
                        </Routes>
                    </main>
                </div>
            </BrowserRouter>
        </QueryProvider>
    </StrictMode>
);
