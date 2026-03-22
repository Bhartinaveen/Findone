import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../api';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Wishlist() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchWishlist();
    }, [user]);

    const fetchWishlist = async () => {
        try {
            const res = await fetch(`${getApiUrl()}/wishlist`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (res.ok) setItems(data);
        } catch (err) {
            console.error("Wishlist fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (id) => {
        try {
            await fetch(`${getApiUrl()}/wishlist/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setItems(items.filter(item => item.id !== id));
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    if (!user) return <div style={{ color: 'var(--text)', textAlign: 'center', marginTop: '3rem' }}>Please Login to view wishlist</div>;

    return (
        <div className="container">
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowLeft /> Back to Search
            </button>
            <h1 style={{ marginBottom: '2rem' }}>My Wishlist & Alerts</h1>

            {loading ? <div className="spin"></div> : (
                items.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Your wishlist is empty.</p> : (
                    <div className="product-grid">
                        {items.map(({ id, product, desired_max_price }) => (
                            <div key={id} className="product-card" style={{ cursor: 'pointer' }}>
                                <div className="product-card-front" style={{ position: 'relative', height: '100%', flexDirection: 'column', display: 'flex' }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeFromWishlist(id); }}
                                        style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.9)', color: '#f43f5e', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', transition: 'all 0.2s' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = '#ffe4e6'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; }}
                                        title="Remove from Wishlist"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="product-image-wrap" onClick={() => navigate(`/product/${product.id}`)}>
                                        <img
                                            src={product.image_url || 'https://placehold.co/300/f8faff/111827?text=?'}
                                            alt={product.title}
                                            className="product-image"
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300/f8faff/111827?text=?'; }}
                                        />
                                    </div>
                                    <div className="product-info-minimal" onClick={() => navigate(`/product/${product.id}`)} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.title}</h3>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--primary)' }}>₹{product.price}</span>
                                            {desired_max_price && (
                                                <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700, border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.2rem 0.6rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '1rem' }}>
                                                    Below ₹{desired_max_price}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
