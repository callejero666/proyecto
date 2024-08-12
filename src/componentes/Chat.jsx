import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Chat.css';

// Componente funcional Chat
export function Chat() {
  // Estados para almacenar los mensajes y el nuevo mensaje
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const navigate = useNavigate(); // Hook para navegar entre rutas

  // Función para enviar un nuevo mensaje
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { text: newMessage, id: Date.now() }]);
      setNewMessage('');
    }
  };

  // Función para eliminar un mensaje por ID
  const handleDeleteMessage = (id) => {
    setMessages(messages.filter(message => message.id !== id));
  };

  // Renderizado del componente
  return (
    <div className="chat-container">
      {/* Contenedor de mensajes */}
      <div className="messages">
        {messages.map((message) => (
          <div key={message.id} className="message">
            {message.text}
            {/* Botón para eliminar el mensaje */}
            <button
              className="delete-btn"
              onClick={() => handleDeleteMessage(message.id)}
            >
              X
            </button>
          </div>
        ))}
      </div>
      {/* Contenedor de entrada de mensajes */}
      <div className="input-container">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe tu mensaje..."
        />
        <button onClick={handleSendMessage}>Enviar</button>
      </div>
      {/* Botón para volver a la ruta principal */}
      <button onClick={() => navigate('/principal')}>Volver al Principal</button>
    </div>
  );
}
