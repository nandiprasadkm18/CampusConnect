import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm the CampusConnect AI. Ask me about specific events or general info!", sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || isTyping) return;

        const userText = inputText.trim();
        const userMessage = { text: userText, sender: 'user' };
        setMessages((prev) => [...prev, userMessage]);
        setInputText("");
        setIsTyping(true);

        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (!storedUser || !storedUser.token) {
                setMessages((prev) => [...prev, { text: "Please log in to chat with me.", sender: 'bot' }]);
                setIsTyping(false);
                return;
            }

            const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
            
            // Format history for API (last 10 messages for context)
            const history = messages.slice(-10).map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
            })).concat({ role: 'user', content: userText });

            const { data } = await axios.post('http://localhost:5000/api/chatbot/chat', { messages: history }, config);
            
            setMessages((prev) => [...prev, { text: data.content, sender: 'bot' }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [...prev, { text: "My AI circuits are a bit fuzzy right now. Please try again in a moment!", sender: 'bot' }]);
        } finally {
            setIsTyping(false);
        }
    };

    // --- Styles ---
    const containerStyle = {
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 1000,
        fontFamily: 'var(--font-sans)',
    };

    const buttonStyle = {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        border: 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        fontSize: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.2s',
    };

    const windowStyle = {
        position: 'absolute',
        bottom: '80px',
        right: '0',
        width: '350px',
        height: '500px',
        backgroundColor: 'white',
        borderRadius: '24px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        animation: 'fadeInUp 0.3s ease-out',
    };

    const headerStyle = {
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        padding: '1.25rem',
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    };

    const messagesStyle = {
        flex: 1,
        padding: '1.25rem',
        overflowY: 'auto',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    };

    const inputAreaStyle = {
        padding: '1.25rem',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        gap: '0.75rem',
        backgroundColor: 'white',
    };

    const messageBubbleStyle = (sender) => ({
        maxWidth: '85%',
        padding: '0.75rem 1rem',
        borderRadius: '1.25rem',
        fontSize: '0.95rem',
        alignSelf: sender === 'user' ? 'flex-end' : 'flex-start',
        backgroundColor: sender === 'user' ? 'var(--color-primary)' : 'white',
        color: sender === 'user' ? 'white' : 'var(--color-text-dark)',
        border: sender === 'user' ? 'none' : '1px solid var(--color-border)',
        boxShadow: sender === 'bot' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
        borderBottomRightRadius: sender === 'user' ? '4px' : '1.25rem',
        borderBottomLeftRadius: sender === 'bot' ? '4px' : '1.25rem',
        lineHeight: '1.5',
        whiteSpace: 'pre-wrap',
    });

    const typingIndicatorStyle = {
        alignSelf: 'flex-start',
        backgroundColor: '#e2e8f0',
        padding: '0.5rem 1rem',
        borderRadius: '1rem',
        fontSize: '0.8rem',
        color: '#64748b',
        fontStyle: 'italic',
    };

    return (
        <div style={containerStyle}>
            {isOpen && (
                <div style={windowStyle}>
                    <div style={headerStyle}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <div style={{width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%'}}></div>
                            <span>CampusConnect AI</span>
                        </div>
                        <button onClick={toggleChat} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
                    </div>

                    <div style={messagesStyle}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={messageBubbleStyle(msg.sender)}>
                                {msg.text}
                            </div>
                        ))}
                        {isTyping && (
                            <div style={typingIndicatorStyle}>AI is thinking...</div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} style={inputAreaStyle}>
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type your message..."
                            disabled={isTyping}
                            style={{ 
                                flex: 1, 
                                padding: '0.75rem 1rem', 
                                borderRadius: '1rem', 
                                border: '1px solid var(--color-border)', 
                                outline: 'none',
                                fontSize: '0.95rem'
                            }}
                        />
                        <button 
                            type="submit" 
                            disabled={isTyping || !inputText.trim()}
                            style={{ 
                                backgroundColor: 'var(--color-primary)', 
                                color: 'white', 
                                border: 'none', 
                                padding: '0.75rem 1.25rem', 
                                borderRadius: '1rem', 
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                opacity: (isTyping || !inputText.trim()) ? 0.5 : 1
                            }}
                        >
                            Send
                        </button>
                    </form>
                </div>
            )}

            <button onClick={toggleChat} style={buttonStyle} className="hover-scale">
                {isOpen ? '✕' : '💬'}
            </button>
        </div>
    );
};

export default Chatbot;
