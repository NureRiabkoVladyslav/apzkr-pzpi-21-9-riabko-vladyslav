import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './EditProfile.css';

function EditProfile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'passenger',
    });
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        if (name === 'currentPassword') setCurrentPassword(value);
        else if (name === 'newPassword') setNewPassword(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            await axios.put(`http://localhost:3001/user/user/${userId}`, user, { headers });

            if (currentPassword && newPassword) {
                await axios.put(`http://localhost:3001/user/user/${userId}/change-password`,
                    { currentPassword, newPassword },
                    { headers });
            }

            navigate(`/user/${userId}`);
        } catch (error) {
            setError('Error updating profile');
            setLoading(false);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="edit-profile-container">
            <h2>Edit Profile</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={user.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={user.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="phone">Phone:</label>
                    <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={user.phone}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label htmlFor="role">Role:</label>
                    <select
                        id="role"
                        name="role"
                        value={user.role}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="passenger">Passenger</option>
                        <option value="customs_officer">Customs Officer</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="currentPassword">Current Password:</label>
                    <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={currentPassword}
                        onChange={handlePasswordChange}
                    />
                </div>
                <div>
                    <label htmlFor="newPassword">New Password:</label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={newPassword}
                        onChange={handlePasswordChange}
                    />
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Profile'}
                </button>
            </form>
        </div>
    );
}

export default EditProfile;
