import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './Profile.css';

function Profile() {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                const response = await axios.get(`http://localhost:3001/user/user/${userId}`, { headers });
                setUser(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching profile:', error);
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const formatRole = (role) => {
        const formattedRole = role.replace('_', ' ');
        return formattedRole.charAt(0).toUpperCase() + formattedRole.slice(1);
    };

    const handleExportDeclarations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3001/export/export-declarations/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob', 
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'declarations_export.xlsx');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting declarations:', error);
        }
    };

    const handleExportItems = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3001/export/export-items`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob', 
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'items_export.xlsx');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting items:', error);
        }
    };

    if (loading) return <p className="loading">Loading...</p>;
    if (!user) return <p className="user-not-found">User not found</p>;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h2 className="profile-name">{user.name}</h2>
                <p className="profile-email">{user.email}</p>
            </div>
            <div className="profile-details">
                <div className="profile-detail">
                    <label>Phone</label>
                    <p>{user.phone || '-'}</p>
                </div>
                <div className="profile-detail">
                    <label>Role</label>
                    <p>{formatRole(user.role)}</p>
                </div>
            </div>

            <div className="role-container">
                {user.role === 'passenger' && (
                    <>
                        <button className="profile-action-button" onClick={() => navigate(`/user/${userId}/baggages`)}>My Baggage</button>
                        <button className="profile-action-button" onClick={() => navigate(`/user/${userId}/declarations`)}>My Declarations</button>
                        <button className="profile-action-button export-button" onClick={handleExportDeclarations}>
                            Export Declarations
                        </button>
                    </>
                )}

                {user.role === 'customs_officer' && (
                    <>
                        <button className="profile-action-button" onClick={() => navigate(`/user/${userId}/baggages-to-check`)}>Baggage to Check</button>
                        <button className="profile-action-button" onClick={() => navigate(`/user/${userId}/inspections`)}>My Inspections</button>
                    </>
                )}

                {user.role === 'admin' && (
                    <>
                        <button className="profile-action-button" onClick={() => navigate(`/user/${userId}/manage-items`)}>Manage Items</button>
                        <button className="profile-action-button" onClick={() => navigate(`/user/${userId}/manage-categories`)}>Manage Categories</button>
                        <button className="profile-action-button export-button" onClick={handleExportItems}>
                            Export Items
                        </button>
                    </>
                )}
            </div>

            <div className="profile-actions">
                <button className="profile-action-button" onClick={() => navigate(`/user/${userId}/edit`)}>
                    Edit Profile
                </button>
                <button className="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Profile;
