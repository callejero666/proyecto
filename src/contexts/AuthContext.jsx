import React, { createContext, useContext, useReducer } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Crea un contexto para la autenticación
const AuthContext = createContext({
    state: {},
    actions: {},
});

// Define las acciones disponibles en el contexto
const ACTIONS = {
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    UPDATE_PROFILE: 'UPDATE_PROFILE',
};

// Función reductora para manejar las acciones de autenticación
function reducer(state, action) {
    switch (action.type) {
        case ACTIONS.LOGIN:
            return {
                ...state,
                ...action.payload,
                isAuthenticated: true,
            };
        case ACTIONS.LOGOUT:
            return {
                isAuthenticated: false,
                token: null,
                username: '',
                email: '',
                profilePicture: '',
                fullName: '',
                registrationDate: '',
                favoriteGenre: '',
                playlistCount: 0,
            };
        case ACTIONS.UPDATE_PROFILE:
            return {
                ...state,
                ...action.payload,
            };
        default:
            return state;
    }
}

// Proveedor del contexto de autenticación
export function AuthProvider({ children }) {
    // Estado inicial del contexto con useReducer
    const [state, dispatch] = useReducer(reducer, {
        isAuthenticated: false,
        token: localStorage.getItem('token'),
        username: '',
        email: '',
        profilePicture: '',
        fullName: '',
        registrationDate: '',
        favoriteGenre: '',
        playlistCount: 0,
    });

    const navigate = useNavigate();
    const location = useLocation();

    // Acciones disponibles en el contexto
    const actions = {
        login: (userData) => {
            if (!state.isAuthenticated) {
                localStorage.setItem('token', userData.token);
                dispatch({ type: ACTIONS.LOGIN, payload: userData });
                // Redirige al usuario a la ubicación original o a la página principal
                const origin = location.state?.from?.pathname || '/';
                navigate(origin);
            }
        },
        logout: () => {
            localStorage.removeItem('token');
            dispatch({ type: ACTIONS.LOGOUT });
            navigate('/login');
        },
        updateProfile: (profileData) => {
            dispatch({ type: ACTIONS.UPDATE_PROFILE, payload: profileData });
        },
    };

    // Proporciona el estado y las acciones a los componentes hijos
    return (
        <AuthContext.Provider value={{ state, actions }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook personalizado para usar el contexto de autenticación
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
    }
    return context;
}
