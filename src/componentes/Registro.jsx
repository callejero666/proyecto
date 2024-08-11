import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Registro.css';

export function Registro() {
    const [username, setUsername] = useState(''); // Estado para el nombre de usuario
    const [email, setEmail] = useState(''); // Estado para el email
    const [password, setPassword] = useState(''); // Estado para la contraseña
    const navigate = useNavigate(); // Hook para navegar a otras rutas

    const handleRegistro = (e) => {
        e.preventDefault(); // Evita el envío del formulario
        // Aquí se debe implementar la lógica para registrar al usuario
        console.log('Registro:', { username, email, password });
        navigate('/login'); // Redirige a la página de login después del registro
    };

    return (
        <section className="registro-section">
            <h1>Registro</h1>
            <form className="registro-form" onSubmit={handleRegistro}>
                <input 
                    type="text" 
                    placeholder="Username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">REGISTRARSE</button>
            </form>
        </section>
    );
}
