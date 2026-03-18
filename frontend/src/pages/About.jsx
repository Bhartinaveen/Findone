import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Shield, Globe, Users, Target, TrendingUp, Heart } from 'lucide-react';

const stats = [
    { label: 'Products Tracked', value: '50K+' },
    { label: 'E-commerce Sites', value: '6' },
    { label: 'Price Drops Caught', value: '10K+' },
    { label: 'AI Models Used', value: '3' },
];

const team = [
    { name: 'Bharti Naveen', role: 'Founder & Full-Stack Developer', emoji: '👩‍💻' },
];

const values = [
    { icon: <Shield size={24} />, title: 'Transparency', desc: 'We show you real prices from real sites. No hidden commissions, no biased rankings.' },
    { icon: <Zap size={24} />, title: 'Speed', desc: 'Live scraping with headless Chromium. Results in seconds, not minutes.' },
    { icon: <Globe size={24} />, title: 'Coverage', desc: 'Amazon, Flipkart, Myntra, Ajio, Meesho, Nykaa — all in one place.' },
    { icon: <Target size={24} />, title: 'Intelligence', desc: 'Google Gemini AI reads reviews and price history so you never overpay.' },
];

export default function About() {
    return (
        <div style={{ color: 'var(--text)', minHeight: '100vh' }}>
            {/* Hero */}
            <div style={{
                background: 'var(--bg-elevated)',
                borderBottom: '1px solid var(--border)',
                padding: '6rem 2rem 8rem',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(circle at 30% 50%, rgba(99,102,241,0.08) 0%, transparent 60%)',
                    pointerEvents: 'none'
                }} />
                <div style={{ position: 'relative', maxWidth: '720px', margin: '0 auto' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        background: 'rgba(99,102,241,0.12)', backdropFilter: 'blur(8px)',
                        borderRadius: '2rem', padding: '0.4rem 1.2rem',
                        fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)',
                        marginBottom: '1.5rem', border: '1px solid rgba(99,102,241,0.25)'
                    }}>
                        <Heart size={14} fill="white" /> Built with passion in India
                    </div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, color: 'var(--text)', lineHeight: 1.1, marginBottom: '1.5rem' }}>
                        We're on a mission to make<br />
                        <span style={{ opacity: 0.85 }}>smart shopping effortless</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto' }}>
                        FindNow uses AI and real-time scraping to find the best prices across India's biggest e-commerce platforms — so you never overpay again.
                    </p>
                </div>
            </div>

            {/* Stats Band */}
            <div style={{
                background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border)',
                borderTop: '1px solid var(--border)',
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem', textAlign: 'center' }}>
                    {stats.map(s => (
                        <div key={s.label}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
                            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.3rem' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Our Story */}
            <div style={{ maxWidth: '760px', margin: '0 auto', padding: '5rem 2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <TrendingUp size={22} color="var(--primary)" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Our Story</span>
                </div>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.2 }}>Why we built FindNow</h2>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.9, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Every time I wanted to buy something online, I'd spend 30 minutes opening tabs across Amazon, Flipkart, Myntra, and more — trying to figure out who had the best price, which reviews were genuine, and whether today was even a good time to buy.
                </p>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.9, color: 'var(--text-muted)' }}>
                    FindNow was built to solve exactly that. One search, live data from 6 platforms, AI-enhanced price history, and a chatbot that actually understands products. Shopping shouldn't be exhausting.
                </p>
            </div>

            {/* Values */}
            <div style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '5rem 2rem' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '3rem' }}>What we stand for</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                        {values.map(v => (
                            <div key={v.title} style={{ background: 'var(--bg-card)', borderRadius: '1.5rem', padding: '2rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ width: '48px', height: '48px', background: 'var(--grad-primary)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{v.icon}</div>
                                <h3 style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>{v.title}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Team */}
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '5rem 2rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>Meet the builder</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Small team, big vision.</p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {team.map(t => (
                        <div key={t.name} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '2rem', padding: '2.5rem 3rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{t.emoji}</div>
                            <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{t.name}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.4rem' }}>{t.role}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)', padding: '4rem 2rem', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--text)', fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Ready to shop smarter?</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>Start finding the best deals across India's top platforms.</p>
                <Link to="/" className="btn-primary" style={{ padding: '1rem 2.5rem', borderRadius: '2rem', fontWeight: 800, fontSize: '1rem', textDecoration: 'none', display: 'inline-block' }}>
                    Start Searching Free →
                </Link>
            </div>
        </div>
    );
}
