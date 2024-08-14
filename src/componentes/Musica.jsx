import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { useAuth } from '../contexts/AuthContext';
import './Musica.css';

export function Musica() {
    const [songs, setSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [playing, setPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const playerRef = useRef(null);
    const { state } = useAuth();
    const [showFiltersModal, setShowFiltersModal] = useState(false);


    const [newSong, setNewSong] = useState({
        id: '',
        title: '',
        year: '',
        album: '',
        song_file: null
    });
    const [newArtist, setNewArtist] = useState({
        name: '',
        bio: '',
        website: ''
    });
    const [artistList, setArtistList] = useState([]);
    const [showCreateSongModal, setShowCreateSongModal] = useState(false);
    const [showCreateArtistModal, setShowCreateArtistModal] = useState(false);
    const [showArtistListModal, setShowArtistListModal] = useState(false);
    const [showUpdateSongModal, setShowUpdateSongModal] = useState(false);
    const [selectedSong, setSelectedSong] = useState({
        id: '',
        title: '',
        year: '',
        album: ''
    });

    const [filters, setFilters] = useState({
        titulo: '',
        album: '',
        artistas: '',
        generos: '',
        año: '',
        duracion: '',
        reproducciones: '',
        creado_desde: '',
        creado_hasta: '',
        actualizado_desde: '',
        actualizado_hasta: '',
        propietario: '',
        ordenar_por: ''
    });

    useEffect(() => {
        fetchSongs(currentPage, searchQuery);
    }, [currentPage, searchQuery]);

    const fetchSongs = async (page, query = '') => {
        setLoading(true);
        try {
            let url = `${import.meta.env.VITE_API_BASE_URL}/harmonyhub/songs/?page=${page}&page_size=10`;

            if (query) {
                url += `&title=${encodeURIComponent(query)}`;
            }

            // Add filters to the URL
            Object.keys(filters).forEach(key => {
                if (filters[key]) {
                    url += `&${key}=${encodeURIComponent(filters[key])}`;
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

    const handleCreateSong = async () => {
        if (newSong.title.trim() === '') return;

        try {
            const formData = new FormData();
            formData.append('title', newSong.title);
            if (newSong.year) formData.append('year', newSong.year);
            if (newSong.album) formData.append('album', newSong.album);
            if (newSong.song_file) formData.append('song_file', newSong.song_file);

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
            setNewSong({ id: '', title: '', year: '', album: '', song_file: null });
            alert("Canción creada exitosamente.");
            toggleCreateSongModal();
        } catch (error) {
            setError(error);
            alert("Error al crear la canción. Inténtalo de nuevo.");
        }
    };

    const handleCreateArtist = async () => {
        if (newArtist.name.trim() === '') return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/harmonyhub/artists/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${state.token}`
                },
                body: JSON.stringify(newArtist)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Datos del artista creado:", data);
            setNewArtist({ name: '', bio: '', website: '' });
            setArtistList(prev => [data, ...prev]);
            alert("Artista creado exitosamente.");
            toggleCreateArtistModal();
        } catch (error) {
            setError(error);
            alert("Error al crear el artista. Inténtalo de nuevo.");
        }
    };

    const handleUpdateSong = async () => {
        if (!selectedSong) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/harmonyhub/songs/${selectedSong.id}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${state.token}`
                },
                body: JSON.stringify(selectedSong)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const updatedSong = await response.json();
            setSongs(prev => prev.map(song => song.id === updatedSong.id ? updatedSong : song));
            alert("Canción actualizada exitosamente.");
            toggleUpdateSongModal();
        } catch (error) {
            setError(error);
            alert("Error al actualizar la canción. Inténtalo de nuevo.");
        }
    };

    const handleDeleteSong = async (id) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar esta canción?")) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/harmonyhub/songs/${id}/`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Token ${state.token}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            setSongs(prev => prev.filter(song => song.id !== id));
            alert("Canción eliminada exitosamente.");
        } catch (error) {
            setError(error);
            alert("Error al eliminar la canción. Inténtalo de nuevo.");
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (direction) => {
        if (direction === 'next' && currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        } else if (direction === 'prev' && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const toggleCreateSongModal = () => setShowCreateSongModal(!showCreateSongModal);
    const toggleCreateArtistModal = () => setShowCreateArtistModal(!showCreateArtistModal);
    const toggleArtistListModal = () => setShowArtistListModal(!showArtistListModal);
    const toggleUpdateSongModal = () => setShowUpdateSongModal(!showUpdateSongModal);


    return (
        <section className="music-section">
            <div className="search-bar">
                <input
                    type="text"
                    id="search-input"         // ID único para vincular el campo de forma accesible
                    name="searchQuery"        // Nombre descriptivo para el campo de entrada
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Buscar canciones..."
                    autocomplete="off"        // Desactiva el autocompletado del navegador
                />
            </div>


            <div className="advanced-filters">
                <button
                    onClick={() => setShowFiltersModal(true)}
                    className={`filter-button ${Object.values(filters).some(v => v !== '') ? 'active' : ''}`}
                >
                    Filtros avanzados {Object.values(filters).some(v => v !== '') ? '(activos)' : ''}
                </button>
            </div>

            {loading && <p>Cargando canciones...</p>}
            {error && <p>Error: {error.message}</p>}

            <div className="song-list">
                <h2>Lista de Canciones</h2>
                {songs.length === 0 ? (
                    <p>No hay canciones disponibles.</p>
                ) : (
                    <ul>
                        {songs.map(song => (
                            <li key={song.id}>
                                <strong>{song.title}</strong> - {song.year}
                                <button onClick={() => setCurrentSong(song)}>Reproducir</button>
                                <button onClick={() => { setSelectedSong(song); toggleUpdateSongModal(); }}>Editar</button>
                                <button onClick={() => handleDeleteSong(song.id)}>Eliminar</button>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="pagination-controls">
                    <button onClick={() => handlePageChange('prev')} disabled={currentPage === 1}>
                        Anterior
                    </button>
                    <span> Página {currentPage} de {totalPages} </span>
                    <button onClick={() => handlePageChange('next')} disabled={currentPage === totalPages}>
                        Siguiente
                    </button>
                </div>
            </div>

            {currentSong && (
                <div className="player-container">
                    <ReactPlayer
                        ref={playerRef}
                        url={currentSong.song_file}
                        playing={playing}
                        controls
                        width="100%"
                        height="50px"
                    />
                    <button onClick={() => setPlaying(!playing)}>
                        {playing ? "Pausar" : "Reproducir"}
                    </button>
                </div>
            )}

            <div className="creation-buttons">
                <button onClick={toggleCreateSongModal} className="small-button">Crear Canción</button>
                <button onClick={toggleCreateArtistModal} className="small-button">Crear Artista</button>
                <button onClick={toggleArtistListModal} className="small-button">Mostrar Artistas</button>
            </div>

            {showCreateSongModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Crear Canción</h2>
                        <input
                            type="text"
                            name="title"
                            value={newSong.title}
                            onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                            placeholder="Título de la canción"
                            required
                        />
                        <input
                            type="number"
                            name="year"
                            value={newSong.year}
                            onChange={(e) => setNewSong({ ...newSong, year: e.target.value })}
                            placeholder="Año de lanzamiento"
                        />
                        <input
                            type="number"
                            name="album"
                            value={newSong.album}
                            onChange={(e) => setNewSong({ ...newSong, album: e.target.value })}
                            placeholder="ID del álbum"
                        />
                        <input
                            type="file"
                            accept=".mp3"
                            onChange={(e) => setNewSong({ ...newSong, song_file: e.target.files[0] })}
                        />
                        <button onClick={handleCreateSong}>Crear Canción</button>
                        <button onClick={toggleCreateSongModal}>Cerrar</button>
                    </div>
                </div>
            )}

            {showCreateArtistModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Crear Artista</h2>
                        <input
                            type="text"
                            name="name"
                            value={newArtist.name}
                            onChange={(e) => setNewArtist({ ...newArtist, name: e.target.value })}
                            placeholder="Nombre del artista"
                            required
                        />
                        <textarea
                            name="bio"
                            value={newArtist.bio}
                            onChange={(e) => setNewArtist({ ...newArtist, bio: e.target.value })}
                            placeholder="Biografía"
                        />
                        <input
                            type="text"
                            name="website"
                            value={newArtist.website}
                            onChange={(e) => setNewArtist({ ...newArtist, website: e.target.value })}
                            placeholder="Página web"
                        />
                        <button onClick={handleCreateArtist}>Crear Artista</button>
                        <button onClick={toggleCreateArtistModal}>Cerrar</button>
                    </div>
                </div>
            )}

            {showArtistListModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Lista de Artistas</h2>
                        {artistList.length === 0 ? (
                            <p>No hay artistas disponibles.</p>
                        ) : (
                            <ul>
                                {artistList.map(artist => (
                                    <li key={artist.id}>
                                        <strong>{artist.name}</strong>
                                        <p>{artist.bio}</p>
                                        <a href={artist.website} target="_blank" rel="noopener noreferrer">{artist.website}</a>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <button onClick={toggleArtistListModal}>Cerrar</button>
                    </div>
                </div>
            )}

            {showUpdateSongModal && selectedSong && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Actualizar Canción</h2>
                        <input
                            type="text"
                            name="title"
                            value={selectedSong.title || ''}
                            onChange={(e) => setSelectedSong({ ...selectedSong, title: e.target.value })}
                            placeholder="Título de la canción"
                            required
                        />
                        <input
                            type="number"
                            name="year"
                            value={selectedSong.year || ''}
                            onChange={(e) => setSelectedSong({ ...selectedSong, year: e.target.value })}
                            placeholder="Año de lanzamiento"
                        />
                        <input
                            type="number"
                            name="album"
                            value={selectedSong.album || ''}
                            onChange={(e) => setSelectedSong({ ...selectedSong, album: e.target.value })}
                            placeholder="ID del álbum"
                        />
                        <button onClick={handleUpdateSong}>Actualizar Canción</button>
                        <button onClick={toggleUpdateSongModal}>Cerrar</button>
                    </div>
                </div>
            )}

            {showFiltersModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Filtros avanzados</h2>
                        <div className="filter-scroll-area" />
                        {Object.entries({
                            titulo: 'Título',
                            album: 'Álbum',
                            artistas: 'Artistas',
                            generos: 'Géneros',
                            año: 'Año',
                            duracion: 'Duración',
                            reproducciones: 'Número de reproducciones',
                            creado_desde: 'Creado desde',
                            creado_hasta: 'Creado hasta',
                            actualizado_desde: 'Actualizado desde',
                            actualizado_hasta: 'Actualizado hasta',
                            propietario: 'Propietario',
                            ordenar_por: 'Ordenar por'
                        }).map(([key, label]) => (
                            <div key={key} className="filter-item">
                                <label htmlFor={key}>{label}</label>
                                <input
                                    id={key}
                                    type="text"
                                    value={filters[key]}
                                    onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                                    placeholder={label}
                                />
                            </div>
                        ))}
                        <div className="modal-buttons">
                            <button onClick={() => {
                                fetchSongs(1);
                                setShowFiltersModal(false);
                            }}>Aplicar filtros</button>
                            <button onClick={() => setShowFiltersModal(false)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}



