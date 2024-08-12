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
            // Aquí podrías hacer una llamada a la API para validar el token y obtener los datos del usuario
            actions.login({ token });
        } else if (!state.isAuthenticated) {
            navigate('/login'); // Redirige a la página de inicio de sesión si no está autenticado
        }
    }, [state.isAuthenticated, actions, navigate]);

    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<Login />} /> {/* Cambiado para que Login sea la ruta principal */}
                <Route path="/principal" element={<Principal />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/musica" element={<Musica />} />
                <Route path="/perfil" element={<Perfil />} />
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
