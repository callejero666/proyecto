import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Principal.css';

export function Principal() {
    const navigate = useNavigate(); // Hook para navegar a otras rutas
    const { actions } = useAuth(); // Obtiene las acciones de autenticación

    const handleLogout = () => {
        actions.logout(); // Ejecuta la acción de cerrar sesión
        navigate('/login'); // Redirige a la página de login
    };

    return (
        <section className="principal-section">
            <h1>LO QUE QUIERAS</h1>
            <div className="button-container">
                <button onClick={() => navigate('/musica')}>MUSICA</button> {/* Navega a la página de música */}
                <button onClick={() => navigate('/chat')}>CHAT</button> {/* Navega a la página de chat */}
            </div>
            <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button> {/* Cierra sesión */}
        </section>
    );
}
