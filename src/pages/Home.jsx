import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import './Home.css'

export default function Home() {
    const { theme } = useTheme()
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className={`home-container ${theme === 'pink' ? 'theme-pink' : ''}`}>
            {/* ─── Hero Section Replica ─── */}
            <section className="hero-replica-v2">
                <div className="hero-atmosphere-v2" aria-hidden="true">
                    <div className="geometric-pattern"></div>
                    <div className="hero-replica-v2__orb hero-replica-v2__orb--left"></div>
                    <div className="hero-replica-v2__orb hero-replica-v2__orb--right"></div>
                </div>

                <div className="container hero-replica-v2__inner">
                    <div className="hero-replica-v2__content fade-in">
                        <span className="hero-replica-v2__eyebrow">Confidential support for your next season</span>

                        <h1 className="hero-replica-v2__title">
                            Find steadiness.
                            <br />
                            Build clarity.
                            <br />
                            <span className="grow-text-neon">Grow stronger.</span>
                        </h1>
                        
                        <p className="hero-replica-v2__subtitle">
                            Personalised mental wellness support designed for real life.
                            Private, practical, and rooted in compassionate guidance that
                            helps you move forward with confidence.
                        </p>
                        
                        <div className="hero-replica-v2__actions">
                            <Link to="/booking" className="btn-replica-black">
                                Book Session
                            </Link>
                            <a href="#services" className="btn-replica-outline">
                                Explore Programs
                            </a>
                        </div>

                        <div className="hero-replica-v2__trust">
                            <div className="hero-replica-v2__trust-card">
                                <strong>Private by design</strong>
                                <span>Confidential sessions with a clear support plan.</span>
                            </div>
                            <div className="hero-replica-v2__mini-stats">
                                <div>
                                    <strong>200+</strong>
                                    <span>guided clients</span>
                                </div>
                                <div>
                                    <strong>7 days</strong>
                                    <span>booking flexibility</span>
                                </div>
                                <div>
                                    <strong>1:1</strong>
                                    <span>focused care</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hero-replica-v2__visual fade-in">
                        <div className="hero-replica-v2__visual-shell">
                            <div className="hero-replica-v2__badge hero-replica-v2__badge--top">
                                <span className="hero-replica-v2__badge-label">Care focus</span>
                                <strong>Calm, clarity, direction</strong>
                            </div>

                            <div className="hero-replica-v2__image-side">
                                <div className="replica-v2-image-wrapper">
                                    <img src="/Ellipse 4.png" alt="Bloom wellness support" className="replica-v2-hero-img" />
                                </div>
                            </div>

                            <div className="hero-replica-v2__support-card">
                                <span className="hero-replica-v2__support-kicker">What you get</span>
                                <ul className="hero-replica-v2__support-list">
                                    <li>One-on-one guided sessions</li>
                                    <li>Goal-oriented emotional support</li>
                                    <li>Flexible online booking</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Coaching Programs Section ─── */}
            <section className="section-coaching" id="services">
                <div className="container">
                    <div className="section-header-centered">
                        <h2 className="display-title">COACHING PROGRAMS</h2>
                        <p className="subtitle">Select the program that matches your goals and commitment level</p>
                    </div>

                    <div className="programs-layout">
                        {/* Timeline Connector */}
                        <div className="programs-timeline" aria-hidden="true">
                            <div className="timeline-line"></div>
                            <div className="timeline-node top"></div>
                            <div className="timeline-node mid"></div>
                            <div className="timeline-node low"></div>
                            <div className="timeline-node bottom"></div>
                        </div>

                        <div className="programs-grid">
                            <div className="program-card left fade-in">
                                <div className="program-icon-box">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06z"></path>
                                    </svg>
                                </div>
                                <div className="program-content">
                                    <h3>INDIVIDUAL COACHING</h3>
                                    <p>One-on-one sessions focused on building mental strength and achieving your personal goals.</p>
                                    <Link to="/booking" className="learn-more-link">LEARN MORE —</Link>
                                </div>
                            </div>

                            <div className="program-card right fade-in">
                                <div className="program-icon-box">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                </div>
                                <div className="program-content">
                                    <h3>GROUP SESSIONS</h3>
                                    <p>Join others on the same path. Build accountability, share experiences, and grow stronger together.</p>
                                    <Link to="/booking" className="learn-more-link">LEARN MORE —</Link>
                                </div>
                            </div>

                            <div className="program-card left fade-in">
                                <div className="program-icon-box">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                        <line x1="8" y1="21" x2="16" y2="21"></line>
                                        <line x1="12" y1="17" x2="12" y2="21"></line>
                                    </svg>
                                </div>
                                <div className="program-content">
                                    <h3>ONLINE COACHING</h3>
                                    <p>Flexible virtual sessions that fit your schedule. Get the support you need, anywhere you are.</p>
                                    <Link to="/booking" className="learn-more-link">LEARN MORE —</Link>
                                </div>
                            </div>

                            <div className="program-card right fade-in">
                                <div className="program-icon-box">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                    </svg>
                                </div>
                                <div className="program-content">
                                    <h3>MESSAGE SUPPORT</h3>
                                    <p>Stay on track between sessions with direct message support and accountability check-ins.</p>
                                    <Link to="/booking" className="learn-more-link">LEARN MORE —</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── What Sets Us Apart Section ─── */}
            <section className="section-apart" id="about">
                <div className="container">
                    <div className="section-header-centered">
                        <h2 className="display-title">WHAT SETS US APART</h2>
                        <p className="subtitle">real results come from structure, commitment, and support 💪</p>
                    </div>

                    <div className="apart-grid">
                        <div className="apart-card fade-in">
                            <div className="apart-icon-circle">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                </svg>
                            </div>
                            <h3>CONFIDENTIAL</h3>
                            <p>Your sessions are 100% confidential. What you share stays private, always.</p>
                        </div>

                        <div className="apart-card fade-in">
                            <div className="apart-icon-circle">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                            </div>
                            <h3>FLEXIBLE</h3>
                            <p>Sessions available 7 days a week including early mornings and evenings to fit your schedule.</p>
                        </div>

                        <div className="apart-card fade-in">
                            <div className="apart-icon-circle">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                                </svg>
                            </div>
                            <h3>CERTIFIED</h3>
                            <p>Licensed professional with certifications in cognitive behavioral therapy and performance coaching.</p>
                        </div>

                        <div className="apart-card fade-in">
                            <div className="apart-icon-circle">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                                    <line x1="9" y1="9" x2="9.01" y2="9"></line>
                                    <line x1="15" y1="9" x2="15.01" y2="9"></line>
                                </svg>
                            </div>
                            <h3>NO JUDGMENT</h3>
                            <p>Show up exactly as you are. This is a space for honesty, growth, and real progress.</p>
                        </div>
                    </div>

                    <div className="stats-banner glass-card fade-in">
                        <div className="stats-banner-grid">
                            <div className="stats-banner-item">
                                <span className="val">200+</span>
                                <span className="tit">clients coached</span>
                            </div>
                            <div className="stats-banner-divider"></div>
                            <div className="stats-banner-item">
                                <span className="val">3+</span>
                                <span className="tit">years of experience</span>
                            </div>
                            <div className="stats-banner-divider"></div>
                            <div className="stats-banner-item">
                                <span className="val">98%</span>
                                <span className="tit">satisfaction rate</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Verse of the Day Section ─── */}
            <section className="verse-section">
                <div className="container">
                    <div className="verse-card fade-in">
                        <div className="verse-icon">📖</div>
                            <h3 className="verse-title">Verse of the Day 🌿</h3>
                        <blockquote className="verse-text">
                            "For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."
                        </blockquote>
                        <cite className="verse-reference">— Jeremiah 29:11</cite>
                    </div>
                </div>
            </section>

            {/* ─── Transformation CTA Section ─── */}
            <section className="transformation-cta-section">
                <div className="container">
                    <div className="transformation-card fade-in">
                        {/* Elegant Glassmorphism Decor */}
                        <div className="transformation-inner-glow" aria-hidden="true"></div>

                        {/* Floating Decorators */}
                        <div className="float-decor decor-top-right" style={{ '--rot': '10deg' }}></div>
                        <div className="float-decor decor-bottom-left" style={{ '--rot': '-15deg' }}></div>

                        <div className="card-header-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                            </svg>
                        </div>

                        <h2 className="transformation-title">START YOUR TRANSFORMATION ⚡</h2>

                        <p className="transformation-desc">
                            Take the first step toward real change. Book a free 30-minute
                            consultation to discuss your goals and create an action plan. No
                            commitment, just results.
                        </p>

                        <div className="transformation-pills">
                            <div className="pill-item">✓ FREE CALL</div>
                            <div className="pill-item">✓ NO OBLIGATION</div>
                            <div className="pill-item">✓ CONFIDENTIAL</div>
                        </div>

                        <div className="transformation-action">
                            <Link to="/booking" className="btn-transformation">
                                BOOK FREE CONSULTATION
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>

                        <div className="transformation-footer">
                            Join 200+ clients who've transformed their lives
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
