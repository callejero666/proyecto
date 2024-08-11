import { useCallback, useState } from 'react';

// Hook personalizado para realizar peticiones HTTP
export default function useFetch(url, options) {
    // Estado para almacenar los datos de la respuesta
    const [data, setData] = useState(null);
    // Estado para controlar si la petición está en proceso
    const [isLoading, setIsLoading] = useState(false);
    // Estado para manejar errores
    const [isError, setIsError] = useState(false);

    // Función que realiza la petición y actualiza el estado
    const doFetch = useCallback(async () => {
        setIsLoading(true); // Indica que la petición está en curso
        setIsError(false);  // Restablece el estado de error
        try {
            // Realiza la petición HTTP
            const response = await fetch(url, options);
            if (!response.ok) throw new Error('Network response was not ok'); // Lanza un error si la respuesta no es correcta
            const result = await response.json(); // Parse de la respuesta a JSON
            setData(result); // Actualiza el estado con los datos recibidos
        } catch (error) {
            setIsError(true); // Marca un error si algo salió mal
        } finally {
            setIsLoading(false); // Indica que la petición ha terminado (con éxito o error)
        }
    }, [url, options]); // Dependencias del hook: cambia si `url` o `options` cambian

    // Retorna el estado y la función de petición
    return [{ data, isLoading, isError }, doFetch];
}
