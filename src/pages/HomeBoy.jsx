import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './HomeBoy.css'
// MoodCheckerBoy and JournalPreview removed from HomeBoy to be moved to Dashboard

const boyModePrograms = [
    {
        title: 'INDIVIDUAL COACHING',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
        ),
        desc: 'One-on-one sessions focused on building mental strength and achieving your personal goals.'
    },
    {
        title: 'GROUP SESSIONS',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        desc: 'Join others on the same path. Build accountability, share experiences, and grow stronger together.'
    },
    {
        title: 'ONLINE COACHING',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
        ),
        desc: 'Flexible virtual sessions that fit your schedule. Get the support you need, anywhere you are.'
    },
    {
        title: 'MESSAGE SUPPORT',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
        desc: 'Stay on track between sessions with direct message support and accountability check-ins.'
    }
]

export default function HomeBoy() {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className="home-boy-container">
            {/* ─── Hero Section ─── */}
            <section className="hero-boy-v2">
                <div className="hero-boy-orbs">
                    <div className="boy-orb boy-orb-left"></div>
                    <div className="boy-orb boy-orb-right"></div>
                </div>

                <div className="boy-container">
                    <div className="hero-boy-layout-v2">

                        {/* LEFT: Text Card */}
                        <div className="hero-boy-card">
                            <div className="boy-washi-tape tape-top-center"></div>

                            <div className="boy-badge-row">
                                <span className="boy-tag"><span className="muscle-icon">💪</span> a powerful truth...</span>
                            </div>

                            <h1 className="boy-card-title">YOU ARE STRONG<br />ENOUGH TO HEAL</h1>

                            <p className="boy-card-desc">
                                Let's navigate this journey together. Building a solid foundation where your strength is recognized, your challenges are met head-on, and your progress is undeniable. <span className="teal-heart">💚</span>
                            </p>

                            <div className="boy-card-author">
                                <span className="boy-author-name">GLORIA ⚡</span>
                                <span className="boy-author-role">Mental Strength Coach</span>
                            </div>

                            <Link to="/booking" className="btn-boy-card">
                                BEGIN YOUR TRANSFORMATION <span className="sparkle-icon">✨</span>
                            </Link>

                            {/* Floating Quote Card */}
                            <div className="boy-floating-quote">
                                <div className="boy-washi-tape tape-top-left-sm"></div>
                                <p>"Strength doesn't come from what you can do. It comes from overcoming what you thought you couldn't"</p>
                                <span>- Rikki Rogers</span>
                            </div>

                            {/* Decorative Star */}
                            <div className="boy-star-decor">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="#a1e3d0" stroke="none">
                                    <path d="M12 2l2.4 7.6h7.6l-6.2 4.4 2.4 7.6-6.2-4.4-6.2 4.4 2.4-7.6-6.2-4.4h7.6z" />
                                </svg>
                            </div>
                        </div>

                        {/* RIGHT: Polaroid */}
                        <div className="hero-boy-visual-v2">
                            <div className="boy-polaroid-v2">
                                <div className="bg-decor-stars">
                                    <span className="sparkle-teal">✨</span>
                                </div>
                                <div className="boy-polaroid-img-box">
                                    {/* Placeholder for the real image */}
                                    <div className="img-placeholder bg-light-gray">
                                        <img src="/gloria-placeholder.png" alt="Gloria" onError={(e) => { e.target.style.display = 'none' }} />
                                    </div>
                                </div>
                                <div className="boy-polaroid-text">ready to level up with you ⚡</div>

                                {/* Badges */}
                                <div className="boy-stat-badge badge-top-right color-blue">
                                    <strong>200+</strong>
                                    <span>transformed</span>
                                </div>

                                <div className="boy-stat-badge badge-mid-right color-green">
                                    <strong>3 YRS</strong>
                                    <span>experience</span>
                                </div>

                                <div className="boy-stat-badge badge-bottom-left color-dark-teal">
                                    <strong>5★</strong>
                                    <span>top rated</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Mood Check In and Journal Preview moved to Dashboard */}


            {/* ─── Created with You in Mind ─── */}
            <section className="boy-features-section">
                <div className="boy-section-header">
                    <div className="boy-badge-pill">engineered for growth ⚡</div>
                    <h2 className="boy-section-title">Created with You in Mind</h2>
                </div>

                <div className="boy-features-grid">
                    <div className="boy-feature-card">
                        <div className="boy-icon-box">🔐</div>
                        <h3>Safe Space</h3>
                        <p>Your privacy & comfort are sacred here</p>
                    </div>
                    <div className="boy-feature-card">
                        <div className="boy-icon-box">💻</div>
                        <h3>Your Way</h3>
                        <p>Video, phone, or in-person - you choose</p>
                    </div>
                    <div className="boy-feature-card">
                        <div className="boy-icon-box">📅</div>
                        <h3>Flexible Times</h3>
                        <p>Sessions that fit your beautiful life</p>
                    </div>
                    <div className="boy-feature-card">
                        <div className="boy-icon-box">🤝</div>
                        <h3>Always Here</h3>
                        <p>Support whenever you need a friend</p>
                    </div>
                </div>
            </section>

            {/* ─── Coaching Programs ─── */}
            <section className="coaching-boy-section" id="services">
                <div className="coaching-boy-header">
                    <div className="coaching-bolt-icon">⚡</div>
                    <h2 className="coaching-boy-title">COACHING PROGRAMS</h2>
                    <p className="coaching-boy-subtitle">Select the program that matches your goals and commitment level 💪</p>
                </div>

                <div className="coaching-boy-container">
                    <div className="coaching-boy-grid">
                        {boyModePrograms.map((program, idx) => (
                            <div key={idx} className="coaching-boy-card">
                                <div className="coaching-icon-wrapper">
                                    {program.icon}
                                </div>
                                <h3 className="coaching-card-title">{program.title}</h3>
                                <p className="coaching-card-desc">{program.desc}</p>
                                <a href="#" className="coaching-learn-more">
                                    LEARN MORE <span className="arrow">→</span>
                                </a>

                                <div className="coaching-muscle-badge">💪</div>
                            </div>
                        ))}
                    </div>

                    <div className="coaching-cta-box">
                        <p>Need help choosing? Let's discuss your goals and find the right fit 💪</p>
                        <Link to="/booking" className="btn-coaching-cta">
                            FREE CONSULTATION
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── Success Stories ─── */}
            <section className="boy-success-section">
                <div className="coaching-boy-header">
                    <h2 className="coaching-boy-title">SUCCESS STORIES</h2>
                    <p className="coaching-boy-subtitle">real results from people who committed to change 💪</p>
                </div>

                <div className="boy-success-grid">
                    <div className="boy-success-card">
                        <div className="boy-success-avatar">M</div>
                        <div className="boy-success-content">
                            <h4>MARCUS T.</h4>
                            <span>Performance & Stress Management</span>
                            <div className="boy-stars">★★★★★</div>
                            <p>Alex's approach is direct and results-focused. He helped me build mental resilience and manage work stress. I'm more productive and balanced than ever.</p>
                        </div>
                        <div className="boy-star-badge">5<span className="star-icon">★</span></div>
                    </div>

                    <div className="boy-success-card">
                        <div className="boy-success-avatar">D</div>
                        <div className="boy-success-content">
                            <h4>DAVID K.</h4>
                            <span>Career Transition & Growth</span>
                            <div className="boy-stars">★★★★★</div>
                            <p>The accountability and structure Alex provides is exactly what I needed. His coaching helped me navigate a major career change with confidence.</p>
                        </div>
                        <div className="boy-star-badge">5<span className="star-icon">★</span></div>
                    </div>

                    <div className="boy-success-card">
                        <div className="boy-success-avatar">R</div>
                        <div className="boy-success-content">
                            <h4>RYAN M.</h4>
                            <span>Building Emotional Strength</span>
                            <div className="boy-stars">★★★★★</div>
                            <p>Alex helped me understand that asking for help is strength, not weakness. The tools and strategies I learned have transformed how I handle challenges.</p>
                        </div>
                        <div className="boy-star-badge">5<span className="star-icon">★</span></div>
                    </div>
                </div>

                <div className="boy-success-action">
                    <Link to="/booking" className="btn-boy-success">
                        <span className="emoji">💪</span> READY TO BECOME YOUR NEXT SUCCESS STORY? <span className="emoji">💪</span>
                    </Link>
                </div>
            </section>

            {/* ─── Final Book CTA Section ─── */}
            <section className="boy-final-cta-section">
                {/* Background decorative orbs mapped to the image */}
                <div className="cta-orb cta-orb-left"></div>
                <div className="cta-orb cta-orb-right"></div>

                <div className="boy-final-cta-card">
                    {/* Overlapping Badges */}
                    <div className="cta-badge-top">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                        </svg>
                    </div>
                    <div className="cta-badge-tr">💪</div>
                    <div className="cta-badge-bl">⚡</div>

                    <h2 className="cta-final-title">START YOUR TRANSFORMATION</h2>
                    <p className="cta-final-desc">
                        Take the first step toward real change. Book a free 30 minute consultation to discuss your goals and create an action plan. No commitment, just results. 💪
                    </p>

                    <div className="cta-benefits-row">
                        <div className="cta-benefit-pill">✓ FREE CALL</div>
                        <div className="cta-benefit-pill">✓ NO OBLIGATION</div>
                        <div className="cta-benefit-pill">✓ CONFIDENTIAL</div>
                    </div>

                    <Link to="/booking" className="btn-final-cta">
                        <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        BOOK FREE CONSULTATION <span className="arrow">→</span>
                    </Link>

                    <p className="cta-footer-text">
                        ⚡ Join 300+ clients who've transformed their lives ⚡
                    </p>
                </div>
            </section>
        </div>
    )
}
