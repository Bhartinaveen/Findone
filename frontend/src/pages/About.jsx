import React from 'react';

export default function About() {
    return (
        <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', color: '#e2e8f0' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'white' }}>About FindNow AI</h1>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
                FindNow AI is an advanced product discovery platform designed to help smart shoppers make informed decisions.
                We use cutting-edge Artificial Intelligence and Real-time Web Scraping to aggregate prices, reviews, and availability from all major e-commerce platforms.
            </p>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'white' }}>Our Mission</h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
                Our mission is to democratize price transparency. We believe everyone deserves to know they are getting the best deal without opening twenty browser tabs.
            </p>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'white' }}>The Technology</h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                Our backend uses Puppeteer for robust scraping, Vector Embeddings for smart "semantic" search (finding products by meaning, not just keywords), and a dedicated Recommendation Engine to suggest the best alternatives.
            </p>
        </div>
    );
}
