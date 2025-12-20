import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
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
            const res = await fetch('http://localhost:5000/api/wishlist', {
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
            await fetch(`http://localhost:5000/api/wishlist/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setItems(items.filter(item => item.id !== id));
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    if (!user) return <div style={{ color: 'white', textAlign: 'center', marginTop: '3rem' }}>Please Login to view wishlist</div>;

    return (
        <div className="container">
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowLeft /> Back to Search
            </button>
            <h1 style={{ marginBottom: '2rem' }}>My Wishlist & Alerts</h1>

            {loading ? <div className="spin"></div> : (
                items.length === 0 ? <p style={{ color: '#94a3b8' }}>Your wishlist is empty.</p> : (
                    <div className="product-grid">
                        {items.map(({ id, product, desired_max_price }) => (
                            <div key={id} className="product-card" style={{ position: 'relative' }}>
                                <button
                                    onClick={() => removeFromWishlist(id)}
                                    style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.5)', color: '#f87171', border: 'none', padding: '5px', borderRadius: '50%', cursor: 'pointer' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                                <img
                                    src={product.image_url || 'https://placehold.co/300?text=No+Image'}
                                    alt={product.title}
                                    className="product-image"
                                />
                                <div className="product-info">
                                    <h3 className="product-title">{product.title}</h3>
                                    <div className="product-meta">
                                        <div className="product-price">₹{product.price}</div>
                                        {desired_max_price && (
                                            <div style={{ fontSize: '0.8rem', color: '#fbbf24' }}>
                                                Alert below: ₹{desired_max_price}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => window.location.href = `/product/${product.id}`}
                                        style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem', background: '#334155', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        View
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
