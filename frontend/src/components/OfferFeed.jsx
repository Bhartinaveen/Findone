import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getApiUrl } from '../api';

// Extracted sub-component so hooks are called at component level (not inside map)
function OfferCard({ offer }) {
    const [imgError, setImgError] = useState(false);

    return (
        <div
            onClick={() => window.open(offer.link, '_blank')}
            style={{
                minWidth: '300px',
                maxWidth: '300px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                borderRadius: '1rem',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                scrollSnapAlign: 'start',
                flexShrink: 0
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = 'var(--border-hover)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
        >
            {/* Banner Image Area */}
            <div style={{
                height: '160px',
                overflow: 'hidden',
                position: 'relative',
                borderBottom: '1px solid var(--border)',
                background: `linear-gradient(135deg, ${offer.color || '#334155'}33, ${offer.color || '#334155'}66)`
            }}>
                {offer.image && !imgError ? (
                    <img
                        src={offer.image}
                        alt={offer.title}
                        referrerPolicy="no-referrer"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div style={{
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexDirection: 'column', gap: '0.5rem',
                        background: `linear-gradient(135deg, ${offer.color || '#334155'}22, ${offer.color || '#334155'}55)`
                    }}>
                        <img
                            src={offer.logo}
                            alt={offer.source}
                            referrerPolicy="no-referrer"
                            style={{ 
                                width: '64px', 
                                height: '64px', 
                                borderRadius: '50%', 
                                objectFit: 'contain', 
                                background: 'white', 
                                padding: '8px', 
                                boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                                border: `2px solid ${offer.color || '#334155'}`
                            }}
                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                        />
                        <span style={{ fontWeight: 800, color: offer.color || '#94a3b8', fontSize: '1rem' }}>{offer.source} Sale</span>
                    </div>
                )}
                {/* Gradient bottom overlay */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent)',
                    pointerEvents: 'none'
                }} />
            </div>

            {/* Card Info */}
            <div style={{ padding: '1.25rem', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                    <img
                        src={offer.logo}
                        alt={offer.source}
                        referrerPolicy="no-referrer"
                        style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'contain', background: 'white', padding: '2px' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span style={{ fontWeight: 700, color: offer.color || 'white', fontSize: '0.85rem' }}>{offer.source}</span>
                </div>
                <h3 style={{
                    fontSize: '1rem', margin: '0 0 0.4rem 0', lineHeight: '1.4', color: 'var(--text)',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                }}>{offer.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{offer.description}</p>
            </div>
        </div>
    );
}

export default function OfferFeed() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const res = await fetch(`${getApiUrl()}/offers`);
                const data = await res.json();
                if (data.success) {
                    console.log("[OfferFeed] Loaded offers:", data.data.length, data.data);
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

    // Auto-scroll carousel
    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
                }
            }
        }, 3500);
        return () => clearInterval(interval);
    }, [offers]);

    const scroll = (direction) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' });
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
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
            borderRadius: '1.25rem',
            padding: '1.5rem',
            marginBottom: '3rem',
            marginTop: '2rem',
            position: 'relative'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>
                    <span>📢</span> Live Offer News
                    <span style={{ fontSize: '0.7rem', background: 'linear-gradient(135deg,#ef4444,#ec4899)', color: 'white', padding: '0.2rem 0.65rem', borderRadius: '2rem', fontWeight: 700, letterSpacing: '0.05em', boxShadow: '0 0 10px rgba(236,72,153,0.35)' }}>LIVE</span>
                </h2>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => scroll('left')} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-subtle)', padding: '0.45rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                        <ChevronLeft size={18} />
                    </button>
                    <button onClick={() => scroll('right')} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-subtle)', padding: '0.45rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Carousel */}
            <div
                ref={scrollRef}
                style={{
                    display: 'flex',
                    gap: '1.5rem',
                    overflowX: 'auto',
                    scrollSnapType: 'x mandatory',
                    paddingBottom: '1rem',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}
                className="hide-scrollbar"
            >
                {offers.map((offer, index) => (
                    <OfferCard key={index} offer={offer} />
                ))}
            </div>

            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
