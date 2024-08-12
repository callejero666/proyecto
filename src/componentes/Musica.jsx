import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { useAuth } from '../contexts/AuthContext';
import './Musica.css';

export function Musica() {
    // Estado para almacenar las canciones, la canción actual, y el estado del reproductor
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
        genre: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
    const [playlists, setPlaylists] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const playerRef = useRef(null);
    const { state } = useAuth();

    // Estado para los datos de la nueva canción y la visibilidad del modal
    const [newSong, setNewSong] = useState({
        title: '',
        year: '',
        album: '',
        file: null
    });
    const [showCreateSongModal, setShowCreateSongModal] = useState(false);

    // Fetch de las canciones cuando cambia la página o la búsqueda
    useEffect(() => {
        fetchSongs(currentPage, searchQuery);
    }, [currentPage, searchQuery]);

    // Función para obtener las canciones desde el servidor
    const fetchSongs = async (page, query) => {
        setLoading(true);
        try {
            let url = `${import.meta.env.VITE_API_BASE_URL}/harmonyhub/songs/?page=${page}&page_size=10`;

            // Añadimos los filtros de búsqueda a la URL
            Object.keys(query).forEach((key) => {
                if (query[key]) {
                    url += `&${key}=${encodeURIComponent(query[key])}`;
                }
            });

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": `Token ${state.token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setSongs(data.results);
            setTotalPages(Math.ceil(data.count / 10));
            setLoading(false);
        } catch (error) {
            setError(error);
            setLoading(false);
            alert("Error al cargar las canciones. Inténtalo de nuevo.");
        }
    };

    // Función para crear una nueva canción
    const handleCreateSong = async () => {
        if (newSong.title.trim() === '') return;

        const formData = new FormData();
        formData.append('title', newSong.title);
        formData.append('year', newSong.year ? parseInt(newSong.year, 10) : null);
        formData.append('album', newSong.album ? parseInt(newSong.album, 10) : null);
        if (newSong.file) {
            formData.append('file', newSong.file);
        }

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

    return (
        <section className="music-section">
            {/* Barra de búsqueda */}
            <div className="search-bar">
                <input
                    type="text"
                    name="title"
                    placeholder="Buscar por título"
                    value={searchQuery.title}
                    onChange={handleSearchChange}
                />
                <button onClick={() => fetchSongs(currentPage, searchQuery)}>Buscar</button>
            </div>

            {loading && <p>Cargando canciones...</p>}
            {error && <p>Error: {error.message}</p>}

            {/* Gestor de listas de reproducción */}
            <div className="playlist-manager">
                <select onChange={handlePlaylistSelect} value={selectedPlaylistId}>
                    <option value="">Selecciona una lista</option>
                    {playlists.map(playlist => (
                        <option key={playlist.id} value={playlist.id}>
                            {playlist.name}
                        </option>
                    ))}
                </select>
                <button onClick={() => handlePlayPlaylist(selectedPlaylistId)}>
                    Reproducir lista
                </button>
                <input
                    type="text"
                    placeholder="Nueva lista"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                />
                <button onClick={handleCreatePlaylist}>Crear lista</button>
            </div>

            {/* Lista de canciones */}
            <div className="song-list-container">
                <ul className="song-list">
                    {songs.map(song => (
                        <li key={song.id} className="song-item">
                            <span>{song.title} - {song.artist}</span>
                            <button onClick={() => handlePlay(song)}>Reproducir</button>
                            <button onClick={() => handleAddToPlaylist(selectedPlaylistId, song.id)}>Agregar a lista</button>
                            <button onClick={() => handleDeleteSong(song.id)}>Eliminar</button>
                        </li>
                    ))}
                </ul>
                <div className="pagination-controls">
                    <button onClick={() => handlePageChange('prev')} disabled={currentPage === 1}>
                        Anterior
                    </button>
                    <span>{currentPage} / {totalPages}</span>
                    <button onClick={() => handlePageChange('next')} disabled={currentPage === totalPages}>
                        Siguiente
                    </button>
                </div>
            </div>

            {/* Reproductor de música */}
            {currentSong && (
                <div className="player-container">
                    <div className="player-controls">
                        <button onClick={handleStop}>Detener</button>
                        <button onClick={handlePreviousSong}>Anterior</button>
                        <button onClick={() => setPlaying(!playing)}>
                            {playing ? "Pausar" : "Reproducir"}
                        </button>
                        <button onClick={handleNextSong}>Siguiente</button>
                        <button onClick={() => handleSeek(0)}>Reiniciar</button>
                        <button onClick={() => handleSeek(15)}>Avanzar 15s</button>
                        <button onClick={() => handleSeek(-15)}>Retroceder 15s</button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            defaultValue="0.5"
                            onChange={handleVolumeChange}
                        />
                    </div>
                    <ReactPlayer
                        ref={playerRef}
                        url={currentSong.song_file}
                        playing={playing}
                        controls
                        width="100%"
                        height="50px"
                    />
                </div>
            )}

            {/* Botones para crear una nueva canción */}
            <div className="creation-buttons">
                <button onClick={toggleCreateSongModal}>Crear Canción</button>
            </div>

            {/* Modal para crear una canción */}
            {showCreateSongModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Crear Canción</h2>
                        <input
                            type="text"
                            placeholder="Título"
                            value={newSong.title}
                            onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Año"
                            value={newSong.year}
                            onChange={(e) => setNewSong({ ...newSong, year: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Álbum"
                            value={newSong.album}
                            onChange={(e) => setNewSong({ ...newSong, album: e.target.value })}
                        />
                        <input
                            type="file"
                            accept="audio/mp3"
                            onChange={handleFileChange}
                        />
                        <button onClick={handleCreateSong}>Agregar Canción</button>
                        <button onClick={toggleCreateSongModal}>Cerrar</button>
                    </div>
                </div>
            )}
        </section>
    );
}

