import { useCallback, useState } from 'react';

export default function useFetch(url, options) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const doFetch = useCallback(async () => {
        setIsLoading(true);
        setIsError(false);
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error('Network response was not ok');
            const result = await response.json();
            setData(result);
        } catch (error) {
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }, [url, options]);

    return [{ data, isLoading, isError }, doFetch];
}