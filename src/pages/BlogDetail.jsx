import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabase'
import './Blogs.css'

export default function BlogDetail() {
    const { blogId } = useParams()
    const [post, setPost] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        window.scrollTo(0, 0)
        fetchPost()
    }, [blogId])

    async function fetchPost() {
        try {
            const { data, error } = await supabase
                .from('blogs')
                .select(`
                    *,
                    author:profiles!blogs_author_id_fkey(full_name, avatar_url, bio)
                `)
                .eq('id', blogId)
                .single()

            if (error) throw error
            setPost(data)
        } catch (e) {
            console.error('Error fetching blog post:', e)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="blogs-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="spinner"></div>
            </div>
        )
    }

    if (!post) {
        return (
            <div className="blogs-page">
                <div className="container" style={{ textAlign: 'center', padding: '10rem 0' }}>
                    <h1 className="display-title">Post Not Found</h1>
                    <p>The article you're looking for doesn't exist.</p>
                    <Link to="/blogs" className="btn btn-primary mt-4">Back to Blogs</Link>
                </div>
            </div>
        )
    }

    const dateStr = post.created_at ? new Date(post.created_at).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    }) : 'Recent Post'

    const authorName = post.author?.full_name || "Team Bloom"

    return (
        <div className="blogs-page">
            <section className="blog-detail-hero">
                <div className="container narrow">
                    <Link to="/blogs" className="back-link mb-5">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back to Journal
                    </Link>
                    <span className="blog-category-label">{post.category}</span>
                    <h1 className="blog-detail-title">{post.title}</h1>
                    <div className="blog-detail-meta">
                        <div className="author-info">
                            <div className="author-avatar-large">{authorName[0]}</div>
                            <div className="author-text">
                                <span className="author-name">By {authorName}</span>
                                <span className="post-date">{dateStr}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="blog-detail-content">
                <div className="container narrow">
                    <div className="article-body fade-in">
                        {post.content.split('\n').map((para, i) => (
                            para.trim() && <p key={i}>{para}</p>
                        ))}
                    </div>
                    
                    <div className="author-bio-card mt-5">
                        <div className="author-avatar-bio">{authorName[0]}</div>
                        <div className="author-bio-text">
                            <h4>About {authorName}</h4>
                            <p>{post.author?.bio || 'Passionate about growth, mental health, and empowering others through shared insights and community support.'}</p>
                        </div>
                    </div>

                    <div className="blog-navigation-footer mt-5 pt-5">
                        <Link to="/blogs" className="btn btn-secondary w-100">Browse more insights —</Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
