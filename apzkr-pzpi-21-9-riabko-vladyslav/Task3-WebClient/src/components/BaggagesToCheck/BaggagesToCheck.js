import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './BaggagesToCheck.css';

function DeclarationsUnderReview() {
    const { userId } = useParams(); 
    const [declarations, setDeclarations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDeclarations = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                const response = await axios.get('http://localhost:3001/declaration/declarations/under_review', { headers });
                setDeclarations(response.data);
                setLoading(false);
            } catch (error) {
                console.error('No free baggages to inspect', error);
                setError('No free baggages to inspect');
                setLoading(false);
            }
        };
        fetchDeclarations();
    }, []);

    const handleTakeForInspection = async (declarationId) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await axios.post('http://localhost:3001/inspection/inspection', {
                declaration: declarationId,
                inspector: userId,
            }, { headers });

            console.log('Declaration taken for inspection:', response.data);

            setDeclarations(prevDeclarations => 
                prevDeclarations.filter(declaration => declaration._id !== declarationId)
            );
        } catch (error) {
            console.error('Error taking declaration for inspection:', error);
            setError('Failed to take declaration for inspection');
        }
    };

    if (loading) return <p className="loading">Loading...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="declarations-container">
            <h2>Baggages Ready for Inspection</h2>
            <div className="declarations-grid">
                {declarations.length > 0 ? (
                    declarations.map((declaration, index) => (
                        <div key={declaration._id} className="declaration-card">
                            <p className="declaration-title">Baggage {index + 1}</p>
                            <p className="declaration-passenger">Passenger: {declaration.passenger ? declaration.passenger.name : 'N/A'}</p>
                            <p className="declaration-status">Status: Ready for Inspection</p>
                            <div className="button-container">
                                <button
                                    className="inspect-button"
                                    onClick={() => handleTakeForInspection(declaration._id)}
                                >
                                    Take for Inspection
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-declarations">No baggages for inspection</p>
                )}
            </div>
        </div>
    );
}

export default DeclarationsUnderReview;
