import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Blogs.css'

export default function Blogs() {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    const blogPosts = [
        {
            id: 1,
            title: "Finding Balance in a High-Performance World",
            category: "Mental Health",
            date: "March 8, 2026",
            excerpt: "Learn how to manage stress and maintain peak performance without burning out. Our expert mentors share their top 5 strategies.",
            author: "Gloria S."
        },
        {
            id: 2,
            title: "The Power of Regular Reflection",
            category: "Growth",
            date: "March 5, 2026",
            excerpt: "Discover why spending just 10 minutes a day reflecting on your journey can accelerate your progress by 40% based on recent studies.",
            author: "Team Bloom"
        },
        {
            id: 3,
            title: "Navigating Career Transitions with Confidence",
            category: "Career",
            date: "March 1, 2026",
            excerpt: "Moving from one role to another can be daunting. Here's a step-by-step guide to making your next big move with a clear mindset.",
            author: "Alex M."
        }
    ]

    return (
        <div className="blogs-page">
            <section className="blogs-hero">
                <div className="container">
                    <div className="blogs-hero-content fade-in">
                        <span className="section-label">Insights & Growth</span>
                        <h1 className="display-title">THE BLOOM <span className="text-accent">JOURNAL</span></h1>
                        <p className="blogs-subtitle">
                            Explore articles, insights, and stories from our community of mentors and experts.
                        </p>
                    </div>
                </div>
            </section>

            <section className="blogs-grid-section">
                <div className="container">
                    <div className="blogs-filters">
                        <button className="filter-btn active">All Posts</button>
                        <button className="filter-btn">Mental Health</button>
                        <button className="filter-btn">Career</button>
                        <button className="filter-btn">Growth</button>
                    </div>

                    <div className="blogs-grid">
                        {blogPosts.map((post, i) => (
                            <div key={post.id} className={`blog-card fade-in-delay-${i}`}>
                                <div className="blog-card-header">
                                    <span className="blog-category">{post.category}</span>
                                    <span className="blog-date">{post.date}</span>
                                </div>
                                <h2 className="blog-title">{post.title}</h2>
                                <p className="blog-excerpt">{post.excerpt}</p>
                                <div className="blog-footer">
                                    <div className="blog-author">
                                        <div className="author-avatar">{post.author[0]}</div>
                                        <span>By {post.author}</span>
                                    </div>
                                    <Link to={`/blogs/${post.id}`} className="read-more">
                                        Read Article
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="blogs-pagination">
                        <button className="btn btn-secondary" disabled>Next Page —</button>
                    </div>
                </div>
            </section>
        </div>
    )
}
