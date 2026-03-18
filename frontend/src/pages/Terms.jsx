import React, { useState } from 'react';
import { FileText, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const terms = [
    {
        id: 1,
        title: 'Acceptance of Terms',
        content: `By accessing or using FindNow ("the Service"), you confirm that you have read, understood, and agree to be bound by these Terms of Service.

If you are using FindNow on behalf of an organisation, you represent that you have the authority to bind that organisation to these terms.

If you do not agree to any part of these terms, please discontinue use of the Service immediately.`
    },
    {
        id: 2,
        title: 'Description of Service',
        content: `FindNow is a product discovery and price comparison platform. The Service allows you to:

• **Search and display** product listings scraped from third-party e-commerce websites.
• **Track price history** of products over time.
• **Set price alerts** and receive notifications when prices drop.
• **Use our AI Chatbot** to ask questions about products.

FindNow is a discovery tool. We are not a retailer, marketplace, or party to any purchase transaction. All purchases are made directly with the original retailer.`
    },
    {
        id: 3,
        title: 'Use Licence & Restrictions',
        content: `FindNow grants you a limited, non-exclusive, non-transferable licence to use the Service for personal, non-commercial purposes.

**You agree NOT to:**
• Scrape, crawl, or systematically extract data from FindNow's interface or API.
• Attempt to reverse engineer, decompile, or extract our source code or AI models.
• Use automated bots to access the Service in a way that burdens our infrastructure.
• Reproduce, redistribute, or sell any content from FindNow without written permission.
• Use the Service for any illegal purpose or in violation of any applicable regulations.

Violation of this licence may result in immediate suspension of your account.`
    },
    {
        id: 4,
        title: 'Price Data Accuracy',
        content: `Product prices, availability, and descriptions on FindNow are sourced via automated scraping from third-party websites. While we strive for accuracy:

• Prices may be **delayed by minutes or hours** due to scraping intervals.
• Products may go **out of stock** after data is collected.
• Sellers may change prices **at any time** without notice.

**FindNow makes no warranty** that any displayed price is the current or lowest available price. Always verify the final price on the retailer's website before purchasing.

We are not responsible for any losses arising from reliance on pricing data shown on FindNow.`
    },
    {
        id: 5,
        title: 'User Accounts',
        content: `To use features such as wishlists and price alerts, you must create an account. You are responsible for:

• **Maintaining the confidentiality** of your account credentials.
• **All activity** that occurs under your account.
• **Notifying us immediately** at security@findnow.ai if you suspect unauthorised access.

We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity, with or without prior notice.`
    },
    {
        id: 6,
        title: 'Intellectual Property',
        content: `All original content, design, code, and AI-generated outputs produced by FindNow are the intellectual property of FindNow and are protected under applicable copyright laws.

Product names, images, trademarks, and descriptions remain the intellectual property of their respective owners (Amazon, Flipkart, Myntra, etc.). FindNow does not claim ownership over any third-party content displayed through the Service.

The FindNow name, logo, and brand are proprietary and may not be used without written consent.`
    },
    {
        id: 7,
        title: 'Limitation of Liability',
        content: `To the maximum extent permitted by applicable law, FindNow and its creators shall not be liable for:

• **Indirect or consequential damages** — including loss of profit, data, or business opportunity.
• **Inaccurate price or product information** — whether from scraping errors or third-party changes.
• **Service interruptions** — due to maintenance, infrastructure outages, or third-party API failures.
• **AI-generated content** — the chatbot's responses are for informational purposes only and should not be treated as financial, legal, or purchasing advice.

Our total liability for any claim arising from use of FindNow shall not exceed ₹500.`
    },
    {
        id: 8,
        title: 'Changes to Terms',
        content: `We reserve the right to modify these Terms of Service at any time. When we do:

• The **"Last Updated"** date at the top of this page will be revised.
• For significant changes, we will provide **at least 7 days notice** via the in-app notification centre.
• Your continued use of the Service after changes take effect constitutes your acceptance of the new terms.

We encourage you to review these terms periodically to stay informed.`
    },
    {
        id: 9,
        title: 'Governing Law',
        content: `These Terms shall be governed by and construed in accordance with the laws of **India**, without regard to its conflict of law provisions.

Any disputes arising from these terms or from use of the Service shall be subject to the exclusive jurisdiction of the courts located in **India**.

If any provision of these terms is found to be unenforceable, the remaining provisions shall remain in full force and effect.`
    },
];

function TermSection({ term }) {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ borderBottom: '1px solid var(--border)' }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1.5rem 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '1rem'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ minWidth: '28px', minHeight: '28px', width: '28px', height: '28px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', flexShrink: 0 }}>{term.id}</span>
                    <span style={{ fontWeight: 700, fontSize: '1.02rem', color: 'var(--text)' }}>{term.title}</span>
                </div>
                <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                    {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
            </button>
            {open && (
                <div style={{ paddingBottom: '1.5rem' }}>
                    {term.content.split('\n').map((line, i) => {
                        if (!line.trim()) return <br key={i} />;
                        const parts = line.split(/\*\*(.*?)\*\*/g);
                        return (
                            <p key={i} style={{ margin: '0.35rem 0', color: 'var(--text-muted)', lineHeight: 1.75, fontSize: '0.96rem' }}>
                                {parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: 'var(--text)' }}>{p}</strong> : p)}
                            </p>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function Terms() {
    return (
        <div style={{ color: 'var(--text)', minHeight: '100vh' }}>
            {/* Hero */}
            <div style={{
                background: 'var(--bg-elevated)',
                borderBottom: '1px solid var(--border)',
                padding: '5rem 2rem 4rem', textAlign: 'center',
            }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '2rem', padding: '0.4rem 1.2rem', fontSize: '0.82rem', fontWeight: 700, color: '#c4b5fd', marginBottom: '1.5rem' }}>
                        <FileText size={13} /> Legal terms, written in plain language
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, color: 'var(--text)', lineHeight: 1.15, marginBottom: '1.25rem' }}>
                        Terms of Service
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.7 }}>
                        These terms govern your use of FindNow. We've written them to be readable — not just legally airtight.
                    </p>
                    <div style={{ marginTop: '1.5rem', display: 'inline-block', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '1rem', padding: '0.5rem 1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Last Updated: March 2025 · Effective Immediately
                    </div>
                </div>
            </div>

            {/* Warning Banner */}
            <div style={{ background: 'rgba(251,191,36,0.08)', borderBottom: '1px solid rgba(251,191,36,0.2)', padding: '1rem 2rem' }}>
                <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#d97706', fontSize: '0.88rem', fontWeight: 600 }}>
                    <AlertTriangle size={16} />
                    FindNow is a price discovery tool — not a retailer. We do not sell products or process payments. Always verify prices before purchasing.
                </div>
            </div>

            {/* Accordion Terms */}
            <div style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 2rem 5rem' }}>
                {terms.map(t => <TermSection key={t.id} term={t} />)}

                {/* Contact */}
                <div style={{ marginTop: '3rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '1.5rem', padding: '2.5rem', textAlign: 'center' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.75rem' }}>Questions about these terms?</h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                        We're happy to clarify anything. Reach out and we'll respond within 2 business days.
                    </p>
                    <a href="mailto:legal@findnow.ai" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}>legal@findnow.ai →</a>
                </div>
            </div>
        </div>
    );
}
