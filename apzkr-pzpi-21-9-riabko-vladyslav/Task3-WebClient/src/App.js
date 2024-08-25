import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './components/Header/Header';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Profile from './components/Profile/Profile';
import EditProfile from './components/EditProfile/EditProfile';
import Baggages from './components/Baggages/Baggages';
import BaggagesToCheck from './components/BaggagesToCheck/BaggagesToCheck';
import Declarations from './components/Declarations/Declarations';
import Inspections from './components/Inspections/Inspections';
import Categories from './components/Categories/Categories';
import Items from './components/Items/Items';

function App() {
    return (
        <Router>
            <div className="app-container">
                <Header />
                <main className="main-content">
                    <Routes>
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/user/:userId" element={<Profile />} />
                        <Route path="/user/:userId/baggages" element={<Baggages />} />
                        <Route path="/user/:userId/inspections" element={<Inspections />} />
                        <Route path="/user/:userId/declarations" element={<Declarations />} />
                        <Route path="/user/:userId/baggages-to-check" element={<BaggagesToCheck />} />
                        <Route path="/user/:userId/edit" element={<EditProfile />} />
                        <Route path="/user/:userId/manage-categories" element={<Categories />} />
                        <Route path="/user/:userId/manage-items" element={<Items />} />
                        <Route path="/" element={
                            <div className="welcome-section">
                                <h1>Welcome to SecureBorder!</h1>
                                <p>Your ultimate solution for border management and security. Log in to access all functionalities.</p>
                            </div>
                        }/>
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
