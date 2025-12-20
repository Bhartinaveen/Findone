import React from 'react';

export default function Terms() {
    return (
        <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', color: '#e2e8f0' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'white' }}>Terms of Service</h1>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>Acceptance of Terms</h2>
                <p style={{ lineHeight: '1.6' }}>
                    By accessing and using FindNow AI, you agree to be bound by these Terms of Service. If you do not agree, please do not use our service.
                </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>Use License</h2>
                <p style={{ lineHeight: '1.6' }}>
                    Permission is granted to temporarily download one copy of the materials (information or software) on FindNow AI for personal, non-commercial transitory viewing only.
                </p>
            </section>

            <section>
                <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>Disclaimer</h2>
                <p style={{ lineHeight: '1.6' }}>
                    The materials on FindNow AI are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability.
                </p>
            </section>
        </div>
    );
}
