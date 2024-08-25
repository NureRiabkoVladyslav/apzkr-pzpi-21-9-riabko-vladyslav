import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
    // Состояния для формы регистрации
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('passenger'); // Устанавливаем начальное значение роли
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Обработчик отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Проверяем совпадение паролей
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        // Формируем данные для запроса
        const requestData = { name, email, password, role, phone };
        console.log('Request Data:', requestData); // Логирование тела запроса

        try {
            // Отправляем данные на сервер
            const response = await axios.post('http://localhost:3001/auth/register', requestData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('Response Data:', response.data); // Логирование ответа сервера
            navigate('/login'); // Перенаправляем пользователя на страницу входа
        } catch (err) {
            console.error('Error:', err.response); // Логирование ошибки
            setError(err.response?.data?.message || 'An error occurred');
        }
        setLoading(false);
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            <form onSubmit={handleSubmit} className="register-form">
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="phone">Phone:</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="role">Role:</label>
                    <select
                        id="role"
                        name="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                    >
                        <option value="passenger">Passenger</option>
                        <option value="customs_officer">Customs officer</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit" className="register-button" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
            <p className="login-link">
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
}

export default Register;
