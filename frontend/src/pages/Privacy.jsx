import React, { useState } from 'react';
import { Shield, Lock, Eye, Bell, Database, UserCheck, ChevronDown, ChevronUp } from 'lucide-react';

const sections = [
    {
        id: 1,
        icon: <Eye size={20} />,
        title: 'Information We Collect',
        content: `We collect only the minimum information needed to provide our services:

• **Email address** — for account creation, login, and price drop notifications.
• **Password** — stored as a one-way bcrypt hash. We never store your plaintext password.
• **Wishlist preferences** — products you save and your target price alerts.
• **Usage data** — anonymous page views to improve performance. No personal identifiers are attached.

We do NOT collect payment information, phone numbers, or your physical address.`
    },
    {
        id: 2,
        icon: <Database size={20} />,
        title: 'How We Use Your Data',
        content: `Your data is used exclusively to power your FindNow experience:

• **Authenticate your session** — keeping you signed in securely using JWT tokens.
• **Send price drop alerts** — notify you via the in-app notification centre when a tracked product hits your target price.
• **Improve recommendations** — aggregate (anonymous) search patterns help us improve our AI models.

We never sell, rent, or share your personal data with advertisers or third parties.`
    },
    {
        id: 3,
        icon: <Lock size={20} />,
        title: 'Data Security',
        content: `We take security seriously at every layer:

• **Passwords** — hashed with bcrypt (salt rounds: 10+). Irreversible by design.
• **API Communication** — all data transmitted over HTTPS/TLS.
• **Authentication tokens** — short-lived JWT tokens with expiry. Stored only in localStorage.
• **Database** — hosted on Supabase (SOC 2 Type 2 compliant), with row-level security enabled.

In the event of a data breach, we will notify affected users within 72 hours.`
    },
    {
        id: 4,
        icon: <Bell size={20} />,
        title: 'Notifications & Communications',
        content: `We only send communications you have explicitly opted into:

• **Price alert notifications** — shown in-app when your wishlist item drops below your target price.
• **No marketing emails** — we will never send you promotional emails unless you explicitly request them.

You can delete your wishlist items at any time to stop receiving alerts.`
    },
    {
        id: 5,
        icon: <UserCheck size={20} />,
        title: 'Your Rights',
        content: `You have full control over your data:

• **Access** — request a copy of all data we hold about you.
• **Correction** — update your email or account details at any time.
• **Deletion** — request permanent deletion of your account and all associated data.
• **Portability** — export your wishlist and notification history.

To exercise any of these rights, email us at privacy@findnow.ai.`
    },
    {
        id: 6,
        icon: <Shield size={20} />,
        title: 'Third-Party Services',
        content: `FindNow uses the following reputable third-party services, each with their own privacy policies:

• **Supabase** — database hosting (supabase.com/privacy)
• **Google Generative AI (Gemini)** — AI responses and embeddings (policies.google.com/privacy)
• **Puppeteer / Chromium** — local scraping engine (no data sent to third parties)

We do not integrate any advertising, analytics, or social media tracking SDKs.`
    },
];

function Section({ section }) {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ borderBottom: '1px solid var(--border)' }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1.5rem 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                    gap: '1rem'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ width: '36px', height: '36px', background: 'rgba(99,102,241,0.1)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                        {section.icon}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)' }}>{section.id}. {section.title}</span>
                </div>
                <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                    {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
            </button>
            {open && (
                <div style={{ paddingBottom: '1.5rem', paddingLeft: '0.5rem' }}>
                    {section.content.split('\n').map((line, i) => {
                        if (!line.trim()) return <br key={i} />;
                        // Bold **text**
                        const parts = line.split(/\*\*(.*?)\*\*/g);
                        return (
                            <p key={i} style={{ margin: '0.4rem 0', lineHeight: 1.75, color: 'var(--text-muted)', fontSize: '0.97rem' }}>
                                {parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: 'var(--text)' }}>{p}</strong> : p)}
                            </p>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function Privacy() {
    return (
        <div style={{ color: 'var(--text)', minHeight: '100vh' }}>
            {/* Hero */}
            <div style={{
                background: 'var(--bg-elevated)',
                borderBottom: '1px solid var(--border)',
                padding: '5rem 2rem 4rem', textAlign: 'center',
            }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '2rem', padding: '0.4rem 1.2rem', fontSize: '0.82rem', fontWeight: 700, color: '#6ee7b7', marginBottom: '1.5rem' }}>
                        <Shield size={13} /> Your privacy matters to us
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, color: 'var(--text)', lineHeight: 1.15, marginBottom: '1.25rem' }}>
                        Privacy Policy
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.7 }}>
                        We believe privacy is a right, not a privilege. Here's exactly how we handle your data — in plain language.
                    </p>
                    <div style={{ marginTop: '1.5rem', display: 'inline-block', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '1rem', padding: '0.5rem 1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Last Updated: March 2025
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', padding: '2.5rem 2rem' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', textAlign: 'center' }}>
                    {[
                        { icon: '🔒', title: 'Encrypted Passwords', sub: 'bcrypt hashed, never stored as plaintext' },
                        { icon: '🚫', title: 'No Data Selling', sub: 'Your data is never sold or shared' },
                        { icon: '📧', title: 'No Spam', sub: 'Only alerts you explicitly signed up for' },
                        { icon: '🗑️', title: 'Deletable', sub: 'Request full account deletion anytime' },
                    ].map(c => (
                        <div key={c.title} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '1.25rem', padding: '1.5rem 1rem' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{c.icon}</div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.4rem' }}>{c.title}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>{c.sub}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Accordion Sections */}
            <div style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 2rem 5rem' }}>
                {sections.map(s => <Section key={s.id} section={s} />)}

                <div style={{ marginTop: '3rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '1.5rem', padding: '2rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.7 }}>
                        Have questions about your data or this policy?
                    </p>
                    <a href="mailto:privacy@findnow.ai" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}>privacy@findnow.ai →</a>
                </div>
            </div>
        </div>
    );
}
