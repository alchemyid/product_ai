import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check if API key is present in env using Vite's import.meta.env
        const key = import.meta.env.VITE_GEMINI_API_KEY;
        if (!key) {
            setError("Missing VITE_GEMINI_API_KEY in .env file. Please create a .env file with your key to run the app.");
        }
    }, []);

    const handleLogin = () => {
        if (error) {
            alert(error);
            return;
        }
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
    };

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-red-400 p-8 text-center">
                <div>
                    <h1 className="text-2xl font-bold mb-4">Configuration Error</h1>
                    <p>{error}</p>
                </div>
            </div>
        )
    }

    if (!isLoggedIn) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return <Dashboard onLogout={handleLogout} />;
};

export default App;