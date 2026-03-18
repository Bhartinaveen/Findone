import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Tag, ArrowRight, Search } from 'lucide-react';

const posts = [
    {
        id: 1,
        slug: 'how-ai-finds-best-price',
        category: 'AI & Tech',
        categoryColor: '#6366f1',
        title: 'How AI Finds the Best Price Across 6 Shopping Sites',
        excerpt: 'We scrape Amazon, Flipkart, Myntra, Ajio, Meesho, and Nykaa in real time — here\'s exactly how our AI engine processes, embeds, and ranks product data to surface the best deal for you. Our system uses advanced distributed workers to ensure parity and speed, while our Gemini-powered embedding models ensure that even when titles differ across sites, we know it\'s the same product. This allows us to provide a unified price comparison that is both accurate and lightning-fast.',
        readTime: '5 min read',
        date: 'March 15, 2025',
        emoji: '🤖',
    },
    {
        id: 2,
        slug: 'price-history-explained',
        category: 'Shopping Tips',
        categoryColor: '#10b981',
        title: 'Why Price History Is the Most Underrated Shopping Tool',
        excerpt: 'A product marked "50% off" might actually be at its regular price. We explain how FindNow price history charts reveal the truth behind sale tags and seasonal pricing tricks. By tracking every price point over weeks and months, we expose "fake discounts" where prices are hiked just before a sale. Our transparency engine empowers you to wait for the true seasonal lows, ensuring that every rupee you spend is optimized for maximum value.',
        readTime: '4 min read',
        date: 'March 10, 2025',
        emoji: '📊',
    },
    {
        id: 3,
        slug: 'rag-chatbot-shopping',
        category: 'AI & Tech',
        categoryColor: '#6366f1',
        title: 'What is RAG? How Our Chatbot Actually Understands Your Products',
        excerpt: 'Retrieval-Augmented Generation (RAG) is the secret behind our AI chat. Instead of just answering generic questions, FindNow\'s chatbot searches your actual product data before responding. This hybrid approach combines the creative power of Large Language Models with the hard facts stored in our database. The result is a shopping assistant that doesn\'t just guess — it provides data-driven advice tailored to the specific items you are looking at right now.',
        readTime: '6 min read',
        date: 'March 5, 2025',
        emoji: '💬',
    },
    {
        id: 4,
        slug: 'flipkart-vs-amazon-prices',
        category: 'Shopping Tips',
        categoryColor: '#10b981',
        title: 'Flipkart vs Amazon: Who Actually Has Lower Prices in 2025?',
        excerpt: 'We analyzed over 10,000 product price comparisons across both platforms. The results might surprise you — the answer depends heavily on the product category. While Amazon often leads in electronics and gadgets, Flipkart frequently wins on lifestyle and large appliances. Our deep-dive study looks at delivery costs, bank offers, and membership benefits to give you the most comprehensive picture of the Indian e-commerce landscape today.',
        readTime: '7 min read',
        date: 'Feb 28, 2025',
        emoji: '🛍️',
    },
    {
        id: 5,
        slug: 'wishlist-price-alerts',
        category: 'Product Updates',
        categoryColor: '#f59e0b',
        title: 'Introducing Smart Price Alerts: Get Notified When Prices Drop',
        excerpt: 'You no longer have to refresh a product page every day. Add any product to your FindNow wishlist, set a target price, and we\'ll notify you the moment it drops. Our improved notification engine now supports browser push and email alerts, ensuring you never miss a lightning deal or a sudden price crash. It’s the closest thing to having a personal shopper who watches the screen 24/7 so you don’t have to.',
        readTime: '3 min read',
        date: 'Feb 20, 2025',
        emoji: '🔔',
    },
    {
        id: 6,
        slug: 'puppeteer-scraping-guide',
        category: 'AI & Tech',
        categoryColor: '#6366f1',
        title: 'Behind the Scenes: How We Scrape Without Getting Blocked',
        excerpt: 'Modern e-commerce sites actively fight scrapers. We share how we use Puppeteer Stealth, user-agent rotation, and smart delays to reliably extract live pricing data. Building a resilient scraper at scale requires more than just code; it requires understanding the delicate dance of human-like browsing patterns and high-performance concurrency. We dive into the technical challenges of bypassing sophisticated bot detection systems while respecting site policies.',
        readTime: '8 min read',
        date: 'Feb 14, 2025',
        emoji: '🕵️',
    },
];

const categories = ['All', 'AI & Tech', 'Shopping Tips', 'Product Updates'];

const featured = posts[0];
const rest = posts.slice(1);

export default function Blog() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [query, setQuery] = useState('');

    const filtered = rest.filter(p => {
        const matchCat = activeCategory === 'All' || p.category === activeCategory;
        const matchQ = !query || p.title.toLowerCase().includes(query.toLowerCase()) || p.excerpt.toLowerCase().includes(query.toLowerCase());
        return matchCat && matchQ;
    });

    return (
        <div style={{ color: 'var(--text)', minHeight: '100vh' }}>

            {/* Hero */}
            <div style={{
                background: 'var(--bg-elevated)',
                borderBottom: '1px solid var(--border)',
                padding: '5rem 2rem 4rem',
                textAlign: 'center',
            }}>
                <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
                        borderRadius: '2rem', padding: '0.4rem 1.2rem',
                        fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)',
                        marginBottom: '1.5rem'
                    }}>
                        <BookOpen size={13} /> FindNow Blog
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, color: 'var(--text)', lineHeight: 1.15, marginBottom: '1rem' }}>
                        Shopping smarter,<br />
                        <span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            one post at a time
                        </span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                        Deep dives into AI, price intelligence, shopping strategy, and product updates from the FindNow team.
                    </p>

                    {/* Search */}
                    <div style={{ position: 'relative', maxWidth: '440px', margin: '0 auto' }}>
                        <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            style={{
                                width: '100%', boxSizing: 'border-box',
                                padding: '0.85rem 1rem 0.85rem 2.75rem',
                                borderRadius: '2rem', border: '1px solid var(--border)',
                                background: 'var(--bg-card)', color: 'var(--text)',
                                fontSize: '0.95rem', outline: 'none',
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Category Filter */}
            <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '1rem 2rem' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                padding: '0.5rem 1.25rem', borderRadius: '2rem', border: '1px solid var(--border)',
                                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
                                background: activeCategory === cat ? 'var(--primary)' : 'var(--bg-elevated)',
                                color: activeCategory === cat ? 'white' : 'var(--text-muted)',
                                borderColor: activeCategory === cat ? 'var(--primary)' : 'var(--border)',
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3.5rem 2rem 5rem' }}>

                {/* Featured Post */}
                {activeCategory === 'All' && !query && (
                    <div style={{ marginBottom: '3.5rem' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                            ✦ Featured Post
                        </div>
                        <div style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: '2rem', overflow: 'hidden',
                            display: 'grid', gridTemplateColumns: '1fr 1fr',
                            gap: 0, transition: 'box-shadow 0.3s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                        >
                            {/* Left visual */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                minHeight: '280px', fontSize: '7rem',
                                borderRight: '1px solid var(--border)',
                            }}>
                                {featured.emoji}
                            </div>
                            {/* Right content */}
                            <div style={{ padding: '2.5rem' }}>
                                <span style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', color: featured.categoryColor, borderRadius: '1rem', padding: '0.3rem 0.9rem', fontSize: '0.78rem', fontWeight: 800, marginBottom: '1rem' }}>
                                    {featured.category}
                                </span>
                                <h2 style={{ fontSize: '1.55rem', fontWeight: 900, lineHeight: 1.25, marginBottom: '1rem', color: 'var(--text)' }}>
                                    {featured.title}
                                </h2>
                                <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, fontSize: '0.96rem', marginBottom: '1.75rem' }}>
                                    {featured.excerpt}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={13} />{featured.readTime}</span>
                                        <span>{featured.date}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.75rem' }}>
                    {(query || activeCategory !== 'All' ? posts : filtered).map(post => (
                        <div
                            key={post.id}
                            style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: '1.5rem', overflow: 'hidden',
                                height: '100%', transition: 'box-shadow 0.22s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                        >
                                {/* Emoji thumbnail */}
                                <div style={{
                                    background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)',
                                    padding: '2.5rem', textAlign: 'center', fontSize: '3.5rem'
                                }}>
                                    {post.emoji}
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
                                        <span style={{ background: `${post.categoryColor}18`, color: post.categoryColor, borderRadius: '1rem', padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 800 }}>
                                            <Tag size={10} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
                                            {post.category}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <Clock size={11} /> {post.readTime}
                                        </span>
                                    </div>
                                    <h3 style={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.35, marginBottom: '0.75rem', color: 'var(--text)' }}>
                                        {post.title}
                                    </h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.65, marginBottom: '1.25rem', display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {post.excerpt}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{post.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No posts found for "{query}"</p>
                    </div>
                )}
            </div>

            {/* Newsletter / Subscribe CTA */}
            <div style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)', padding: '4rem 2rem', textAlign: 'center' }}>
                <div style={{ maxWidth: '480px', margin: '0 auto' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📬</div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text)' }}>
                        Stay in the loop
                    </h2>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.75rem', fontSize: '1rem' }}>
                        Get new articles, price tips, and AI shopping guides delivered to your inbox. No spam, unsubscribe any time.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <input
                            type="email"
                            placeholder="you@email.com"
                            style={{
                                flex: 1, minWidth: '220px', padding: '0.85rem 1.25rem',
                                borderRadius: '2rem', border: '1px solid var(--border)',
                                background: 'var(--bg-card)', color: 'var(--text)',
                                fontSize: '0.95rem', outline: 'none',
                            }}
                        />
                        <button className="btn-primary" style={{ padding: '0.85rem 1.75rem', borderRadius: '2rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                            Subscribe →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
