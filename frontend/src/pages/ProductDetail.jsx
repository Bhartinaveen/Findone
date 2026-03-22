import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductDetails, getApiUrl } from '../api';
import PriceChart from '../components/PriceChart';
import { ArrowLeft, Heart, ShoppingBag, Star, Tag, Percent, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [sortBy, setSortBy] = useState('price'); // For Compare Section
    const [recSort, setRecSort] = useState('smart'); // For Recommendations Section

    // Wishlist State
    const [showModal, setShowModal] = useState(false);
    const [targetPrice, setTargetPrice] = useState('');
    const [wishing, setWishing] = useState(false);
    const [sentiment, setSentiment] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [ratings, setRatings] = useState(null);
    const [fetchingRatings, setFetchingRatings] = useState(false);
    const [hasNoRatings, setHasNoRatings] = useState(false);

    const handleFetchRatings = async () => {
        if (!data || !data.product || !data.product.product_url) return;
        
        setFetchingRatings(true);
        try {
            const res = await fetch(`${getApiUrl()}/analyze/ratings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    product_url: data.product.product_url,
                    rating: data.product.rating 
                })
            });
            const result = await res.json();
            if (result && result["5"] !== undefined) {
                // Only accept if at least one star bucket has a non-zero percentage
                const totalPct = [5,4,3,2,1].reduce((sum, s) => sum + (result[s]?.percentage || 0), 0);
                if (totalPct > 0) {
                    setRatings(result);
                    setHasNoRatings(false);
                } else {
                    // All zeros → show "no customer ratings" msg
                    setHasNoRatings(true);
                    console.warn("Rating returned all zeros — indicating no customer ratings.");
                }
            } else {
                setHasNoRatings(true);
            }
        } catch (e) {
            console.error("Rating distribution error:", e);
            setHasNoRatings(true);
        } finally {
            setFetchingRatings(false);
        }
    };

    useEffect(() => {
        console.log("Fetching details for:", id);
        getProductDetails(id).then(res => {
            console.log("Received details:", res);
            setData(res);
        }).catch(err => console.error("Detail fetch error:", err));
    }, [id]);

    if (!data) return <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><div className="spin"></div></div>;

    const { product, history, similar, recommendations } = data;

    // Find best price to highlight
    const allPrices = [product, ...(similar || [])];
    const bestDeal = allPrices.sort((a, b) => a.price - b.price)[0];

    // Sorting Logic for Comparison
    // Sorting Logic for Comparison

    const sortedSimilar = [...(similar || [])].sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0); // High to Low
        return 0;
    });

    return (
        <div className="container" style={{ paddingTop: '2.5rem' }}>
            {/* Navigation Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.6rem', 
                        padding: '0.65rem 1.4rem', 
                        borderRadius: '2rem',
                        background: 'rgba(99,102,241,0.08)',
                        border: '1px solid rgba(99,102,241,0.18)',
                        color: 'var(--primary)',
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        boxShadow: '0 2px 12px rgba(99,102,241,0.06)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(-5px)';
                        e.currentTarget.style.background = 'rgba(99,102,241,0.12)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
                        e.currentTarget.style.boxShadow = '0 2px 12px rgba(99,102,241,0.06)';
                    }}
                >
                    <ArrowLeft size={18} strokeWidth={2.5} />
                    <span>Back to Catalog</span>
                </button>
            </div>

            <div className="detail-hero" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '4rem',
                alignItems: 'start',
                marginBottom: '5rem'
            }}>
                {/* Left: Product Image Showcase */}
                <div className="interactive-image-showcase" style={{
                    position: 'relative',
                    aspectRatio: '1',
                    background: 'var(--bg-card)',
                    borderRadius: '2.5rem',
                    padding: '1.5rem',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-lg)'
                }}>
                    <div className="image-window" style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(145deg, #f8faff 0%, #eef1f8 100%)',
                        borderRadius: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.04)'
                    }}>
                        <img
                            src={product.image_url || 'https://placehold.co/600/f8faff/111827?text=?'}
                            alt={product.title}
                            style={{
                                width: '85%',
                                height: '85%',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.18))',
                                borderRadius: '1.5rem'
                            }}
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600/f8faff/111827?text=?'; }}
                        />
                        {/* Source Mini-Badge */}
                        <div style={{
                            position: 'absolute',
                            bottom: '1.5rem',
                            right: '1.5rem',
                            background: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '2rem',
                            boxShadow: 'var(--shadow-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: '#1e293b'
                        }}>
                             <ShoppingBag size={14} color="#6366f1" />
                             {product.source || 'Verified'}
                        </div>
                    </div>
                </div>

                {/* Right: Product Details & Actions */}
                <div className="detail-content">
                    {/* Breadcrumbs/Meta */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                         <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {product.category || 'Premium Collection'}
                         </span>
                         <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border)' }}></div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#fbbf24' }}>
                            <Star size={14} fill="#fbbf24" />
                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                {product.rating && product.rating > 0 ? product.rating : '4.5'}
                            </span>
                         </div>
                    </div>

                    <h1 style={{
                        fontSize: '2.8rem',
                        fontWeight: 800,
                        lineHeight: 1.1,
                        marginBottom: '1.5rem',
                        color: 'var(--text)',
                        letterSpacing: '-0.03em'
                    }}>
                        {product.title}
                    </h1>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '2.5rem' }}>
                        <span style={{
                            fontSize: '3.2rem',
                            fontWeight: 900,
                            background: 'var(--grad-primary)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.04em'
                        }}>
                            ₹{product.price}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem', textDecoration: 'line-through' }}>
                            ₹{Math.round(product.price * 1.2)}
                        </span>
                        <div style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', padding: '0.3rem 0.8rem', borderRadius: '2rem', fontWeight: 800, fontSize: '0.85rem' }}>
                            -20% OFF
                        </div>
                    </div>

                    {/* Deal Alert if applicable */}
                    {bestDeal.id !== product.id && (
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '1.5rem',
                            padding: '1.25rem 1.5rem',
                            marginBottom: '2.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ color: '#fca5a5', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Tag size={16} /> Better Price Available!
                                </div>
                                <div style={{ color: 'var(--text)', fontSize: '1rem' }}>
                                    Save on {bestDeal.source} for only <b style={{ color: '#4ade80' }}>₹{bestDeal.price}</b>
                                </div>
                            </div>
                            <button
                                onClick={() => window.open(bestDeal.product_url, '_blank')}
                                className="btn-primary"
                                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                            >
                                Get Deal ↗
                            </button>
                        </div>
                    )}

                    <div style={{
                        padding: '1.5rem',
                        background: 'var(--bg-card)',
                        borderRadius: '1.5rem',
                        border: '1px solid var(--border)',
                        marginBottom: '2.5rem'
                    }}>
                        <p style={{
                            color: 'var(--text-subtle)',
                            fontSize: '1.05rem',
                            lineHeight: 1.6,
                            margin: 0
                        }}>
                            {product.description || 'Discover premium quality and exceptional value with this handpicked selection. Perfect for your daily needs with guaranteed durability and style.'}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '2.5rem' }}>
                        <button
                            className="btn-primary"
                            onClick={() => window.open(product.product_url, '_blank')}
                            style={{ flex: 3, padding: '1.25rem', fontSize: '1.1rem', gap: '0.75rem' }}
                        >
                            <ShoppingBag size={20} />
                            {product.source ? `Buy on ${product.source}` : 'Buy Now'}
                        </button>

                        <button
                            className="btn-ghost"
                            onClick={() => setShowModal(true)}
                            style={{
                                flex: 1,
                                padding: '1.25rem',
                                border: '1.5px solid var(--border)',
                                color: wishing ? '#f43f5e' : 'var(--text)',
                                background: wishing ? 'rgba(244, 63, 94, 0.1)' : 'var(--bg-elevated)',
                                display: 'flex',
                                justifyContent: 'center'
                            }}
                        >
                            <Heart
                                size={22}
                                color={wishing ? '#f43f5e' : 'currentColor'}
                                fill={wishing ? '#f43f5e' : 'none'}
                                className={wishing ? 'heart-beat' : ''}
                            />
                        </button>
                    </div>

                    {/* Features/Trust Badges */}
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            <ShieldCheck size={16} color="#4ade80" />
                            Secure Checkout
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            <Percent size={16} color="#6366f1" />
                            Best Price Guaranteed
                        </div>
                    </div>
                </div>
            </div>

            {/* Price Alert Modal */}
            {showModal && createPortal(
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999999 }}>
                    <div style={{ background: 'var(--bg-elevated)', padding: '2rem', borderRadius: '1.5rem', width: '350px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid var(--border)' }}>
                        <h3 style={{ marginTop: 0, color: 'var(--text)' }}>Set Price Alert</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>We'll notify you when the price drops.</p>

                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text)' }}>Target Price (₹)</label>
                        <input
                            type="number"
                            placeholder={`Current: ₹${product.price}`}
                            value={targetPrice}
                            onChange={(e) => setTargetPrice(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '1rem', outline: 'none' }}
                        />

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={async () => {
                                    if (!user) { alert('Please login first'); navigate('/login'); return; }
                                    try {
                                        const res = await fetch(`${getApiUrl()}/wishlist/add`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                                            body: JSON.stringify({ product_id: product.id, desired_max_price: targetPrice || product.price })
                                        });

                                        const data = await res.json();

                                        if (res.ok) {
                                            alert('Added to Wishlist!');
                                            setShowModal(false);
                                            setWishing(true);
                                        } else {
                                            if (res.status === 401) {
                                                alert("Please login again.");
                                                navigate('/login');
                                            } else if (data.error === "Item already in wishlist") {
                                                alert("This item is already in your wishlist!");
                                                setWishing(true);
                                                setShowModal(false);
                                            } else {
                                                alert(data.error || 'Failed to add');
                                                setWishing(false);
                                            }
                                        }
                                    } catch (e) {
                                        console.error(e);
                                        alert('Error adding to wishlist: ' + e.message);
                                        setWishing(false);
                                    }
                                }}
                                className="btn-primary"
                                style={{ flex: 1, padding: '0.8rem', justifyContent: 'center' }}
                            >
                                Save Alert
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.8rem', borderRadius: '0.65rem', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}


            {/* Analytics Section */}
            <div className="analytics-section" style={{ marginTop: '5rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                {/* Price History Card */}
                <div className="glass-panel" style={{ 
                    padding: '2.5rem', 
                    borderRadius: '2.5rem', 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                     <PriceChart history={history} currentPrice={product.price} />
                </div>

                {/* Sentiment Analysis Card */}
                <div className="glass-panel" style={{
                    padding: '2rem',
                    borderRadius: '2rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>Customer Ratings</h3>
                        {fetchingRatings && <div className="spin-small" style={{ width: '14px', height: '14px' }}></div>}
                    </div>
                    
                    {!ratings && !fetchingRatings && !hasNoRatings && (
                        <div style={{ marginBottom: '2rem' }}>
                            <button 
                                onClick={handleFetchRatings}
                                className="btn-primary"
                                style={{ 
                                    width: '100%', 
                                    padding: '1rem', 
                                    borderRadius: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    fontSize: '1rem',
                                    fontWeight: 700
                                }}
                            >
                                <Star size={18} fill="currentColor" />
                                Fetch Real-Time Ratings
                            </button>
                        </div>
                    )}
                    {/* Rating Distribution Graph */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {hasNoRatings ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⭐</div>
                                <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>This product has no customer ratings</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Percentage of customer ratings across segments</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', flex: 1 }}>
                                    {[5, 4, 3, 2, 1].map(star => {
                                        const data = ratings ? (ratings[star] || { count: 0, percentage: 0 }) : { count: 0, percentage: 0 };
                                        const percent = data.percentage || 0;
                                        const count = data.count || 0;
                                        return (
                                            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                                <div style={{ width: '50px', fontSize: '0.9rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                                                    {star} <Star size={12} fill="#fbbf24" color="#fbbf24" strokeWidth={0} />
                                                </div>
                                                <div style={{ flex: 1, height: '10px', background: 'rgba(128, 128, 128, 0.2)', borderRadius: '5px', overflow: 'hidden' }}>
                                                    <div style={{ 
                                                        width: `${percent}%`, 
                                                        height: '100%', 
                                                        background: star >= 4 ? 'linear-gradient(90deg, #10b981, #34d399)' : star === 3 ? '#fbbf24' : '#f43f5e',
                                                        borderRadius: '5px',
                                                        transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                                                    }}></div>
                                                </div>
                                                <div style={{ width: '100px', fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                    <span style={{ fontWeight: 800 }}>{percent}%</span>
                                                    {count > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({count})</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                        {(!ratings && !fetchingRatings && !hasNoRatings) && (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
                                <p>Rating data temporarily unavailable for this source.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recommendations Section */}
            {recommendations && recommendations.length > 0 && (
                <div className="recommendations-section" style={{ marginTop: '5rem', paddingBottom: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                        <div>
                            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>Best Alternatives</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.4rem' }}>AI-powered recommendations based on value and reviews</p>
                        </div>
                        <select
                            value={recSort}
                            onChange={(e) => setRecSort(e.target.value)}
                            className="filter-select"
                            style={{ padding: '0.8rem 1.2rem', borderRadius: '1rem' }}
                        >
                            <option value="smart">Smart Sort (Best Value)</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                            <option value="rating">Rating: High to Low</option>
                        </select>
                    </div>

                    <div className="product-grid">
                        {[...recommendations]
                            .sort((a, b) => {
                                const priceA = Number(a.price) || 0;
                                const priceB = Number(b.price) || 0;
                                const ratingA = Number(a.rating) || 0;
                                const ratingB = Number(b.rating) || 0;
                                if (recSort === 'price_low') return priceA - priceB;
                                if (recSort === 'price_high') return priceB - priceA;
                                if (recSort === 'rating') return ratingB - ratingA;
                                const scoreA = ratingA * 100 - (priceA / 100);
                                const scoreB = ratingB * 100 - (priceB / 100);
                                return scoreB - scoreA;
                            })
                            .map((p, index) => (
                                <div key={p.id} className="product-card" onClick={() => window.location.href = `/product/${p.id}`}>
                                    <div className="product-card-inner">
                                        {/* Front Face */}
                                        <div className="product-card-front">
                                            {index === 0 && recSort === 'smart' && (
                                                <div className="smart-badge" style={{
                                                    position: 'absolute', top: '15px', right: '15px',
                                                    background: 'var(--grad-primary)', padding: '4px 12px',
                                                    borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 900,
                                                    color: 'white', zIndex: 10, boxShadow: '0 4px 12px rgba(99,102,241,0.4)'
                                                }}>TOP VALUE</div>
                                            )}
                                            <div className="product-image-wrap">
                                                <img
                                                    src={p.image_url || 'https://placehold.co/300/f8faff/111827?text=?'}
                                                    alt={p.title}
                                                    className="product-image"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300/f8faff/111827?text=?'; }}
                                                />
                                            </div>
                                            <div className="product-image-divider"></div>
                                            <div className="product-info-minimal">
                                                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title}</h3>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                                                    <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>₹{p.price}</span>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.source || 'Verified'}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    {p.rating && Number(p.rating) > 0 ? (
                                                        <>
                                                            <Star size={12} fill="#fbbf24" color="#fbbf24" strokeWidth={0} />
                                                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fbbf24' }}>{Number(p.rating).toFixed(1)}</span>
                                                        </>
                                                    ) : (
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No rating</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Back Face */}
                                        <div className="product-card-back">
                                            <div className="back-content">
                                                <img src={p.image_url} alt="" className="product-back-image" />
                                                <div className="back-price-tag">₹{p.price}</div>
                                                <h4 className="back-title-text">{p.title}</h4>
                                                <button className="product-view-btn">
                                                    View Now <ArrowLeft size={16} />
                                                </button>
                                                <div className="back-source-label">found on {p.source || 'Web'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}
