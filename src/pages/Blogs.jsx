import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import './Blogs.css'

export default function Blogs() {
    const [blogPosts, setBlogPosts] = React.useState([])
    const [loading, setLoading] = React.useState(true)

    useEffect(() => {
        window.scrollTo(0, 0)
        fetchBlogs()
    }, [])

    async function fetchBlogs() {
        try {
            const { data, error } = await supabase
                .from('blogs')
                .select(`
                    *,
                    author:profiles!blogs_author_id_fkey(full_name, avatar_url)
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setBlogPosts(data || [])
        } catch (e) {
            console.error('Error fetching blogs:', e)
        } finally {
            setLoading(false)
        }
    }

    const staticPosts = [
        {
            id: 's1',
            title: "Finding Balance in a High-Performance World",
            category: "Mental Health",
            created_at: "2026-03-08",
            excerpt: "Learn how to manage stress and maintain peak performance without burning out.",
            author: { full_name: "Gloria S." }
        },
        // ... other static posts if needed as fallback
    ]

    const displayPosts = blogPosts.length > 0 ? blogPosts : (loading ? [] : staticPosts)

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
                        {displayPosts.map((post, i) => {
                            const dateStr = post.created_at ? new Date(post.created_at).toLocaleDateString(undefined, {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            }) : post.date;

                            const authorName = post.author?.full_name || post.author || "Team Bloom";

                            return (
                                <div key={post.id} className={`blog-card fade-in-delay-${i % 3}`}>
                                    <div className="blog-card-header">
                                        <span className="blog-category">{post.category}</span>
                                        <span className="blog-date">{dateStr}</span>
                                    </div>
                                    <h2 className="blog-title">{post.title}</h2>
                                    <p className="blog-excerpt">{post.excerpt}</p>
                                    <div className="blog-footer">
                                        <div className="blog-author">
                                            <div className="author-avatar">{authorName[0]}</div>
                                            <span>By {authorName}</span>
                                        </div>
                                        <Link to={`/blogs/${post.id}`} className="read-more">
                                            Read Article
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="blogs-pagination">
                        <button className="btn btn-secondary" disabled>Next Page —</button>
                    </div>
                </div>
            </section>
        </div>
    )
}
