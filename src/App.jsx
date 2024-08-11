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
            actions.login({ token }); // Inicia sesión con el token
        } else if (!state.isAuthenticated) {
            navigate('/login'); // Redirige a login si no está autenticado
        }
    }, [state.isAuthenticated, actions, navigate]);

    return (
        <>
            <Navbar /> {/* Muestra la barra de navegación */}
            <Routes>
                <Route path="/" element={<Login />} /> {/* Página principal: Login */}
                <Route path="/principal" element={<Principal />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/musica" element={<Musica />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="*" element={<NotFound />} /> {/* Página para rutas no encontradas */}
            </Routes>
        </>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider> {/* Provee contexto de autenticación */}
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;

