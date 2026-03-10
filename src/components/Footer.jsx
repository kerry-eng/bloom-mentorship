import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer-site">
            <div className="container footer-container">
                <div className="footer-main">
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            BLOOM
                        </Link>
                        <p className="footer-tagline">
                            Empowering professional and personal growth through expert mentorship and structured reflection.
                            Build your path with clarity and purpose.
                        </p>
                        <div className="footer-social">
                            <a href="#" aria-label="LinkedIn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                            </a>
                            <a href="#" aria-label="Twitter">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                            </a>
                            <a href="#" aria-label="Email">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            </a>
                        </div>
                    </div>

                    <div className="footer-links">
                        <div className="footer-nav">
                            <h4>Navigator</h4>
                            <ul>
                                <li><Link to="/">Home</Link></li>
                                <li><Link to="/booking">Book Session</Link></li>
                                <li><Link to="/dashboard">Dashboard</Link></li>
                                <li><Link to="/reflections">History</Link></li>
                            </ul>
                        </div>
                        <div className="footer-support">
                            <h4>Support</h4>
                            <ul>
                                <li><Link to="/help">Help Center</Link></li>
                                <li><Link to="/privacy">Privacy Policy</Link></li>
                                <li><Link to="/terms">Terms of Service</Link></li>
                                <li><Link to="/contact">Contact Us</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2026 Bloom Mentorship Platform. All rights reserved.</p>
                    <div className="footer-legal">
                        <span>Kenya</span>
                        <span className="dot"></span>
                        <span>Global Access</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
