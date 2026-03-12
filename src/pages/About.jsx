import React, { useEffect } from 'react'
import './About.css'

export default function About() {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className="about-page">
            <section className="about-hero-replica">
                <div className="geometric-pattern"></div>
                <div className="container about-hero-replica__inner">
                    <div className="about-hero-replica__content fade-in">
                        <span className="about-hero-replica__label">Our Mission 🌿</span>
                        <h1 className="about-hero-replica__title">
                            GUIDING <br />
                            YOUR PATH <br />
                            TO BLOOM
                        </h1>
                        <p className="about-hero-replica__subtitle">
                            Bloom is more than a platform; it's a dedicated community 
                            where professional mentorship meets compassionate 
                            support. We seek to empower individuals through 
                            transparency, commitment, and growth.
                        </p>
                    </div>
                    <div className="about-hero-replica__image-side fade-in">
                        <div className="about-replica-image-wrapper">
                            <img src="/Ellipse 1.png" alt="Bloom Illustration" className="about-replica-hero-img" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="mentor-mission">
                <div className="container">
                    <div className="mission-grid">
                        <div className="mission-text fade-in">
                            <h2 className="section-title">WHAT WE SEEK TO DO</h2>
                            <p>
                                Our mentors are not just guides; they are partners in your transformation.
                                We are committed to creating a space where every individual feels seen,
                                heard, and supported. Our goal is to bridge the gap between where you
                                are today and where you aspire to be.
                            </p>
                            <div className="mission-features">
                                <div className="m-feat">
                                    <div className="m-feat-icon">🎯</div>
                                    <div className="m-feat-txt">
                                        <strong>Goal-Oriented</strong>
                                        <span>Structured paths for real results</span>
                                    </div>
                                </div>
                                <div className="m-feat">
                                    <div className="m-feat-icon">🤝</div>
                                    <div className="m-feat-txt">
                                        <strong>Partnership</strong>
                                        <span>Walking alongside you every step</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mission-visual fade-in-delay-1">
                            <div className="visual-card-premium">
                                <div className="visual-inner">
                                    <div className="floating-stat">
                                        <span className="s-val">100%</span>
                                        <span className="s-tit">Commitment</span>
                                    </div>
                                    <div className="mentor-graphic">
                                        <img
                                            src="/about_mission_growth_visual_1773136645307.png"
                                            alt="Growth Representation"
                                            className="mission-growth-img"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mentor-spotlight">
                <div className="container">
                    <div className="section-header-centered">
                        <span className="pill-label-glow">Expert Guidance</span>
                        <h2 className="display-title">MEET OUR MENTORS</h2>
                        <p className="subtitle-vibe">Professional excellence rooted in Christian faith.</p>
                    </div>
                    <div className="mentor-info-card glass-card-vibe fade-in">
                        <h3 className="holographic-title">Faith-Driven Mentorship</h3>
                        <p>
                            Our community is led by a diverse group of **Christian mentors** who are
                            leaders in their respective fields—from psychology and business to
                            creative arts. We believe that true growth happens when professional
                            expertise is combined with spiritual depth and compassionate values.
                        </p>
                        <div className="mentor-traits">
                            <div className="trait-pill">✓ FAITH-BASED</div>
                            <div className="trait-pill">✓ LICENSED EXPERTS</div>
                            <div className="trait-pill">✓ REAL VIBES ONLY</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="core-values">
                <div className="container">
                    <div className="section-header-centered">
                        <span className="section-label-vibe">Our Ethics 💎</span>
                        <h2 className="display-title">OUR CORE VALUES</h2>
                        <p className="subtitle-vibe">The foundation of every interaction at Bloom.</p>
                    </div>
                    <div className="values-grid">
                        {[
                            { title: 'Compassion', desc: 'Approaching every session with empathy and kindness.', icon: '🤍' },
                            { title: 'Integrity', desc: 'Building trust through honesty and transparency.', icon: '💎' },
                            { title: 'Excellence', desc: 'Striving for the highest standard in every interaction.', icon: '' },
                            { title: 'Inclusivity', desc: 'A safe space for everyone, regardless of their background.', icon: '🤝' }
                        ].map((v, i) => (
                            <div key={i} className={`value-card fade-in-delay-${i}`}>
                                <div className="v-icon">{v.icon}</div>
                                <div className="v-content">
                                    <h3>{v.title}</h3>
                                    <p>{v.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
