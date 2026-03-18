import React, { useEffect, useState, useMemo } from 'react';
import { getProducts, triggerScrape, clearProducts } from '../api';
import { useNavigate } from 'react-router-dom';
import { Search, RotateCw, RotateCcw } from 'lucide-react';
import OfferFeed from '../components/OfferFeed';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isScraping, setIsScraping] = useState(false);
    const navigate = useNavigate();

    const handleUpdate = (e) => {
        console.log("Home received product update", e.detail);
        if (e.detail) {
            setProducts(prev => {
                const combined = [...e.detail, ...prev];
                const unique = Array.from(new Map(combined.map(item => [item.title, item])).values());
                return unique;
            });
        } else {
            loadProducts();
        }
    };

    useEffect(() => {
        loadProducts();

        const handleScrapeStart = () => setIsScraping(true);
        const handleScrapeEnd = () => setIsScraping(false);

        window.addEventListener('product-update', handleUpdate);
        window.addEventListener('chat-scrape-start', handleScrapeStart);
        window.addEventListener('chat-scrape-end', handleScrapeEnd);
        
        return () => {
            window.removeEventListener('product-update', handleUpdate);
            window.removeEventListener('chat-scrape-start', handleScrapeStart);
            window.removeEventListener('chat-scrape-end', handleScrapeEnd);
        };
    }, []);

    const loadProducts = () => {
        getProducts().then(setProducts);
    };

    const handleReset = async () => {
        if (window.confirm("Are you sure you want to clear ALL scraped data? This cannot be undone.")) {
            // 1. Clear Backend
            await clearProducts();

            // 2. Clear Frontend State
            setProducts([]);
            setSearchTerm('');
            setMinPrice('');
            setMaxPrice('');
            setSortBy('relevance');
        }
    };

    const performSearch = () => {
        if (products.length === 0 && searchTerm.trim()) {
            alert("Please scrape data first.");
            return;
        }
        // Filtering is handled automatically by useMemo based on searchTerm state
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    };

    const handleScrape = async (baseQuery) => {
        setIsScraping(true);

        // Intelligent Query: Append price context if filter is active
        let query = baseQuery;
        if (maxPrice && !baseQuery.toLowerCase().includes('under')) {
            query += ` under ${maxPrice}`;
        }

        const data = await triggerScrape(query);

        if (data && (data.data || data.products)) {
            // Merge new products with existing ones immediately
            const newProducts = data.data || data.products || [];
            console.log("Scraped products:", newProducts);
            setProducts(prev => {
                // simple dedup by id or title
                const combined = [...newProducts, ...prev];
                const unique = Array.from(new Map(combined.map(item => [item.title, item])).values());
                return unique;
            });
            // Removed alert for direct view
        } else {
            console.log("Scrape finished, no new data.");
        }

        loadProducts(); // Sync with DB in background
        setIsScraping(false);
    };

    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('relevance'); // price-low, price-high, rating

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // 1. Search Filter
            const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));

            // 2. Price Range Filter
            const price = parseFloat(product.price) || 0;
            const matchesMin = minPrice ? price >= parseFloat(minPrice) : true;
            const matchesMax = maxPrice ? price <= parseFloat(maxPrice) : true;

            return matchesSearch && matchesMin && matchesMax;
        }).sort((a, b) => {
            if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
            if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
            if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
            return 0; // relevance
        });
    }, [products, searchTerm, minPrice, maxPrice, sortBy]);

    return (
        <div className="container">
            <header className="header" style={{ justifyContent: 'flex-end' }}>
                <button
                    onClick={() => handleScrape(searchTerm || 'best deals')}
                    disabled={isScraping}
                    className="btn-primary"
                >
                    <RotateCw size={15} className={isScraping ? 'spin' : ''} />
                    {isScraping ? 'Scraping...' : 'Scrape New Data'}
                </button>
            </header>

            {/* Hero & Search Section */}
            <div className="hero-section">
                <h1 className="hero-title">Discover Real Deals</h1>
                <p className="hero-subtitle">Search for products, compare prices, and find the best offers — powered by AI.</p>

                <div className="search-container">
                    <input
                        type="text"
                        className="hero-search-input"
                        placeholder="Search for 'running shoes' or 'office chair'..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                    <Search
                        size={20}
                        onClick={performSearch}
                        style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    />
                </div>

                {/* ADVANCED FILTER BAR */}
                <div className="filter-bar">
                    <input
                        type="number"
                        placeholder="Min Price (₹)"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="filter-input"
                    />
                    <input
                        type="number"
                        placeholder="Max Price (₹)"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="filter-input"
                    />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="filter-select"
                    >
                        <option value="relevance">Relevance</option>
                        <option value="price-low">Price: Low → High</option>
                        <option value="price-high">Price: High → Low</option>
                        <option value="rating">Rating: Best First</option>
                    </select>
                    <button
                        onClick={() => {
                            if (products.length === 0) {
                                alert("No data found! Please use 'Scrape New Data' button first to load products.");
                                return;
                            }
                            // Filters are applied automatically via useMemo — nothing more to do
                            // This is just a visual confirmation trigger
                        }}
                        className="btn-warning"
                    >
                        <Search size={15} />
                        Find Deals
                    </button>
                    <button
                        onClick={handleReset}
                        className="btn-secondary"
                        title="Reset Search & Filters"
                    >
                        <RotateCcw size={15} />
                        Reset
                    </button>
                </div>
            </div>

            {/* Live Offer Feed */}
            <OfferFeed />

            {/* Product Grid */}
            <div className="product-grid" style={{ position: 'relative', minHeight: '300px' }}>
                {isScraping && (
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(10, 11, 26, 0.7)',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '2rem',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <div className="spin" style={{ width: '40px', height: '40px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', marginBottom: '1rem' }}></div>
                        <p style={{ fontWeight: 600, color: 'var(--text)' }}>Scraping Fresh Data...</p>
                    </div>
                )}
                
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                        <div
                            key={product.id}
                            className="product-card"
                            onClick={() => navigate(`/product/${product.id}`, { state: { product } })}
                        >
                            <div className="product-card-inner">

                                {/* ── FRONT FACE ── */}
                                <div className="product-card-front">
                                    <div className="product-image-wrap">
                                        <img
                                            src={product.image_url || 'https://placehold.co/300/111827/818cf8?text=?'}
                                            alt={product.title}
                                            className="product-image"
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300/111827/818cf8?text=?'; }}
                                        />
                                    </div>
                                    <div className="product-info">
                                        <h3 className="product-title">{product.title}</h3>
                                        <div className="product-meta">
                                            <div className="product-price">₹{product.price}</div>
                                            <div className="product-category">{product.category}</div>
                                        </div>
                                        {product.source && (
                                            <div
                                                className="product-source"
                                                onClick={(e) => { e.stopPropagation(); window.open(product.product_url, '_blank'); }}
                                            >
                                                Via {product.source} ↗
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ── BACK FACE ── */}
                                <div className="product-card-back">
                                    <img
                                        src={product.image_url || 'https://placehold.co/80/111827/818cf8?text=?'}
                                        alt={product.title}
                                        className="product-back-image"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/80/111827/818cf8?text=?'; }}
                                    />
                                    <div className="product-back-title">{product.title}</div>
                                    <div className="product-back-price">₹{product.price}</div>
                                    <button
                                        className="product-view-btn"
                                        onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`, { state: { product } }); }}
                                    >
                                        ✦ View Now
                                    </button>
                                    {product.source && (
                                        <div className="product-back-source">via {product.source}</div>
                                    )}
                                </div>

                            </div>
                        </div>
                    ))
                ) : (
                    !isScraping && (
                        <div className="empty-state" style={{ width: '100%', gridColumn: '1 / -1' }}>
                            <Search size={48} strokeWidth={1} />
                            <h3>No products found</h3>
                            <p>Try adjusting your search or filters, or scrape new data.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
