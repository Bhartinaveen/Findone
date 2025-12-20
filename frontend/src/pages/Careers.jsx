import React from 'react';

export default function Careers() {
    return (
        <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', color: '#e2e8f0', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'white' }}>Careers at FindNow</h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '3rem', color: '#94a3b8' }}>Join us in building the future of e-commerce.</p>

            <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '1rem', border: '1px solid #334155' }}>
                <h2 style={{ color: 'white' }}>No Open Positions</h2>
                <p style={{ marginTop: '1rem' }}>
                    We are currently not hiring, but we are always looking for talented individuals.
                    Check back later or follow us on social media for updates!
                </p>
            </div>
        </div>
    );
}
