import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Declarations.css';

const statusLabels = {
    'under_review': 'Under Review',
    'waiting_for_inspection': 'Waiting for Inspection',
    'canceled': 'Canceled',
    'waiting_payment': 'Waiting Payment',
    'completed': 'Completed',
    'awaiting_additional_review': 'Awaiting Additional Review',
    'restricted': 'Restricted'
};

function UserDeclarations() {
    const { userId } = useParams();
    const [declarations, setDeclarations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDeclaration, setSelectedDeclaration] = useState(null);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');

    useEffect(() => {
        const fetchDeclarations = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                const response = await axios.get(`http://localhost:3001/declaration/${userId}/declarations`, { headers });
                const declarationsData = response.data;

                const fetchUserNames = async () => {
                    const userPromises = declarationsData.map(async (declaration) => {
                        try {
                            const userResponse = await axios.get(`http://localhost:3001/user/user/${declaration.passenger}`, { headers });
                            return {
                                ...declaration,
                                passengerName: userResponse.data.name
                            };
                        } catch (error) {
                            console.error('Error fetching user data:', error);
                            return {
                                ...declaration,
                                passengerName: 'Unknown'
                            };
                        }
                    });

                    return Promise.all(userPromises);
                };

                const declarationsWithNames = await fetchUserNames();
                setDeclarations(declarationsWithNames);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching declarations:', error);
                setError('Error fetching declarations');
                setLoading(false);
            }
        };
        fetchDeclarations();
    }, [userId]);

    const handlePayment = async () => {
        if (cardNumber && expiryDate && cvv) {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                await axios.post(`http://localhost:3001/user/user/pay`, {
                    declarationId: selectedDeclaration._id,
                }, { headers });

                alert('Payment successful!');
                setShowPaymentForm(false);
                setCardNumber('');
                setExpiryDate('');
                setCvv('');

                const response = await axios.get(`http://localhost:3001/declaration/${userId}/declarations`, { headers });
                const declarationsData = response.data;

                const fetchUserNames = async () => {
                    const userPromises = declarationsData.map(async (declaration) => {
                        try {
                            const userResponse = await axios.get(`http://localhost:3001/user/user/${declaration.passenger}`, { headers });
                            return {
                                ...declaration,
                                passengerName: userResponse.data.name
                            };
                        } catch (error) {
                            console.error('Error fetching user data:', error);
                            return {
                                ...declaration,
                                passengerName: 'Unknown'
                            };
                        }
                    });

                    return Promise.all(userPromises);
                };

                const declarationsWithNames = await fetchUserNames();
                setDeclarations(declarationsWithNames);
                setSelectedDeclaration(null);
            } catch (error) {
                console.error('Error during payment:', error);
                setError('Error during payment');
            }
        } else {
            alert('Please fill in all card details.');
        }
    };

    if (loading) return <p className="loading">Loading...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="declarations-container">
            <h2>Your Declarations</h2>
            <div className="declarations-grid">
                {declarations.length > 0 ? (
                    declarations.map((declaration, index) => (
                        <div
                            key={declaration._id}
                            className={`declaration-card ${selectedDeclaration && selectedDeclaration._id === declaration._id ? 'selected' : ''}`}
                            onClick={() => setSelectedDeclaration(declaration)}
                        >
                            <p className="declaration-title">Declaration {index + 1}</p>
                            <p className={`declaration-passenger ${declaration.passengerName ? '' : 'unknown'}`}>Passenger: {declaration.passengerName || 'Unknown'}</p>
                            <p className={`declaration-status ${declaration.status}`}>
                                Status: {statusLabels[declaration.status] || 'Unknown Status'}
                            </p>
                            <p className="declaration-total-cost">
                                Total Cost: {declaration.totalCost ? `$${declaration.totalCost}` : 'N/A'}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="no-declarations">No declarations found</p>
                )}
            </div>

            {selectedDeclaration && (
                <div className="declaration-details">
                    <h3>Declaration Details</h3>
                    <p><strong>Passenger:</strong> {selectedDeclaration.passengerName}</p>
                    <p><strong>Status:</strong> {statusLabels[selectedDeclaration.status] || 'Unknown Status'}</p>
                    <p><strong>Total Cost:</strong> {selectedDeclaration.totalCost ? `$${selectedDeclaration.totalCost}` : 'N/A'}</p>
                    <h4>Baggage Details:</h4>
                    <p><strong>Total Weight:</strong> {selectedDeclaration.baggage.totalWeight} kg</p>
                    <ul>
                        {selectedDeclaration.baggage.itemsList.map((item) => (
                            <li key={item._id}>
                                {item.item.name} - {item.quantity} pcs
                            </li>
                        ))}
                    </ul>

                    {/* Display "Pay" button if the status is "waiting_payment" */}
                    {selectedDeclaration.status === 'waiting_payment' && (
                        <>
                            <button
                                className="pay-button"
                                onClick={() => setShowPaymentForm(true)}
                            >
                                Pay
                            </button>

                            {showPaymentForm && (
                                <div className="payment-form">
                                    <h3>Payment Details</h3>
                                    <div>
                                        <label>Card Number</label>
                                        <input
                                            type="text"
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(e.target.value)}
                                            placeholder="Enter card number"
                                        />
                                    </div>
                                    <div>
                                        <label>Expiry Date</label>
                                        <input
                                            type="text"
                                            value={expiryDate}
                                            onChange={(e) => setExpiryDate(e.target.value)}
                                            placeholder="MM/YY"
                                        />
                                    </div>
                                    <div>
                                        <label>CVV</label>
                                        <input
                                            type="text"
                                            value={cvv}
                                            onChange={(e) => setCvv(e.target.value)}
                                            placeholder="Enter CVV"
                                        />
                                    </div>
                                    <button className="confirm-payment" onClick={handlePayment}>
                                        Confirm
                                    </button>
                                    <button className="cancel-payment" onClick={() => setShowPaymentForm(false)}>
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    <button className="close-details" onClick={() => setSelectedDeclaration(null)}>
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}

export default UserDeclarations;
