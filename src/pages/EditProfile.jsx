import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import DashboardLayout from '../components/DashboardLayout';
import './EditProfile.css';

const EditProfile = () => {
    const { user, profile, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');

    const [formData, setFormData] = useState({
        full_name: '',
        bio: '',
        location: 'Kenya',
        phone: '',
        interests: [],
        instagram_url: '',
        linkedin_url: '',
        twitter_url: ''
    });

    const interestOptions = [
        'Strategic Planning', 'Leadership Skills', 'Emotional Intelligence',
        'Time Management', 'Technical Growth', 'Creative Innovation',
        'Career Transition', 'Work-Life Balance'
    ];

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                bio: profile.bio || '',
                location: profile.location || 'Kenya',
                phone: profile.phone || '',
                interests: profile.interests || [],
                instagram_url: profile.instagram_url || '',
                linkedin_url: profile.linkedin_url || '',
                twitter_url: profile.twitter_url || ''
            });
        }
    }, [profile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleInterest = (interest) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSaveStatus('saving');

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    bio: formData.bio,
                    location: formData.location,
                    phone: formData.phone,
                    interests: formData.interests,
                    instagram_url: formData.instagram_url,
                    linkedin_url: formData.linkedin_url,
                    twitter_url: formData.twitter_url,
                })
                .eq('id', user.id);

            if (error) throw error;
            await refreshProfile(user.id);
            setSaveStatus('success');
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (err) {
            console.error('Error updating profile:', err);
            setSaveStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout activeView="overview">
            <div className="edit-profile-page fade-in">
                <div className="edit-profile-header">
                    <h1 className="display-title sm">Edit Profile</h1>
                    <p className="subtitle">Curate your professional presence.</p>
                </div>

                <form className="edit-profile-form mt-5" onSubmit={handleSave}>
                    <div className="form-section glass-card-vibe p-5">
                        <h3 className="section-title mb-4">Core Identity</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Njeri Kuria"
                                />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <select 
                                    name="location" 
                                    value={formData.location} 
                                    onChange={handleInputChange}
                                >
                                    <option value="Kenya">Kenya</option>
                                    <option value="United States">United States</option>
                                    <option value="United Kingdom">United Kingdom</option>
                                    <option value="Nigeria">Nigeria</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group mt-4">
                            <label>Professional Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                placeholder="Describe your mission and what you're working on..."
                                rows="4"
                            />
                        </div>

                        <div className="form-group mt-4">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="+254..."
                            />
                        </div>
                    </div>

                    <div className="form-section glass-card-vibe p-5 mt-4">
                        <h3 className="section-title mb-4">Focus Areas</h3>
                        <div className="interests-selection-grid">
                            {interestOptions.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    className={`interest-tag-btn ${formData.interests.includes(option) ? 'active' : ''}`}
                                    onClick={() => toggleInterest(option)}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-section glass-card-vibe p-5 mt-4">
                        <h3 className="section-title mb-4">Connections</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Instagram URL</label>
                                <input
                                    type="url"
                                    name="instagram_url"
                                    value={formData.instagram_url}
                                    onChange={handleInputChange}
                                    placeholder="https://instagram.com/your-brand"
                                />
                            </div>
                            <div className="form-group">
                                <label>LinkedIn URL</label>
                                <input
                                    type="url"
                                    name="linkedin_url"
                                    value={formData.linkedin_url}
                                    onChange={handleInputChange}
                                    placeholder="https://linkedin.com/in/username"
                                />
                            </div>
                            <div className="form-group">
                                <label>Twitter / X URL</label>
                                <input
                                    type="url"
                                    name="twitter_url"
                                    value={formData.twitter_url}
                                    onChange={handleInputChange}
                                    placeholder="https://x.com/username"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-actions mt-5">
                        <button 
                            type="button" 
                            className="btn btn-vibration-outline px-5 py-3" 
                            onClick={() => navigate('/dashboard')}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn btn-primary btn-vibration px-5 py-3"
                            disabled={loading}
                        >
                            {loading ? "Archiving..." : "Save Profile"}
                        </button>
                    </div>

                    {saveStatus === 'success' && (
                        <p className="save-message success mt-3 text-center">Profile updated successfully. Redirecting...</p>
                    )}
                    {saveStatus === 'error' && (
                        <p className="save-message error mt-3 text-center">Failed to update profile. Please try again.</p>
                    )}
                </form>
            </div>
        </DashboardLayout>
    );
};

export default EditProfile;
