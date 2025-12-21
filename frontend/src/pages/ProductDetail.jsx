import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductDetails } from '../api';
import PriceChart from '../components/PriceChart';
import { ArrowLeft, Heart } from 'lucide-react';
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
        <div className="container">
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowLeft /> Back
            </button>

            <div className="detail-container">
                <img
                    src={product.image_url || 'https://placehold.co/400?text=No+Image'}
                    alt={product.title}
                    className="detail-image"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400?text=No+Image'; }}
                />
                <div className="detail-info">
                    <h1>{product.title}</h1>
                    <div className="detail-price" style={{ fontSize: '2.5rem', color: '#4ade80' }}>
                        ₹{product.price}
                    </div>

                    {/* Rating Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <span style={{ background: '#fbbf24', color: 'black', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
                            ★ {product.rating && product.rating > 0 ? product.rating : 'New'}
                        </span>
                        <span style={{ color: '#94a3b8' }}>({product.rating_count || 0} reviews)</span>
                    </div>

                    {bestDeal.id !== product.id && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                            <div>
                                <strong style={{ display: 'block', marginBottom: '0.2rem' }}>Better Deal Found!</strong>
                                <span>Save money on {bestDeal.source}: <b>₹{bestDeal.price}</b></span>
                            </div>
                            <button
                                onClick={() => window.open(bestDeal.product_url, '_blank')}
                                style={{
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.3rem',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    transition: 'background 0.2s',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Buy on {bestDeal.source}
                            </button>
                        </div>
                    )}

                    <p className="detail-desc">{product.description}</p>

                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => window.open(product.product_url, '_blank')}
                            style={{ flex: 2, padding: '1rem', fontSize: '1.2rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            {product.source ? `Buy on ${product.source}` : 'Buy Now'}
                        </button>

                        <button
                            onClick={() => setShowModal(true)}
                            style={{ flex: 1, background: '#334155', border: '1px solid #475569', color: 'white', padding: '0.8rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Heart size={24} color={wishing ? '#f43f5e' : 'white'} fill={wishing ? '#f43f5e' : 'none'} />
                            <span style={{ fontWeight: '500' }}>{wishing ? 'Added' : 'Wishlist'}</span>
                        </button>
                    </div>

                    {/* Price Alert Modal */}
                    {showModal && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                            <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '1rem', width: '350px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                                <h3 style={{ marginTop: 0 }}>Set Price Alert</h3>
                                <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>We'll notify you when the price drops.</p>

                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Target Price (₹)</label>
                                <input
                                    type="number"
                                    placeholder={`Current: ₹${product.price}`}
                                    value={targetPrice}
                                    onChange={(e) => setTargetPrice(e.target.value)}
                                    style={{ width: '100%', padding: '0.8rem', background: '#334155', border: '1px solid #475569', color: 'white', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '1rem' }}
                                />

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={async () => {
                                            if (!user) { alert('Please login first'); navigate('/login'); return; }
                                            setWishing(true);
                                            try {
                                                const res = await fetch('https://findone-puce.vercel.app/api/wishlist/add', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                                                    body: JSON.stringify({ product_id: product.id, desired_max_price: targetPrice || product.price })
                                                });
                                                if (res.ok) alert('Added to Wishlist!');
                                                else alert('Failed to add (maybe already exists?)');
                                                setShowModal(false);
                                            } catch (e) { alert('Error adding to wishlist'); }
                                            setWishing(false);
                                        }}
                                        style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Save Alert
                                    </button>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        style={{ flex: 1, background: 'none', border: '1px solid #475569', color: 'white', padding: '0.8rem', borderRadius: '0.5rem', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Analytics Section */}
            <div className="chart-section" style={{ marginTop: '3rem', background: '#1e293b', padding: '2rem', borderRadius: '1rem' }}>
                <PriceChart history={history} />

                {/* AI Price Insight */}
                {history.length > 0 && (() => {
                    const prices = history.map(h => Number(h.price));
                    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    const currentPrice = Number(product.price);

                    let insight = "";
                    let color = "#fbbf24"; // yellow (neutral)

                    if (currentPrice <= minPrice) {
                        insight = "🔥 Best Time to Buy! Price is at an all-time low.";
                        color = "#4ade80"; // green
                    } else if (currentPrice < avgPrice) {
                        insight = "✅ Good Deal! Price is lower than usage average.";
                        color = "#4ade80";
                    } else if (currentPrice > avgPrice * 1.1) {
                        insight = "⚠️ Price is high right now. Consider waiting.";
                        color = "#f87171"; // red
                    } else {
                        insight = "⚖️ Price is stable. Fair value.";
                    }

                    return (
                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', borderLeft: `4px solid ${color}` }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'white' }}>AI Price Insight</h3>
                            <p style={{ fontSize: '1.1rem', color: color, fontWeight: 'bold' }}>{insight}</p>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                Average: ₹{Math.round(avgPrice)} | Lowest: ₹{minPrice} | Highest: ₹{maxPrice}
                            </p>
                        </div>
                    );
                })()}

                {/* Sentiment Pie Chart */}
                <div style={{ marginTop: '3rem', padding: '2rem', background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0 }}>Buyer Sentiment Decision Aid</h3>
                        {sentiment && (
                            <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.8rem', borderRadius: '20px', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.05)' }}>
                                Source: {product.source || 'Verified Purchase'}
                            </span>
                        )}
                    </div>

                    {!sentiment ? (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                            <p style={{ color: '#cbd5e1', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                                unsure about this product? Let our AI analyze real customer reviews for you.
                            </p>
                            <button
                                onClick={async () => {
                                    setAnalyzing(true);
                                    try {
                                        const res = await fetch('https://findone-puce.vercel.app/api/analyze/reviews', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ product_id: product.id, product_url: product.product_url })
                                        });
                                        const data = await res.json();
                                        setSentiment(data);
                                    } catch (e) { console.error(e); }
                                    setAnalyzing(false);
                                }}
                                disabled={analyzing}
                                style={{
                                    background: analyzing ? '#475569' : 'linear-gradient(to right, #3b82f6, #2563eb)',
                                    color: 'white',
                                    padding: '1rem 2rem',
                                    borderRadius: '3rem',
                                    border: 'none',
                                    cursor: analyzing ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem',
                                    boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)',
                                    transition: 'transform 0.2s',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {analyzing ? (
                                    <>
                                        <span className="spin" style={{ display: 'inline-block', width: '1rem', height: '1rem', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></span>
                                        Analyzing Real Reviews...
                                    </>
                                ) : (
                                    'Analyze Real Reviews'
                                )}
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ height: '300px', minWidth: '300px', flex: 1, position: 'relative' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Positive', value: sentiment.positive },
                                                { name: 'Negative', value: sentiment.negative }
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            <Cell fill="#4ade80" />
                                            <Cell fill="#f87171" />
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            itemStyle={{ color: 'white' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>{sentiment.positive}%</div>
                                    <div style={{ fontSize: '0.9rem', color: '#4ade80' }}>Positive</div>
                                </div>
                            </div>

                            <div style={{ flex: 1, minWidth: '300px', padding: '1rem' }}>
                                <h4 style={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem', marginBottom: '1rem' }}>AI Verdict</h4>
                                <p style={{ color: '#f1f5f9', fontSize: '1.2rem', lineHeight: '1.6', fontWeight: '500' }}>
                                    "{sentiment.summary}"
                                </p>
                                <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                                    <div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Analyzed Reviews</div>
                                        <div style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>{sentiment.review_count}+</div>
                                    </div>
                                    <div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Confidence</div>
                                        <div style={{ color: '#fbbf24', fontSize: '1.2rem', fontWeight: 'bold' }}>High</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Recommendations Section */}
            {recommendations && recommendations.length > 0 && (
                <div className="recommendations-section" style={{ marginTop: '3rem', borderTop: '1px solid #334155', paddingTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                            <h2>Best Alternatives</h2>
                            <p style={{ color: '#94a3b8' }}>Top picks based on Price & Review</p>
                        </div>
                        <select
                            value={recSort}
                            onChange={(e) => setRecSort(e.target.value)}
                            style={{ background: '#334155', color: 'white', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #475569' }}
                        >
                            <option value="smart">Smart Sort (Best Value)</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                            <option value="rating">Rating: High to Low</option>
                        </select>
                    </div>

                    <div className="product-grid">
                        {recommendations
                            .sort((a, b) => {
                                if (recSort === 'price_low') return a.price - b.price;
                                if (recSort === 'price_high') return b.price - a.price;
                                if (recSort === 'rating') return (b.rating || 0) - (a.rating || 0);
                                // Smart Sort: High Rating - Low Price
                                const scoreA = (a.rating || 0) * 100 - (a.price / 100);
                                const scoreB = (b.rating || 0) * 100 - (b.price / 100);
                                return scoreB - scoreA;
                            })
                            .map((product, index) => (
                                <div key={product.id} className="product-card" onClick={() => window.location.href = `/product/${product.id}`} style={{ position: 'relative' }}>
                                    {index === 0 && recSort === 'smart' && <span style={{ position: 'absolute', top: 5, right: 5, background: '#f43f5e', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', zIndex: 10 }}>Top Value</span>}
                                    <img
                                        src={product.image_url || 'https://placehold.co/300?text=No+Image'}
                                        alt={product.title}
                                        className="product-image"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300?text=No+Image'; }}
                                    />
                                    <div className="product-info">
                                        <h3 className="product-title" style={{ marginBottom: '0.5rem' }}>{product.title}</h3>
                                        <div className="product-meta" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                            <div className="product-price" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>₹{product.price}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', alignItems: 'center' }}>
                                                <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>
                                                    {product.rating > 0 ? `★ ${product.rating}` : 'No Reviews'}
                                                </span>
                                                <span style={{ color: '#60a5fa', fontWeight: 'bold', background: 'rgba(96, 165, 250, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                                    {product.source || 'Web'}
                                                </span>
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
