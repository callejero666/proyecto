import React, { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes, useNavigate } from 'react-router-dom';
import { Chat } from './componentes/Chat';
import { Login } from './componentes/Login';
import { Musica } from './componentes/Musica';
import { Navbar } from './componentes/Navbar';
import { NotFound } from './componentes/NotFound';
import { Perfil } from './componentes/Perfil';
import { Principal } from './componentes/Principal';
import { Registro } from './componentes/Registro';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
    const { state, actions } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && !state.isAuthenticated) {
            actions.login({ token });
        }
    }, [state.isAuthenticated, actions]);

    useEffect(() => {
        if (!state.isAuthenticated) {
            // Guarda la ruta actual antes de redirigir
            localStorage.setItem('redirectAfterLogin', window.location.pathname);
            navigate('/login');
        }
    }, [state.isAuthenticated, navigate]);

    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={state.isAuthenticated ? <Principal /> : <Login />} />
                <Route path="/principal" element={state.isAuthenticated ? <Principal /> : <Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/chat" element={state.isAuthenticated ? <Chat /> : <Login />} />
                <Route path="/musica" element={state.isAuthenticated ? <Musica /> : <Login />} />
                <Route path="/perfil" element={state.isAuthenticated ? <Perfil /> : <Login />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;


