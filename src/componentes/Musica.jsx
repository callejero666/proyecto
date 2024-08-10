import React, { useEffect, useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Musica.css';

export function Musica() {
    const [songs, setSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [playing, setPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        title: '',
        album: '',
        artists: '',
        genres: '',
        year: '',
        page: 1,
        page_size: 10
    });
    const [playlists, setPlaylists] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const playerRef = useRef(null);
    const { state } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!state.isAuthenticated) {
            navigate('/login');
            return;
        }

        async function fetchSongs() {
            try {
                const queryParams = new URLSearchParams(
                    Object.fromEntries(
                        Object.entries(filters).filter(([_, value]) => value)
                    )
                ).toString();

                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/harmonyhub/songs/?${queryParams}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Token ${state.token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setSongs(data.results);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        }

        async function fetchPlaylists() {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/harmonyhub/playlists/`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Token ${state.token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setPlaylists(data.results);
            } catch (error) {
                setError(error);
            }
        }

        fetchSongs();
        fetchPlaylists();
    }, [state.isAuthenticated, state.token, navigate, filters]);

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
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/harmonyhub/songs/${songId}/`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${state.token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setSongs(songs.filter(song => song.id !== songId));
        } catch (error) {
            setError(error);
            alert("Error al eliminar la canción. Inténtalo de nuevo.");
        }
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

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value,
            page: 1 // Reset pagination when filters change
        }));
    };

    const handlePageChange = (direction) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            page: prevFilters.page + direction
        }));
    };

    if (loading) return <p>Cargando canciones...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <section className="music-section">
            <h1>Music Page</h1>

            <div className="filters">
                <input
                    type="text"
                    name="title"
                    placeholder="Título"
                    value={filters.title}
                    onChange={handleFilterChange}
                />
                <input
                    type="text"
                    name="album"
                    placeholder="Álbum"
                    value={filters.album}
                    onChange={handleFilterChange}
                />
                <input
                    type="text"
                    name="artists"
                    placeholder="Artistas"
                    value={filters.artists}
                    onChange={handleFilterChange}
                />
                <input
                    type="text"
                    name="genres"
                    placeholder="Géneros"
                    value={filters.genres}
                    onChange={handleFilterChange}
                />
                <input
                    type="number"
                    name="year"
                    placeholder="Año"
                    value={filters.year}
                    onChange={handleFilterChange}
                />
            </div>

            <div className="playlist-creation">
                <input 
                    type="text" 
                    value={newPlaylistName} 
                    onChange={(e) => setNewPlaylistName(e.target.value)} 
                    placeholder="Nuevo nombre de lista de reproducción"
                />
                <button onClick={handleCreatePlaylist}>Crear Lista</button>
            </div>

            <div className="song-list">
                {songs.map((song) => (
                    <div key={song.id} className="song-item">
                        <span onClick={() => handlePlay(song)}>{song.title}</span>
                        <button onClick={() => handleAddToPlaylist(selectedPlaylistId, song.id)}>Agregar a la lista</button>
                        <button onClick={() => handleRemoveFromPlaylist(selectedPlaylistId, song.id)}>Eliminar de la lista</button>
                        <button onClick={() => handleDeleteSong(song.id)}>Eliminar</button>
                    </div>
                ))}
            </div>

            {currentSong && (
                <div className="player-controls">
                    <ReactPlayer
                        ref={playerRef}
                        url={currentSong.song_file}
                        playing={playing}
                        controls={false}
                        width="100%"
                        height="50px"
                    />
                    <div className="controls">
                        <button onClick={() => setPlaying(true)}>Play</button>
                        <button onClick={handlePause}>Pause</button>
                        <button onClick={handleStop}>Stop</button>
                    </div>
                </div>
            )}

            <div className="pagination">
                <button
                    onClick={() => handlePageChange(-1)}
                    disabled={filters.page === 1}
                >
                    Anterior
                </button>
                <span>Página {filters.page}</span>
                <button onClick={() => handlePageChange(1)}>Siguiente</button>
            </div>
        </section>
    );
}

export default Musica;
