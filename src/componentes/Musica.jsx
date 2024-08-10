import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Musica.css';


export function Musica() {
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