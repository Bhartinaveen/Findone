import React from 'react';
import { Briefcase, Coffee, Zap, Globe } from 'lucide-react';

const perks = [
    { icon: '🚀', title: 'Remote First', desc: 'Work from anywhere in India. We are fully distributed.' },
    { icon: '📚', title: 'Learning Budget', desc: 'Annual budget for courses, books, and conferences.' },
    { icon: '⚡', title: 'Latest Tech', desc: 'Work with Gemini AI, Puppeteer, React, Supabase and more.' },
    { icon: '🎯', title: 'High Impact', desc: 'Your work reaches thousands of shoppers from day one.' },
    { icon: '🏖️', title: 'Flexible Hours', desc: 'Async-first culture. We care about results, not hours.' },
    { icon: '💰', title: 'Competitive Pay', desc: 'Market-rate salaries with equity options.' },
];

const openRoles = []; // No open positions currently

export default function Careers() {
    return (
        <div style={{ color: 'var(--text)', minHeight: '100vh' }}>
            {/* Hero */}
            <div style={{
                background: 'var(--bg-elevated)',
                borderBottom: '1px solid var(--border)',
                padding: '6rem 2rem 5rem', textAlign: 'center',
                position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(99,102,241,0.08) 0%, transparent 50%)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', maxWidth: '680px', margin: '0 auto' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '2rem', padding: '0.4rem 1.2rem', fontSize: '0.82rem', fontWeight: 700, color: '#a5b4fc', marginBottom: '1.5rem' }}>
                        <Briefcase size={13} /> We're building something big
                    </div>
                    <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 900, color: 'var(--text)', lineHeight: 1.15, marginBottom: '1.25rem' }}>
                        Join the team building<br />
                        <span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            India's AI shopping engine
                        </span>
                    </h1>
                    <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto' }}>
                        We're a small team with a big vision. If you love building products that make people's lives easier, we'd love to hear from you.
                    </p>
                </div>
            </div>

            {/* Perks */}
            <div style={{ maxWidth: '960px', margin: '0 auto', padding: '5rem 2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>Why work at FindNow?</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>We build the perks we'd actually want ourselves.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    {perks.map(p => (
                        <div key={p.title} style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: '1.5rem', padding: '2rem',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{p.icon}</div>
                            <h3 style={{ fontWeight: 800, marginBottom: '0.5rem', fontSize: '1.05rem' }}>{p.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Open Roles */}
            <div style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '5rem 2rem' }}>
                <div style={{ maxWidth: '760px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem', textAlign: 'center' }}>Open Positions</h2>
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '3rem' }}>Updated March 2025</p>

                    {openRoles.length === 0 ? (
                        <div style={{ textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '2rem', padding: '4rem 2rem' }}>
                            <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>🌱</div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem' }}>No open roles right now</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '1.05rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                                We're not actively hiring, but we're always excited to meet talented people. Drop us a message and we'll keep you in mind.
                            </p>
                            <a href="mailto:careers@findnow.ai" style={{
                                display: 'inline-block',
                                background: 'var(--grad-primary)',
                                color: 'white',
                                padding: '0.9rem 2rem',
                                borderRadius: '2rem',
                                fontWeight: 800,
                                textDecoration: 'none',
                                fontSize: '0.95rem'
                            }}>
                                Send us your CV →
                            </a>
                        </div>
                    ) : openRoles.map(r => (
                        <div key={r.title} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '1.5rem', padding: '1.5rem 2rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{r.title}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>{r.type} · {r.location}</div>
                            </div>
                            <button className="btn-primary" style={{ padding: '0.6rem 1.5rem' }}>Apply →</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom CTA */}
            <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                <Coffee size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>Not seeing the right role?</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '440px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
                    We hire for attitude over experience. If you're passionate about AI, shopping, or just building great software — write to us.
                </p>
                <a href="mailto:careers@findnow.ai" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}>careers@findnow.ai →</a>
            </div>
        </div>
    );
}
