import React, { useEffect, useRef, useState } from 'react';
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
    const [searchQuery, setSearchQuery] = useState({
        title: '',
        artist: '',
        album: '', 
        year: '',
        genre: ''
    });
    const [playlists, setPlaylists] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const playerRef = useRef(null);
    const { state } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!state.isAuthenticated) {
            navigate('/login');
            return;
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

        fetchPlaylists();
    }, [state.isAuthenticated, state.token, navigate]);

    const fetchSongs = async (queryParams) => {
        try {
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
            setTotalPages(Math.ceil(data.count / 10)); // Assuming the API returns a count of total songs
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (state.isAuthenticated) {
            fetchSongs('');
        }
    }, [state.isAuthenticated, state.token, navigate]);

    const handleSearch = () => {
        setLoading(true);
        setCurrentPage(1); // Reset page to 1 when search query changes
        const queryParams = new URLSearchParams(
            Object.fromEntries(
                Object.entries(searchQuery).filter(([_, value]) => value)
            )
        ).toString();
        fetchSongs(queryParams);
    };

    const handlePlayPlaylist = async (playlistId) => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/harmonyhub/playlists/${playlistId}/songs/`, {
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
            setCurrentSong(data.results[0]);
            setPlaying(true);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

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

            {currentSong && (
                <div className="player-controls neon-player">
                    <ReactPlayer
                        ref={playerRef}
                        url={currentSong.song_file}
                        playing={playing}
                        controls={false}
                        width="100%"
                        height="50px"
                        onEnded={() => {
                            const currentIndex = songs.findIndex(song => song.id === currentSong.id);
                            if (currentIndex < songs.length - 1) {
                                setCurrentSong(songs[currentIndex + 1]);
                            } else {
                                setPlaying(false);
                                setCurrentSong(null);
                            }
                        }}
                    />
                    <div className="controls">
                        <button onClick={() => setPlaying(true)}>Play</button>
                        <button onClick={handlePause}>Pause</button>
                        <button onClick={handleStop}>Stop</button>
                    </div>
                </div>
            )}

            <div className="search-bar">
                <input
                    type="text"
                    name="title"
                    placeholder="Título"
                    value={searchQuery.title}
                    onChange={handleSearchChange}
                />
                <input
                    type="text"
                    name="artist"
                    placeholder="Artista"
                    value={searchQuery.artist}
                    onChange={handleSearchChange}
                />
                <input
                    type="text"
                    name="album"
                    placeholder="Álbum"
                    value={searchQuery.album}
                    onChange={handleSearchChange}
                />
                <input
                    type="text"
                    name="year"
                    placeholder="Año"
                    value={searchQuery.year}
                    onChange={handleSearchChange}
                />
                <input
                    type="text"
                    name="genre"
                    placeholder="Género"
                    value={searchQuery.genre}
                    onChange={handleSearchChange}
                />
                <button onClick={handleSearch}>Buscar</button>
            </div>

            <div className="playlist-selection">
                <select value={selectedPlaylistId} onChange={handlePlaylistSelect}>
                    <option value="">Selecciona una lista de reproducción</option>
                    {playlists.map(playlist => (
                        <option key={playlist.id} value={playlist.id}>{playlist.name}</option>
                    ))}
                </select>
                <button onClick={() => handlePlayPlaylist(selectedPlaylistId)} disabled={!selectedPlaylistId}>Reproducir Lista</button>
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
                        <button onClick={() => handleAddToPlaylist(selectedPlaylistId, song.id)} disabled={!selectedPlaylistId}>Agregar a la lista</button>
                        <button onClick={() => handleRemoveFromPlaylist(selectedPlaylistId, song.id)} disabled={!selectedPlaylistId}>Eliminar de la lista</button>
                        <button onClick={() => handleDeleteSong(song.id)}>Eliminar</button>
                    </div>
                ))}
            </div>

            <div className="pagination">
                <button
                    onClick={() => handlePageChange(-1)}
                    disabled={currentPage === 1}
                >
                    Anterior
                </button>
                <span>Página {currentPage} de {totalPages}</span>
                <button onClick={() => handlePageChange(1)} disabled={currentPage === totalPages}>Siguiente</button>
            </div>
        </section>
    );
}

export default Musica;