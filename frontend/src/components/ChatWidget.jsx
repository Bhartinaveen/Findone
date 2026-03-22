import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ShoppingBag, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import { sendChat } from '../api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatWidget({ onRecommend }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [mode, setMode] = useState('search');

    const initialMsgSearch = [{ role: 'bot', content: 'Hi! I can help you find products. What are you looking for?' }];
    const initialMsgCompare = [{ role: 'bot', content: 'Hi! I can help you compare products. What would you like to compare?' }];

    // Initialize from LocalStorage if available
    const [allMessages, setAllMessages] = useState(() => {
        const saved = localStorage.getItem('chat_messages_v2');
        return saved ? JSON.parse(saved) : {
            search: initialMsgSearch,
            compare: initialMsgCompare
        };
    });

    const messages = allMessages[mode] || [];

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    // Persist to LocalStorage whenever messages change
    useEffect(() => {
        localStorage.setItem('chat_messages_v2', JSON.stringify(allMessages));
    }, [allMessages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const currentHistory = allMessages[mode];
        const userMsg = { role: 'user', content: input };
        setAllMessages(prev => ({
            ...prev,
            [mode]: [...prev[mode], userMsg]
        }));
        setInput('');
        setLoading(true);

        // Notify Home page that scraping might start
        window.dispatchEvent(new CustomEvent('chat-scrape-start'));

        try {
            const { answer, products } = await sendChat(input, mode, currentHistory);
            setAllMessages(prev => ({
                ...prev,
                [mode]: [...prev[mode], { role: 'bot', content: answer }]
            }));

            if (products && products.length > 0) {
                setAllMessages(prev => ({
                    ...prev,
                    [mode]: [...prev[mode], { role: 'bot-products', content: products }]
                }));
                // Notify Home page to update
                window.dispatchEvent(new CustomEvent('product-update', { detail: products }));
            }
        } catch (error) {
            console.error("Chat error:", error);
            setAllMessages(prev => ({
                ...prev,
                [mode]: [...prev[mode], { role: 'bot', content: "Sorry, I encountered an error. Please try again." }]
            }));
        } finally {
            setLoading(false);
            window.dispatchEvent(new CustomEvent('chat-scrape-end'));
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const resetChat = (e) => {
        e.stopPropagation();
        setAllMessages(prev => ({
            ...prev,
            [mode]: mode === 'search' ? initialMsgSearch : initialMsgCompare
        }));
        setInput('');
    };

    return (
        <>
            <button
                className="chat-toggle-btn"
                onClick={toggleChat}
            >
                {isOpen ? <X color="white" /> : <MessageCircle color="white" />}
            </button>

            {isOpen && (
                <div className="chat-widget" style={isExpanded ? {
                    width: '800px',
                    maxWidth: '95vw',
                    height: '80vh',
                    maxHeight: '900px',
                    right: '50%',
                    bottom: '2rem',
                    transform: 'translateX(50%)'
                } : {}}>
                    <div className="chat-header" style={{ justifyContent: 'space-between', flexDirection: 'column', alignItems: 'stretch' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div className="chat-header-dot"></div>
                                <MessageCircle size={18} />
                                FindNow Assistant
                            </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', borderRadius: '0.4rem', padding: '0.25rem 0.6rem', gap: '4px', fontSize: '0.78rem', transition: 'all 0.2s' }}
                                title={isExpanded ? "Minimize" : "Expand"}
                            >
                                {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                                {isExpanded ? 'Minimize' : 'Expand'}
                            </button>
                            <button
                                onClick={resetChat}
                                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', borderRadius: '0.4rem', padding: '0.25rem 0.6rem', gap: '4px', fontSize: '0.78rem', transition: 'all 0.2s' }}
                                title="Start New Chat"
                            >
                                <RotateCcw size={13} />
                                New Chat
                            </button>
                        </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '0.5rem' }}>
                            <button 
                                onClick={() => setMode('search')}
                                style={{ flex: 1, padding: '6px', borderRadius: '0.4rem', border: 'none', background: mode === 'search' ? '#6366f1' : 'transparent', color: mode === 'search' ? 'white' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: mode === 'search' ? 'bold' : 'normal', transition: 'all 0.2s' }}>
                                Search Mode
                            </button>
                            <button 
                                onClick={() => setMode('compare')}
                                style={{ flex: 1, padding: '6px', borderRadius: '0.4rem', border: 'none', background: mode === 'compare' ? '#10b981' : 'transparent', color: mode === 'compare' ? 'white' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: mode === 'compare' ? 'bold' : 'normal', transition: 'all 0.2s' }}>
                                Compare Mode
                            </button>
                        </div>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={msg.role === 'bot-products' ? 'product-matches' : `message ${msg.role}`}>
                                {msg.role === 'bot-products' ? (
                                    <ChatProductList products={msg.content} />
                                ) : msg.role === 'bot' ? (
                                    <ReactMarkdown 
                                      remarkPlugins={[remarkGfm]}
                                      components={{
                                        table: ({node, ...props}) => <table style={{ borderCollapse: 'collapse', width: '100%', margin: '10px 0', fontSize: '0.85rem' }} {...props} />,
                                        th: ({node, ...props}) => <th style={{ border: '1px solid rgba(255,255,255,0.2)', padding: '6px', backgroundColor: 'rgba(255,255,255,0.1)' }} {...props} />,
                                        td: ({node, ...props}) => <td style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '6px' }} {...props} />,
                                        p: ({node, ...props}) => <p style={{ margin: '0 0 8px 0' }} {...props} />
                                      }}
                                    >
                                      {msg.content}
                                    </ReactMarkdown>
                                ) : (
                                    msg.content
                                )}
                            </div>
                        ))}
                        {loading && <div className="message bot">Thinking... (I might scrape new data if needed)</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-area">
                        <input
                            type="text"
                            className="chat-input"
                            placeholder="Ask anything..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                        />
                        <button className="send-btn" onClick={handleSend} disabled={loading}>
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

// Sub-component for Sorting/Filtering within Chat
function ChatProductList({ products }) {
    const [sortMode, setSortMode] = useState('relevance'); // relevance, price-asc, price-desc, rating

    const sortedProducts = React.useMemo(() => {
        let sorted = [...products];
        if (sortMode === 'price-asc') sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        else if (sortMode === 'price-desc') sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        else if (sortMode === 'rating') sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        return sorted;
    }, [products, sortMode]);

    return (
        <div className="chat-product-list">
            <div className="chat-filters" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
                <button
                    onClick={() => setSortMode('price-asc')}
                    style={{ fontSize: '0.7rem', padding: '2px 4px', background: sortMode === 'price-asc' ? '#6366f1' : '#334155', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>
                    Price ↑
                </button>
                <button
                    onClick={() => setSortMode('price-desc')}
                    style={{ fontSize: '0.7rem', padding: '2px 4px', background: sortMode === 'price-desc' ? '#6366f1' : '#334155', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>
                    Price ↓
                </button>
                <button
                    onClick={() => setSortMode('rating')}
                    style={{ fontSize: '0.7rem', padding: '2px 4px', background: sortMode === 'rating' ? '#6366f1' : '#334155', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>
                    Rating ★
                </button>
            </div>

            {sortedProducts.map(p => (
                <div key={p.id} className="mini-product-card" onClick={() => window.location.href = `/product/${p.id}`}>
                    <img
                        src={p.image_url || 'https://placehold.co/60x60?text=?'}
                        alt=""
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/60x60?text=?'; }}
                    />
                    <div style={{ overflow: 'hidden', flex: 1 }}>
                        <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.85rem' }}>{p.title}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '0.8rem' }}>₹{p.price}</div>
                            {p.rating > 0 && <div style={{ fontSize: '0.7rem', color: '#fbbf24' }}>★ {p.rating}</div>}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
