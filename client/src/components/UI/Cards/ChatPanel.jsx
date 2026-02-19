import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { MessageCircle, Send, X } from 'lucide-react';

export const ChatPanel = ({ userName = "Central", role = "admin" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);

    // Conectar al socket al cargar el componente
    useEffect(() => {
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);

        newSocket.on('receiveChatMessage', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => newSocket.disconnect();
    }, []);

    // Bajar el scroll automáticamente cuando llega un mensaje
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        socket.emit('sendChatMessage', {
            sender: userName,
            role: role,
            text: newMessage.trim()
        });
        setNewMessage('');
    };

    return (
        <div className="absolute bottom-6 right-6 z-[2000] flex flex-col items-end pointer-events-auto">
            
            {/* --- VENTANA DE CHAT --- */}
            {isOpen && (
                <div className="w-80 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[400px] mb-4 animate-in slide-in-from-bottom-5">
                    {/* Cabecera */}
                    <div className="bg-slate-800 text-white p-3 flex justify-between items-center shadow-md z-10">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            <h3 className="font-bold tracking-wide text-sm">Radio PelicanTracker</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:text-slate-300 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Lista de Mensajes */}
                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-3 scrollbar-hide">
                        {messages.length === 0 && (
                            <p className="text-center text-slate-400 text-xs mt-4 italic">
                                No hay mensajes. Escribe algo para iniciar la transmisión.
                            </p>
                        )}
                        
                        {messages.map((msg) => {
                            // Detectamos si el mensaje lo envié yo o la otra persona
                            const isMe = msg.role === role;
                            
                            return (
                                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <span className="text-[10px] text-slate-400 ml-1 mr-1 mb-0.5 font-medium">
                                        {msg.sender} • {msg.timestamp}
                                    </span>
                                    <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm ${
                                        isMe 
                                            ? 'bg-blue-600 text-white rounded-tr-sm' 
                                            : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input de envío */}
                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Mensaje a la flota..."
                            className="flex-1 bg-slate-100 rounded-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700"
                        />
                        <button 
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center shadow-md active:scale-95"
                        >
                            <Send size={18} className="ml-0.5" />
                        </button>
                    </form>
                </div>
            )}

            {/* --- BOTÓN FLOTANTE PARA ABRIR --- */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center hover:scale-105 active:scale-95 ${
                    isOpen ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>
            
        </div>
    );
};