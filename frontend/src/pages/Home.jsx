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

    useEffect(() => {
        loadProducts();

        const handleUpdate = (e) => {
            console.log("Home received product update", e.detail);
            // Ideally merge or just reload. Merging is smoother.
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

        window.addEventListener('product-update', handleUpdate);
        return () => window.removeEventListener('product-update', handleUpdate);
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

    const performSearch = async () => {
        if (!searchTerm.trim()) return;

        // Smart Check: Do we have enough local data?
        const localResults = products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

        if (localResults.length < 5) {
            await handleScrape(searchTerm);
        } else {
            console.log("Using local results.");
        }
    };

    const handleSearch = async (e) => {
        if (e.key === 'Enter') {
            await performSearch();
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
                product.description.toLowerCase().includes(searchTerm.toLowerCase());

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
            <header className="header">
                {/* <h1 className="title">FindNow</h1> */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => handleScrape(searchTerm || 'dtata')}
                        disabled={isScraping}
                        style={{
                            background: 'var(--primary)',
                            border: 'none',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: isScraping ? 'not-allowed' : 'pointer',
                            opacity: isScraping ? 0.7 : 1
                        }}
                    >
                        <RotateCw size={16} className={isScraping ? 'spin' : ''} />
                        {isScraping ? 'Scraping...' : 'Scrape New Data'}
                    </button>

                </div>
            </header>

            {/* Hero & Search Section */}
            <div className="hero-section">
                <h1 className="hero-title">Discover Real Deals</h1>
                <p className="hero-subtitle">Search for products, compare prices, and find the best offers.</p>

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
                        className="search-icon"
                        size={24}
                        onClick={performSearch}
                        style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', cursor: 'pointer' }}
                    />
                </div>

                {/* ADVANCED FILTER BAR */}
                <div className="filter-bar" style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <input
                        type="number"
                        placeholder="Min Price (₹)"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #334155', background: '#1e293b', color: 'white', width: '120px' }}
                    />
                    <input
                        type="number"
                        placeholder="Max Price (₹)"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #334155', background: '#1e293b', color: 'white', width: '120px' }}
                    />

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #334155', background: '#1e293b', color: 'white' }}
                    >
                        <option value="relevance">Relevance</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Rating: High to Low</option>
                    </select>

                    <button
                        onClick={() => handleScrape(searchTerm)}
                        disabled={isScraping}
                        style={{
                            background: '#fbbf24',
                            color: 'black',
                            border: 'none',
                            padding: '0.5rem 1.5rem',
                            borderRadius: '0.5rem',
                            fontWeight: 'bold',
                            cursor: isScraping ? 'not-allowed' : 'pointer',
                            opacity: isScraping ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <RotateCw size={16} className={isScraping ? 'spin' : ''} />
                        {isScraping ? 'Searching...' : 'Find Deals'}
                    </button>

                    <button
                        onClick={handleReset}
                        style={{
                            background: '#334155',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        title="Reset Search & Filters"
                    >
                        <RotateCcw size={16} />
                        Reset
                    </button>
                </div>
            </div>

            {/* Live Offer Feed */}
            <OfferFeed />

            {/* Product Grid */}
            <div className="product-grid">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                        <div key={product.id} className="product-card" onClick={() => navigate(`/product/${product.id}`, { state: { product } })}>
                            <img
                                src={product.image_url || 'https://placehold.co/300?text=No+Image'}
                                alt={product.title}
                                className="product-image"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300?text=No+Image'; }}
                            />
                            <div className="product-info">
                                <h3 className="product-title">{product.title}</h3>
                                <div className="product-meta">
                                    <div className="product-price">₹{product.price}</div>
                                    <div className="product-category">{product.category}</div>
                                </div>
                                {product.source && (
                                    <div
                                        className="product-source"
                                        style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.5rem', cursor: 'pointer' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(product.product_url, '_blank');
                                        }}
                                    >
                                        Via {product.source} ↗
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--secondary)' }}>
                        <h3>No products found</h3>
                        <p>Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
