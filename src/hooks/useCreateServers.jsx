import { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Ajusta la ruta según tu estructura

export function useCreateServer() {
    const { state } = useAuth(); // Recupera el estado del contexto de autenticación
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [response, setResponse] = useState(null);

    const createServer = async (serverData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/teamhub/servers/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${state.token}` // Usa el token del contexto
                },
                body: JSON.stringify(serverData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setResponse(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        createServer,
        loading,
        error,
        response
    };
}
