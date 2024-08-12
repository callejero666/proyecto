import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { useAuth } from '../contexts/AuthContext';
import './Musica.css';

export function Musica() {
    // Estado para almacenar las canciones, la canción actual, y el estado del reproductor
    const [songs, setSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const { state } = useAuth();
    const navigate = useNavigate();

    const [{ data: songsData, isError: songsError, isLoading: songsLoading }, doFetchSongs] = useFetch(
        "/harmonyhub/songs/",
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    useEffect(() => {
        if (!state.isAuthenticated) {
            navigate('/login');
        } else {
            doFetchSongs();
        }
    }, [state.isAuthenticated, navigate, doFetchSongs]);

    useEffect(() => {
        if (songsData && Array.isArray(songsData)) {
            setSongs(songsData);
        }
    }, [songsData]);

    const handlePlay = (song) => {
        setCurrentSong(song);
        setPlaying(true);
    };

    const handlePause = () => {
        setPlaying(false);
    };

    const handleStop = () => {
        setPlaying(false);
        setCurrentSong(null);
    };

    const handleDeleteSong = async (songId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/harmonyhub/songs/`, {
                method: "POST",
                headers: {
                    "Authorization": `Token ${state.token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setSongs(prev => [data, ...prev]);
            setNewSong({ title: '', year: '', album: '', file: null });
            alert("Canción creada exitosamente.");
            toggleCreateSongModal();
        } catch (error) {
            setError(error);
            alert("Error al crear la canción. Inténtalo de nuevo.");
        }
    };

    // Actualiza la búsqueda según lo que se escribe en el formulario
    const handleSearchChange = (e) => {
        setSearchQuery({ ...searchQuery, [e.target.name]: e.target.value });
        setCurrentPage(1);
    };

    // Cambia la página de resultados
    const handlePageChange = (direction) => {
        if (direction === 'next' && currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        } else if (direction === 'prev' && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Alterna la visibilidad del modal para crear una canción
    const toggleCreateSongModal = () => setShowCreateSongModal(!showCreateSongModal);

    // Maneja la selección de una lista de reproducción
    const handlePlaylistSelect = (e) => {
        setSelectedPlaylistId(e.target.value);
    };

    // Reproduce una canción seleccionada
    const handlePlay = (song) => {
        setCurrentSong(song);
        setPlaying(true);
    };

    // Funciones vacías para manejar la reproducción de listas de reproducción
    const handlePlayPlaylist = (playlistId) => {
        // Lógica para reproducir una lista de reproducción
    };

    // Funciones vacías para manejar agregar canciones a listas de reproducción y eliminar canciones
    const handleAddToPlaylist = (playlistId, songId) => {
        // Lógica para agregar una canción a la lista de reproducción
    };

    const handleDeleteSong = (songId) => {
        // Lógica para eliminar una canción
    };

    // Función vacía para crear una nueva lista de reproducción
    const handleCreatePlaylist = () => {
        // Lógica para crear una nueva lista de reproducción
    };

    // Controla la posición de reproducción (seek) del reproductor
    const handleSeek = (seconds) => {
        playerRef.current.seekTo(seconds);
    };

    // Cambia el volumen del reproductor
    const handleVolumeChange = (e) => {
        playerRef.current.setVolume(parseFloat(e.target.value));
    };

    // Maneja la selección de archivos para subir una canción
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type !== 'audio/mp3') {
            alert('Por favor, sube un archivo MP3.');
            return;
        }
        if (file && file.size > 10 * 1024 * 1024) { // 10 MB
            alert('El archivo no debe superar los 10 MB.');
            return;
        }
        setNewSong({ ...newSong, file });
    };

    // Reproduce la siguiente canción en la lista
    const handleNextSong = () => {
        const currentIndex = songs.findIndex(song => song.id === currentSong.id);
        const nextIndex = (currentIndex + 1) % songs.length;
        setCurrentSong(songs[nextIndex]);
        setPlaying(true);
    };

    // Reproduce la canción anterior en la lista
    const handlePreviousSong = () => {
        const currentIndex = songs.findIndex(song => song.id === currentSong.id);
        const previousIndex = (currentIndex - 1 + songs.length) % songs.length;
        setCurrentSong(songs[previousIndex]);
        setPlaying(true);
    };

    // Detiene la reproducción de la canción actual
    const handleStop = () => {
        setPlaying(false);
        setCurrentSong(null);
    };

    const handleCreatePlaylist = async () => {
        if (newPlaylistName.trim() === '') return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/harmonyhub/playlists/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${state.token}`
                },
                body: JSON.stringify({
                    name: newPlaylistName,
                    public: true, // Cambia a false si quieres que sea privada
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setPlaylists([...playlists, data]);
            setNewPlaylistName('');
        } catch (error) {
            setError(error);
            alert("Error al crear la lista de reproducción. Inténtalo de nuevo.");
        }
    };

    const handleAddToPlaylist = async (playlistId, songId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/harmonyhub/playlists/${playlistId}/songs/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${state.token}`,
                },
                body: JSON.stringify({ song_id: songId }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            alert("Canción agregada a la lista de reproducción");
        } catch (error) {
            setError(error);
            alert("Error al agregar la canción a la lista de reproducción. Inténtalo de nuevo.");
        }
    };

    const handleRemoveFromPlaylist = async (playlistId, songId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/harmonyhub/playlists/${playlistId}/songs/${songId}/`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${state.token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            alert("Canción eliminada de la lista de reproducción");
        } catch (error) {
            setError(error);
            alert("Error al eliminar la canción de la lista de reproducción. Inténtalo de nuevo.");
        }
    };

    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchQuery(prevQuery => ({
            ...prevQuery,
            [name]: value
        }));
    };

    const handlePlaylistSelect = (e) => {
        setSelectedPlaylistId(e.target.value);
    };

    const handlePageChange = (direction) => {
        setCurrentPage(prevPage => prevPage + direction);
        setLoading(true);
        const queryParams = new URLSearchParams({
            ...searchQuery,
            page: currentPage + direction,
            page_size: 10
        }).toString();
        fetchSongs(queryParams);
    };

    if (loading) return <p>Cargando canciones...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <section className="music-section">
            <h1>Music Page</h1>
            <div className="song-list">
                {songs.map((song) => (
                    <div key={song.id} className="song-item">
                        <span onClick={() => handlePlay(song)}>{song.title}</span>
                        <button onClick={() => handleDeleteSong(song.id)}>Delete</button>
                    </div>
                ))}
            </div>
            {currentSong && (
                <ReactPlayer
                    url={currentSong.url}
                    playing={true}
                    controls={true}
                    width="100%"
                    height="50px"
                />
            )}
        </section>
    );
}