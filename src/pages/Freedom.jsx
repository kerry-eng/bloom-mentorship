import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Freedom.css'

export default function Freedom() {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className="freedom-page">
            {/* ─── Hero Section ─── */}
            <section className="freedom-hero">
                <div className="freedom-hero__glow"></div>
                <div className="container">
                    <div className="freedom-hero__content fade-in">
                        <span className="freedom-hero__eyebrow">Positioned for your breakthrough</span>
                        <h1 className="freedom-hero__title">
                            You are not alone.
                            <br />
                            Freedom is possible.
                        </h1>
                        <p className="freedom-hero__subtitle">
                            Whether you’re battling addiction, identity struggles, or cycles you can’t break—healing starts with a single step of courage.
                        </p>
                        <div className="freedom-hero__actions">
                            <Link to="/booking" className="btn-replica-black">
                                Start Your Journey
                            </Link>
                            <Link to="/booking" className="btn-replica-outline">
                                Talk to a Mentor
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── What You May Be Facing ─── */}
            <section className="freedom-struggles">
                <div className="container">
                    <span className="section-tag">Identification without shame</span>
                    <h2 className="section-title-alt">What You May Be Facing</h2>
                    <p className="section-subtitle-alt">
                        We believe in naming the struggle so we can invite the solution. If you've been battling any of these patterns, there is a path forward.
                    </p>

                    <div className="struggles-grid">
                        <div className="struggle-card fade-in">
                            <span className="struggle-icon">⛓️</span>
                            <h3>Addiction</h3>
                            <p>Finding release from the grip of pornography, alcohol, substances, or repetitive destructive habits.</p>
                        </div>
                        <div className="struggle-card fade-in">
                            <span className="struggle-icon">🧩</span>
                            <h3>Identity & SSA</h3>
                            <p>Compassionate guidance for those navigating identity confusion or same-sex attraction with a heart for Biblical truth.</p>
                        </div>
                        <div className="struggle-card fade-in">
                            <span className="struggle-icon">🌿</span>
                            <h3>Emotional Trauma</h3>
                            <p>Addressing past wounds, rejection, and the deep-seated pain that keeps you anchored to your history.</p>
                        </div>
                        <div className="struggle-card fade-in">
                            <span className="struggle-icon">🌤️</span>
                            <h3>Anxiety & Cycles</h3>
                            <p>Breaking free from the paralyzing weight of depression, anxiety, and the cycles that feel impossible to break.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Biblical Foundation ─── */}
            <section className="freedom-truth">
                <div className="truth-glow"></div>
                <div className="container">
                    <div className="truth-grid">
                        <div className="truth-content fade-in">
                            <span className="section-tag" style={{ color: '#14b8a6' }}>The Anchor</span>
                            <h2>Rooted in Truth</h2>
                            <p>
                                We believe true, lasting freedom comes through the person of Jesus Christ. Our mentorship is anchored in the transforming power of the Word of God.
                            </p>
                        </div>
                        <div className="scripture-list fade-in">
                            <div className="scripture-item">
                                <p className="scripture-text">"So if the Son sets you free, you will be free indeed."</p>
                                <cite className="scripture-ref">— John 8:36</cite>
                            </div>
                            <div className="scripture-item">
                                <p className="scripture-text">"Do not conform to the pattern of this world, but be transformed by the renewing of your mind."</p>
                                <cite className="scripture-ref">— Romans 12:2</cite>
                            </div>
                            <div className="scripture-item">
                                <p className="scripture-text">"Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!"</p>
                                <cite className="scripture-ref">— 2 Corinthians 5:17</cite>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Path to Freedom (Framework) ─── */}
            <section className="freedom-path">
                <div className="container">
                    <div className="section-header-centered" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <span className="section-tag">The Architecture of Healing</span>
                        <h2 className="section-title-alt">The Path to Freedom</h2>
                        <p className="section-subtitle-alt">Our structured framework ensures you don't just find temporary relief, but lasting transformation.</p>
                    </div>

                    <div className="path-steps">
                        <div className="step-card fade-in">
                            <div className="step-num">1</div>
                            <h3>Awareness</h3>
                            <p>Identifying the root of the struggle and the underlying triggers that sustain the cycle.</p>
                        </div>
                        <div className="step-card fade-in">
                            <div className="step-num">2</div>
                            <h3>Surrender</h3>
                            <p>Inviting God into the process and choosing to let go of self-reliance for His strength.</p>
                        </div>
                        <div className="step-card fade-in">
                            <div className="step-num">3</div>
                            <h3>Healing</h3>
                            <p>Addressing the original trauma and emotional wounds through prayer and guided reflection.</p>
                        </div>
                        <div className="step-card fade-in">
                            <div className="step-num">4</div>
                            <h3>Renewal</h3>
                            <p>Rewiring thoughts and daily habits to align with your new identity in Christ.</p>
                        </div>
                        <div className="step-card fade-in">
                            <div className="step-num">5</div>
                            <h3>Accountability</h3>
                            <p>Walking in community with mentors who support your continued growth and steadiness.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Final CTA ─── */}
            <section className="freedom-cta">
                <div className="container">
                    <div className="freedom-cta__card fade-in">
                        <div className="freedom-cta__content">
                            <h2 className="section-title-alt" style={{ color: '#fff' }}>Start Your Freedom Journey Today</h2>
                            <p className="section-subtitle-alt" style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '3rem' }}>
                                Your story doesn't have to end in struggle. Step into the restoration that has already been prepared for you.
                            </p>
                            <div className="freedom-hero__actions">
                                <Link to="/booking" className="btn-replica-black" style={{ background: '#fff', color: '#0d9488' }}>
                                    Book a Confidential Session
                                </Link>
                                <Link to="/booking" className="btn-replica-outline" style={{ borderColor: 'rgba(255,255,255,0.5)' }}>
                                    Join a Support Group
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="disclaimer-box fade-in">
                        <p>
                            <strong>Disclaimer:</strong> Bloom offers spiritual mentorship and Biblical guidance. While we are committed to your growth, this is not a substitute for licensed clinical therapy or medical treatment. We encourage you to seek professional medical help if you are in immediate crisis.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}
