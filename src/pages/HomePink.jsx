import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePink.css';

const HomePink = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="home-pink-wrapper">
            {/* ─── Background Decor ─── */}
            <div className="pink-bg-orbs">
                <div className="pink-orb orb-1"></div>
                <div className="pink-orb orb-2"></div>
                <div className="pink-orb orb-3"></div>
            </div>

            <div className="home-pink-container">
                <div className="home-pink-layout">

                    {/* LEFT: Safe Space Card */}
                    <div className="pink-hero-card-container">
                        <div className="pink-washi-tape tape-top"></div>
                        <div className="pink-washi-tape tape-bottom"></div>

                        <div className="pink-hero-card">
                            <span className="card-welcome">welcome to your safe space 🌸</span>
                            <h1 className="card-title">
                                Find peace, bloom into<br />your best self
                            </h1>
                            <p className="card-desc">
                                Professional therapy in a cozy, judgment-free space. Let's grow together, one session at a time. 💜
                            </p>
                            <Link to="/booking" className="btn-pink-hero">
                                <span className="sparkle-icon">✨</span> start your journey
                            </Link>
                        </div>

                        {/* Floating Quote */}
                        <div className="pink-floating-quote">
                            "healing is not linear" 🌙
                        </div>
                    </div>

                    {/* RIGHT: Polaroid Stack */}
                    <div className="pink-visual-stack">
                        {/* Smaller Polaroid Top */}
                        <div className="pink-polaroid-sm polaroid-top">
                            <div className="polaroid-inner">
                                <div className="polaroid-img-placeholder purple-glow">
                                    <span className="polaroid-icon">✨</span>
                                </div>
                                <span className="polaroid-label">safe space 💜</span>
                            </div>
                        </div>

                        {/* Large Main Polaroid */}
                        <div className="pink-polaroid-lg">
                            <div className="polaroid-inner">
                                <div className="polaroid-img-main pink-gradient-bg">
                                    <div className="main-heart">🤍</div>
                                    <h2 className="main-polaroid-text">You matter</h2>
                                    <p className="main-polaroid-sub">Your story is worth telling</p>
                                </div>
                                <span className="polaroid-label-lg">your healing journey ✨</span>
                            </div>
                        </div>

                        {/* Smaller Polaroid Bottom */}
                        <div className="pink-polaroid-sm polaroid-bottom">
                            <div className="polaroid-inner">
                                <div className="polaroid-img-placeholder blue-glow">
                                    <span className="polaroid-icon-sm">🌸</span>
                                </div>
                                <span className="polaroid-label">grow & bloom 🌺</span>
                            </div>
                        </div>

                        {/* Floating Decorative Stars */}
                        <div className="pink-star-decor star-1">⭐</div>
                        <div className="pink-star-decor star-2">⭐</div>
                    </div>
                </div>
            </div>

            {/* Audio Toggle (Replica) */}
            <button className="pink-audio-toggle" aria-label="Toggle sound">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
            </button>
        </div>
    );
};

export default HomePink;
