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

            <div className="home-pink-replica-hero">
                {/* ─── Background Elements ─── */}
                <div className="replica-bg-decor">
                    <div className="pink-gradient-orb"></div>
                    <div className="red-dot-decor dot-1"></div>
                </div>

                <div className="replica-hero-content container">
                    {/* LEFT AREA: The White Card & Blob Portrait */}
                    <div className="replica-hero-left">
                        <div className="replica-main-card">
                            <div className="replica-washi-tape"></div>
                            <span className="welcome-text-cursive">welcome to your safe space</span>
                            <h1 className="hero-title-serif">
                                Find peace, bloom into<br />your best self
                            </h1>
                            <p className="hero-description">
                                Professional therapy in a cozy, judgment-free space.<br />
                                Let's grow together, one session at a time.
                            </p>
                            <Link to="/booking" className="btn-start-journey">
                                start your journey
                            </Link>
                        </div>
                        
                        {/* Ellipse 2 - Floating Blob Portrait */}
                        <div className="floating-blob-portrait">
                            <div className="blob-mask">
                                <img src="/Ellipse 2.png" alt="Safe Space Portrait" className="replica-portrait-img" />
                            </div>
                        </div>

                        {/* Floating Quote Below Card */}
                        <div className="floating-quote-bottom">
                            "healing is not linear"
                        </div>
                    </div>

                    {/* RIGHT AREA: The Polaroid Collage & Circle Portrait */}
                    <div className="replica-hero-right">
                        {/* Polaroid 1: Small Lavender */}
                        <div className="replica-polaroid polaroid-sm-lavender">
                            <div className="polaroid-inner">
                                <div className="polaroid-image-area lavender-tint">
                                    <div className="sparkle-emoji">✨</div>
                                </div>
                                <span className="polaroid-label">safe space</span>
                            </div>
                            <div className="red-dot-accent"></div>
                        </div>

                        {/* Polaroid 2: Main Large (YOU MATTER) */}
                        <div className="replica-polaroid polaroid-main-lg">
                            <div className="polaroid-inner">
                                <div className="polaroid-image-area pink-base">
                                    <h2 className="matter-text">YOU MATTER</h2>
                                    <p className="matter-subtext">Your story is worth telling</p>
                                </div>
                                <span className="polaroid-label-lg">your healing journey</span>
                            </div>
                        </div>

                        {/* Ellipse 3 - Circle Portrait */}
                        <div className="floating-circle-portrait">
                            <div className="circle-mask">
                                <img src="/Ellipse 3.png" alt="Healing Connection" className="replica-portrait-img" />
                            </div>
                        </div>

                        {/* Polaroid 3: Small Blue (Bottom) */}
                        <div className="replica-polaroid polaroid-sm-blue">
                            <div className="polaroid-inner">
                                <div className="polaroid-image-area blue-tint">
                                    <div className="flower-emoji">🌸</div>
                                </div>
                                <span className="polaroid-label">grow & bloom</span>
                            </div>
                        </div>

                        {/* Decorative Assets */}
                        <div className="floating-star-decor star-top"></div>
                        <div className="floating-star-decor star-bottom"></div>
                    </div>
                </div>
            </div>

            {/* ─── Coaching Programs Section ─── */}
            <div className="pink-programs-section">
                <div className="pink-programs-container">
                    <div className="pink-section-header">
                        <h2 className="pink-section-title">COACHING PROGRAMS</h2>
                        <p className="pink-section-subtitle">Select the program that matches your goals and commitment level</p>
                    </div>

                    <div className="pink-programs-grid">
                        <div className="pink-program-card">
                            <div className="program-icon-wrapper purple-icon">
                                <span className="program-icon"></span>
                            </div>
                            <h3>INDIVIDUAL COACHING</h3>
                            <p>One-on-one sessions focused on building mental strength and achieving your personal goals.</p>
                            <Link to="/booking" className="pink-learn-link">LEARN MORE —</Link>
                        </div>

                        <div className="pink-program-card">
                            <div className="program-icon-wrapper pink-icon">
                                <span className="program-icon"></span>
                            </div>
                            <h3>GROUP SESSIONS</h3>
                            <p>Join others on the same path. Build accountability, share experiences, and grow stronger together.</p>
                            <Link to="/booking" className="pink-learn-link">LEARN MORE —</Link>
                        </div>

                        <div className="pink-program-card">
                            <div className="program-icon-wrapper blue-icon">
                                <span className="program-icon"></span>
                            </div>
                            <h3>ONLINE COACHING</h3>
                            <p>Flexible virtual sessions that fit your schedule. Get the support you need, anywhere you are.</p>
                            <Link to="/booking" className="pink-learn-link">LEARN MORE —</Link>
                        </div>

                        <div className="pink-program-card">
                            <div className="program-icon-wrapper deep-purple-icon">
                                <span className="program-icon"></span>
                            </div>
                            <h3>MESSAGE SUPPORT</h3>
                            <p>Stay on track between sessions with direct message support and accountability check-ins.</p>
                            <Link to="/booking" className="pink-learn-link">LEARN MORE —</Link>
                        </div>
                    </div>

                    <div className="pink-help-pill-container">
                        <div className="pink-help-pill">
                            Need help choosing? Let's discuss your goals and find the right fit
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── What Makes Us Different Section ─── */}
            <div className="pink-different-section">
                <div className="pink-different-container">
                    <div className="pink-section-header">
                        <div className="pink-badge">why choose bloom?</div>
                        <h2 className="pink-section-title-alt">what makes us different</h2>
                        <p className="pink-section-subtitle-alt">
                            we're not just another therapy practice - we're a safe space where you can truly be yourself and heal at your own pace
                        </p>
                    </div>

                    <div className="pink-different-grid">
                        {/* Card 1 */}
                        <div className="different-card card-purple-border">
                            <div className="card-washi-tape"></div>
                            <div className="different-icon-wrapper icon-lavender">
                                <span className="different-icon"></span>
                            </div>
                            <h3>trauma-informed care</h3>
                            <p>gentle, compassionate approach that honors your healing journey at your own pace</p>
                            <span className="card-sparkle"></span>
                        </div>

                        {/* Card 2 */}
                        <div className="different-card card-pink-border">
                            <div className="card-washi-tape"></div>
                            <div className="different-icon-wrapper icon-peach">
                                <span className="different-icon"></span>
                            </div>
                            <h3>100% confidential</h3>
                            <p>your story is safe here - private, secure, and judgment-free space just for you</p>
                            <span className="card-sparkle"></span>
                        </div>

                        {/* Card 3 */}
                        <div className="different-card card-blue-border">
                            <div className="card-washi-tape"></div>
                            <div className="different-icon-wrapper icon-violet">
                                <span className="different-icon"></span>
                            </div>
                            <h3>licensed therapists</h3>
                            <p>work with experienced, certified professionals who truly care about your growth</p>
                            <span className="card-sparkle"></span>
                        </div>

                        {/* Card 4 */}
                        <div className="different-card card-pink-border">
                            <div className="card-washi-tape"></div>
                            <div className="different-icon-wrapper icon-peach">
                                <span className="different-icon"></span>
                            </div>
                            <h3>flexible scheduling</h3>
                            <p>therapy that fits your life - evening, weekend, and virtual sessions available</p>
                            <span className="card-sparkle"></span>
                        </div>

                        {/* Card 5 */}
                        <div className="different-card card-purple-border">
                            <div className="card-washi-tape"></div>
                            <div className="different-icon-wrapper icon-lavender">
                                <span className="different-icon"></span>
                            </div>
                            <h3>personalized approach</h3>
                            <p>no cookie-cutter solutions - therapy designed uniquely for your needs & goals</p>
                            <span className="card-sparkle"></span>
                        </div>

                        {/* Card 6 */}
                        <div className="different-card card-pink-border">
                            <div className="card-washi-tape"></div>
                            <div className="different-icon-wrapper icon-peach">
                                <span className="different-icon"></span>
                            </div>
                            <h3>holistic healing</h3>
                            <p>mind, body, and spirit - we address the whole you, not just symptoms</p>
                            <span className="card-sparkle"></span>
                        </div>
                    </div>

                    {/* Bottom CTA Card */}
                    <div className="pink-cta-card-container">
                        <div className="pink-cta-card">
                            <div className="card-washi-tape"></div>
                            <div className="cta-icon"></div>
                            <h3 className="cta-title">you deserve support that truly gets you</h3>
                            <p>no judgment, no pressure - just a safe space to be yourself and grow</p>
                            <Link to="/booking" className="btn-meet-therapists">
                                meet our therapists
                            </Link>
                        </div>
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
