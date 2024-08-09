import React, { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
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

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && !state.isAuthenticated){
            // Aquí podrías hacer una llamada a la API para validar el token y obtener los datos del usuario
            actions.login({ token });
        }
    }, [state.isAuthenticated, actions]);

    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<Principal />} />
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