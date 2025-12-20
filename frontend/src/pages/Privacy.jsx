import React from 'react';

export default function Privacy() {
    return (
        <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', color: '#e2e8f0' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'white' }}>Privacy Policy</h1>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Last Updated: December 2025</p>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>1. Information We Collect</h2>
                <p style={{ lineHeight: '1.6' }}>
                    We collect minimal data necessary for providing our services, such as your email address (for login and notifications) and your wishlist preferences.
                </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>2. How We Use Your Data</h2>
                <p style={{ lineHeight: '1.6' }}>
                    Your data is used solely to:
                    <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                        <li>Authenticate your account.</li>
                        <li>Send you price drop alerts.</li>
                        <li>Improve our recommendation algorithms.</li>
                    </ul>
                </p>
            </section>

            <section>
                <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>3. Data Security</h2>
                <p style={{ lineHeight: '1.6' }}>
                    We use industry-standard encryption (bcrypt for passwords, HTTPS for transmission) to protect your data. We do not sell your personal information to third parties.
                </p>
            </section>
        </div>
    );
}
