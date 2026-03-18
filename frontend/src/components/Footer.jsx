import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Heart, Zap } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-grid">
                {/* Brand */}
                <div className="footer-brand">
                    <h2>FindNow AI</h2>
                    <p>
                        The ultimate AI-powered product discovery tool.
                        Compare prices, track history, and find the best deals across the web.
                    </p>
                    <div className="footer-social-icons">
                        <a href="#" className="footer-social-icon" aria-label="GitHub"><Github size={17} /></a>
                        <a href="#" className="footer-social-icon" aria-label="Twitter"><Twitter size={17} /></a>
                        <a href="#" className="footer-social-icon" aria-label="LinkedIn"><Linkedin size={17} /></a>
                    </div>
                </div>

                {/* Company */}
                <div className="footer-col">
                    <h3>Company</h3>
                    <ul>
                        <li><Link to="/about" className="footer-link">About Us</Link></li>
                        <li><Link to="/careers" className="footer-link">Careers</Link></li>
                        <li><Link to="/blog" className="footer-link">Blog</Link></li>
                        <li><Link to="/privacy" className="footer-link">Privacy Policy</Link></li>
                        <li><Link to="/terms" className="footer-link">Terms of Service</Link></li>
                    </ul>
                </div>

                {/* Features */}
                <div className="footer-col">
                    <h3>Features</h3>
                    <ul>
                        <li>AI Recommendations</li>
                        <li>Price Tracking</li>
                        <li>Real-time Scraping</li>
                        <li>Price Comparison</li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <span>© {new Date().getFullYear()} FindNow. Built with</span>
                <Heart size={13} fill="#ec4899" color="#ec4899" />
                <span>for smart shoppers.</span>
                <span style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Zap size={13} color="#f59e0b" fill="#f59e0b" /> Powered by AI
                </span>
            </div>
        </footer>
    );
}
