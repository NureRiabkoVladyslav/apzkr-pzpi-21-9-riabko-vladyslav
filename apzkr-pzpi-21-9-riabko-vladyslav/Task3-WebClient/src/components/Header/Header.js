import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import './Header.css';
import axios from "axios";

function Header() {
    const [userId, setUserId] = useState(null);
    const [companyId, setCompanyId] = useState(null);
    const [userRole, setUserRole] = useState('user');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            setUserId(decodedToken.userId);
            setUserRole(decodedToken.role);
            const fetchUserData = async () => {
                try {
                    const headers = { Authorization: `Bearer ${token}` };
                    const response = await axios.get(`http://localhost:3001/user/${userId}`, {headers});
                    const user = response.data;
                    console.log(user);
                    setUserRole(user.role);
                    setCompanyId(user.company._id);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };
            if(userRole === 'admin') fetchUserData();
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, [location.pathname, userId, userRole]);


    return (
        <header className="header">
            <Link to="/" className="header-title">SecureBorder</Link>
            <div className="header-auth">
                {isAuthenticated ? (
                    <>
                        <Link to={`/user/${userId}`} className="header-link">Profile</Link>
                        {userRole === 'admin' && companyId && (
                            <Link to={`/company/${companyId}/edit`} className="header-link">Edit Company</Link>
                        )}
                    
                    </>
                ) : (
                    <>
                        <Link to="/login" className="header-link">Login</Link>
                        <Link to="/register" className="header-link">Register</Link>
                    </>
                )}
            </div>
        </header>
    );
}

export default Header;
