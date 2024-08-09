import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useFetch from '../hooks/useFetch';
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
    };

    const handleDeleteSong = async (songId) => {
        const [{ data, isError }, doFetchDelete] = useFetch(
            `/harmonyhub/songs/${songId}/`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        await doFetchDelete();

        if (!isError) {
            setSongs(songs.filter(song => song.id !== songId));
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