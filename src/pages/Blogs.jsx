import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import './Blogs.css'

export default function Blogs() {
    const [blogPosts, setBlogPosts] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [page, setPage] = React.useState(0)
    const [hasMore, setHasMore] = React.useState(true)
    const POSTS_PER_PAGE = 6

    useEffect(() => {
        window.scrollTo(0, 0)
        fetchBlogs(0)
    }, [])

    async function fetchBlogs(pageNum) {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('blogs')
                .select(`
                    *,
                    author:profiles!blogs_author_id_fkey(full_name, avatar_url)
                `)
                .order('created_at', { ascending: false })
                .range(pageNum * POSTS_PER_PAGE, (pageNum + 1) * POSTS_PER_PAGE - 1)

            if (error) throw error
            
            if (pageNum === 0) {
                setBlogPosts(data || [])
            } else {
                setBlogPosts(prev => [...prev, ...data])
            }
            
            setHasMore(data.length === POSTS_PER_PAGE)
        } catch (e) {
            console.error('Error fetching blogs:', e)
        } finally {
            setLoading(false)
        }
    }

    const handleNextPage = () => {
        const nextPg = page + 1
        setPage(nextPg)
        fetchBlogs(nextPg)
    }

    const staticPosts = [
        {
            id: 's1',
            title: "Finding Balance in a High-Performance World",
            category: "Mental Health",
            created_at: "2026-03-08",
            excerpt: "Learn how to manage stress and maintain peak performance without burning out.",
            author: { full_name: "Gloria S." }
        }
    ]

    const displayPosts = blogPosts.length > 0 ? blogPosts : (loading && page === 0 ? [] : staticPosts)

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
                            }) : "Recent Post";

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

                    {hasMore && (
                        <div className="blogs-pagination">
                            <button className="btn btn-secondary" onClick={handleNextPage}>
                                {loading ? 'Loading...' : 'Load More Insights —'}
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
