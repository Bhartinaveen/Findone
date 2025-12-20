import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Heart } from 'lucide-react';

export default function Footer() {
    return (
        <footer style={{
            background: '#0f172a',
            borderTop: '1px solid #1e293b',
            padding: '3rem 1rem',
            marginTop: 'auto', // Push to bottom
            color: '#94a3b8'
        }}>
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>

                {/* Brand Section */}
                <div>
                    <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>FindNow</h2>
                    <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
                        The ultimate AI-powered product discovery tool. <br />
                        Compare prices, track history, and find the best deals across the web.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <a href="#" className="social-icon"><Github size={20} /></a>
                        <a href="#" className="social-icon"><Twitter size={20} /></a>
                        <a href="#" className="social-icon"><Linkedin size={20} /></a>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 style={{ color: 'white', marginBottom: '1rem', fontWeight: 'bold' }}>Company</h3>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li><Link to="/about" className="footer-link">About Us</Link></li>
                        <li><Link to="/careers" className="footer-link">Careers</Link></li>
                        <li><Link to="/privacy" className="footer-link">Privacy Policy</Link></li>
                        <li><Link to="/terms" className="footer-link">Terms of Service</Link></li>
                    </ul>
                </div>

                {/* Features */}
                <div>
                    <h3 style={{ color: 'white', marginBottom: '1rem', fontWeight: 'bold' }}>Features</h3>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>AI Recommendations</li>
                        <li>Price Tracking</li>
                        <li>Real-time Scraping</li>
                        <li>Price Comparison</li>
                    </ul>
                </div>
            </div>

            <div style={{
                marginTop: '3rem',
                paddingTop: '2rem',
                borderTop: '1px solid #1e293b',
                textAlign: 'center',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
            }}>
                <span>© {new Date().getFullYear()} FindNow. Built with</span>
                <Heart size={14} fill="#ef4444" color="#ef4444" />
                <span>for smart shoppers.</span>
            </div>

            <style>{`
                .footer-link { color: #94a3b8; text-decoration: none; transition: color 0.2s; }
                .footer-link:hover { color: #4ade80; }
                .social-icon { color: white; opacity: 0.7; transition: all 0.2s; }
                .social-icon:hover { opacity: 1; color: #4ade80; transform: translateY(-2px); }
            `}</style>
        </footer>
    );
}
