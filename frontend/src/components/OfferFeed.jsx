import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function OfferFeed() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                // In a real app, use environment variable for URL
                const res = await fetch('http://localhost:5000/api/offers');
                const data = await res.json();
                if (data.success) {
                    setOffers(data.data);
                }
            } catch (err) {
                console.error("Failed to load offers:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, []);

    // Auto-Scroll Logic
    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                // If at end, scroll back to start
                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    // Scroll one card width (approx 320px + gap)
                    scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
                }
            }
        }, 3500); // 3.5 seconds per slide

        return () => clearInterval(interval);
    }, [offers]);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const amount = direction === 'left' ? -320 : 320;
            scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
    };

    if (loading) return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
            <span className="spin" style={{ display: 'inline-block', marginRight: '0.5rem' }}>⟳</span>
            Loading Live Offers...
        </div>
    );

    if (offers.length === 0) return null;

    return (
        <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '3rem',
            marginTop: '2rem',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📢 Live Offer News
                    <span style={{ fontSize: '0.8rem', background: '#ef4444', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>LIVE</span>
                </h2>

                {/* Manual Controls */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => scroll('left')} style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'white', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => scroll('right')} style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'white', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                style={{
                    display: 'flex',
                    gap: '1.5rem',
                    overflowX: 'auto',
                    scrollSnapType: 'x mandatory',
                    paddingBottom: '1rem',
                    scrollbarWidth: 'none', // Firefox
                    msOverflowStyle: 'none'  // IE
                }}
                className="hide-scrollbar"
            >
                {offers.map((offer, index) => (
                    <div
                        key={index}
                        onClick={() => window.open(offer.link, '_blank')}
                        style={{
                            minWidth: '300px',
                            maxWidth: '300px',
                            background: 'var(--background)',
                            border: `1px solid ${offer.color || '#334155'}`,
                            borderRadius: '0.8rem',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            scrollSnapAlign: 'start',
                            flexShrink: 0
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ height: '160px', overflow: 'hidden', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            {offer.image ? (
                                <img
                                    src={offer.image}
                                    alt={offer.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                        e.target.parentNode.classList.add('fallback-bg');
                                    }}
                                />
                            ) : null}

                            {/* Fallback / Placeholder if no image or error */}
                            <div className="fallback-placeholder" style={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                background: `linear-gradient(135deg, ${offer.color || '#334155'}22, ${offer.color || '#334155'}44)`,
                                display: offer.image ? 'none' : 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column'
                            }}>
                                <img src={offer.logo} alt={offer.source} style={{ width: '60px', height: '60px', borderRadius: '50%', marginBottom: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                <span style={{ fontWeight: 'bold', color: offer.color || '#94a3b8' }}>{offer.source} Offer</span>
                            </div>
                        </div>

                        <div style={{ padding: '1rem', flex: 1, background: 'var(--surface)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <img src={offer.logo} alt={offer.source} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                                <span style={{ fontWeight: 'bold', color: offer.color || 'white', fontSize: '0.9rem' }}>{offer.source}</span>
                            </div>
                            <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', lineHeight: '1.4', color: 'var(--text)' }}>{offer.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>{offer.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .fallback-bg .fallback-placeholder {
                    display: flex !important;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
