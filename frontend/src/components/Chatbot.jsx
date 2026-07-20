import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm the CampusConnect AI. Ask me about specific events or general info!", sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState("");
    const [allEvents, setAllEvents] = useState([]);
    const messagesEndRef = useRef(null);

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    // Fetch events on mount so we can search them locally
    useEffect(() => {
        const fetchEventData = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (storedUser && storedUser.token) {
                    const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
                    const { data } = await axios.get('/api/events', config);
                    setAllEvents(data);
                }
            } catch (error) {
                console.error("Chatbot failed to load events", error);
            }
        };
        fetchEventData();
    }, []);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        // Add user message
        const userMessage = { text: inputText, sender: 'user' };
        setMessages((prev) => [...prev, userMessage]);
        setInputText("");

        // Simulate AI Processing
        setTimeout(() => {
            let botResponse = "I'm not sure about that. Try asking about a specific event name or 'events'.";
            const lowerInput = userMessage.text.toLowerCase();

            // 1. Check for specific Event matches
            const matchedEvent = allEvents.find(event =>
                lowerInput.includes(event.title.toLowerCase()) ||
                (event.description && lowerInput.includes(event.description.toLowerCase()))
            );

            if (matchedEvent) {
                botResponse = `I found "${matchedEvent.title}"! It's on ${new Date(matchedEvent.date).toLocaleDateString()} at ${matchedEvent.location}. \n${matchedEvent.description ? "Description: " + matchedEvent.description : ""}`;
            }
            // 2. Static Knowledge Base
            else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
                botResponse = "Hello! I can help you find event details or navigate the site.";
            } else if (lowerInput.includes('who are you') || lowerInput.includes('use of you')) {
                botResponse = "I am the CampusConnect Assistant. I can look up event details for you instantly!";
            } else if (lowerInput.includes('event')) {
                botResponse = `We currently have ${allEvents.length} upcoming events inside the system. You can ask me about any of them by name!`;
            } else if (lowerInput.includes('workshop')) {
                botResponse = "Workshops behave similarly to events. You can browse them explicitly on the Workshops page.";
            } else if (lowerInput.includes('create') || lowerInput.includes('add')) {
                botResponse = "Only Admins can create new events or workshops. If you are an admin, look for the 'Add Event' link on the dashboard.";
            } else if (lowerInput.includes('fsd') || lowerInput.includes('aba')) {
                // Specific user query handling
                botResponse = "FSD ABA might refer to a specific course resource or event. If it's an event, I don't see it listed right now. Check the 'Events' tab to be sure!";
            } else if (lowerInput.includes('code hunt')) {
                // Fallback if not found in DB but asking about it
                botResponse = "Code Hunt sounds like a hackathon! If I didn't find it just now, it might not be created yet. Ask an admin to add it!";
            }

            setMessages((prev) => [...prev, { text: botResponse, sender: 'bot' }]);
        }, 600);
    };

    // --- Styles ---
    const containerStyle = {
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 1000,
        fontFamily: 'var(--font-main)',
    };

    const buttonStyle = {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-accent)',
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
        width: '320px',
        height: '450px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        animation: 'fadeInUp 0.3s ease-out',
    };

    const headerStyle = {
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        padding: '1rem',
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    };

    const messagesStyle = {
        flex: 1,
        padding: '1rem',
        overflowY: 'auto',
        backgroundColor: '#f9fafb',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
    };

    const inputAreaStyle = {
        padding: '1rem',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        gap: '0.5rem',
        backgroundColor: 'white',
    };

    const messageBubbleStyle = (sender) => ({
        maxWidth: '80%',
        padding: '0.6rem 1rem',
        borderRadius: '12px',
        fontSize: '0.9rem',
        alignSelf: sender === 'user' ? 'flex-end' : 'flex-start',
        backgroundColor: sender === 'user' ? 'var(--color-accent)' : '#e2e8f0',
        color: sender === 'user' ? 'white' : 'var(--color-text-main)',
        borderBottomRightRadius: sender === 'user' ? '2px' : '12px',
        borderBottomLeftRadius: sender === 'bot' ? '2px' : '12px',
        whiteSpace: 'pre-wrap', // Preserve newlines
    });

    return (
        <div style={containerStyle}>
            {isOpen && (
                <div style={windowStyle}>
                    <div style={headerStyle}>
                        <span>Campus AI</span>
                        <button onClick={toggleChat} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
                    </div>

                    <div style={messagesStyle}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={messageBubbleStyle(msg.sender)}>
                                {msg.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} style={inputAreaStyle}>
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Ask about events..."
                            style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }}
                        />
                        <button type="submit" style={{ backgroundColor: 'var(--color-accent)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
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
