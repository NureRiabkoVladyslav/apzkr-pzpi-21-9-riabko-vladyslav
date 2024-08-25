import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Baggages.css';

function UserBaggage() {
    const { userId } = useParams();
    const [baggages, setBaggages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBaggage, setSelectedBaggage] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [items, setItems] = useState([]);
    const [newBaggage, setNewBaggage] = useState({ itemsList: [] });
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        const fetchBaggages = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                const response = await axios.get(`http://localhost:3001/baggage/${userId}/baggages`, { headers });
                setBaggages(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching baggage:', error);
                setError('Error fetching baggage');
                setLoading(false);
            }
        };
        fetchBaggages();
    }, [userId]);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                const response = await axios.get('http://localhost:3001/item/items', { headers });
                setItems(response.data);
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };
        fetchItems();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewBaggage({
            ...newBaggage,
            [name]: value
        });
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const updatedItemsList = [...newBaggage.itemsList];
        updatedItemsList[index] = { ...updatedItemsList[index], [name]: value };
        setNewBaggage({ itemsList: updatedItemsList });
    };

    const addItem = () => {
        setNewBaggage({
            ...newBaggage,
            itemsList: [...newBaggage.itemsList, { item: '', quantity: '' }]
        });
    };

    const removeItem = (index) => {
        const updatedItemsList = [...newBaggage.itemsList];
        updatedItemsList.splice(index, 1);
        setNewBaggage({ itemsList: updatedItemsList });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            let response;
            if (isEditMode) {
                response = await axios.put(
                    `http://localhost:3001/baggage/baggage/${selectedBaggage._id}`,
                    { itemsList: newBaggage.itemsList },
                    { headers }
                );
                console.log('Baggage updated:', response.data);
            } else {
                response = await axios.post(
                    'http://localhost:3001/baggage/baggage',
                    { owner: userId, itemsList: newBaggage.itemsList },
                    { headers }
                );
                console.log('Baggage added:', response.data);
            }

            setNewBaggage({ itemsList: [] });
            setShowForm(false);
            setIsEditMode(false);
            setSelectedBaggage(null);

            const updatedResponse = await axios.get(`http://localhost:3001/baggage/${userId}/baggages`, { headers });
            setBaggages(updatedResponse.data);
        } catch (error) {
            console.error('Error submitting baggage:', error);
            setError(isEditMode ? 'Failed to update baggage' : 'Failed to add baggage');
        }
    };

    const handleEditClick = () => {
        setNewBaggage({ itemsList: selectedBaggage.itemsList });
        setShowForm(true);
        setIsEditMode(true);
    };

    const handleDeleteClick = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            await axios.delete(`http://localhost:3001/baggage/baggage/${selectedBaggage._id}`, { headers });
            console.log('Baggage deleted');

            const updatedResponse = await axios.get(`http://localhost:3001/baggage/${userId}/baggages`, { headers });
            setBaggages(updatedResponse.data);
            setSelectedBaggage(null);
            setShowForm(false);
        } catch (error) {
            console.error('Error deleting baggage:', error);
            setError('Failed to delete baggage');
        }
    };

    const handleCloseClick = () => {
        setSelectedBaggage(null);
        setShowForm(false);
        setIsEditMode(false);
    };

    if (loading) return <p className="loading">Loading...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="baggages-container">
            <h2>Your Baggages</h2>
            <div className="baggages-row">
                {baggages.length > 0 ? (
                    baggages.map((baggage, index) => (
                        <div
                            key={baggage._id}
                            className={`baggage-card ${baggage.status === 'restricted' ? 'restricted' : ''}`}
                            onClick={() => {
                                setSelectedBaggage(baggage);
                                setShowForm(false);
                                setIsEditMode(false);
                            }}
                        >
                            <p className="baggage-title">Baggage {index + 1}</p>
                            <p className="baggage-weight">Weight: {baggage.totalWeight} kg</p>
                        </div>
                    ))
                ) : (
                    <p className="no-baggages"></p>
                )}
                <div className="add-baggage-card" onClick={() => setShowForm(true)}>
                    <div className="plus-icon">+</div>
                    <div className="add-text">Add Baggage</div>
                </div>
            </div>

            {selectedBaggage && !showForm && (
                <div className="baggage-details">
                    <h3>Baggage Details</h3>
                    <p><strong>Total Weight:</strong> {selectedBaggage.totalWeight} kg</p>
                    <ul>
                        {selectedBaggage.itemsList.map((item, index) => (
                            <li key={index}>
                                {item.item.name} - {item.quantity} pcs
                            </li>
                        ))}
                    </ul>
                    <button className="edit-button" onClick={handleEditClick}>
                        Edit
                    </button>
                    <button className="delete-button" onClick={handleDeleteClick}>
                        Delete
                    </button>
                    <button className="close-button" onClick={handleCloseClick}>
                        Close
                    </button>
                </div>
            )}

            {showForm && (
                <div className="add-baggage-form">
                    <h3>{isEditMode ? 'Edit Baggage' : 'Add New Baggage'}</h3>
                    <form onSubmit={handleFormSubmit}>
                        {newBaggage.itemsList.map((item, index) => (
                            <div className="form-group" key={index}>
                                <div className="input-group">
                                    <label htmlFor={`item-${index}`}>Item {index + 1}</label>
                                    <select
                                        id={`item-${index}`}
                                        name="item"
                                        value={item.item._id || item.item}
                                        onChange={(e) => handleItemChange(index, e)}
                                        required
                                    >
                                        <option value="">Select an item</option>
                                        {items.map((i) => (
                                            <option key={i._id} value={i._id}>
                                                {i.name} - {i.weight} kg
                                            </option>
                                        ))}
                                    </select>
                                    <label htmlFor={`quantity-${index}`}>Quantity</label>
                                    <input
                                        type="number"
                                        id={`quantity-${index}`}
                                        name="quantity"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, e)}
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => removeItem(index)}
                                        className="remove-item-button"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={addItem}>
                            Add Item
                        </button>
                        <button type="submit">{isEditMode ? 'Update' : 'Add'} Baggage</button>
                        <button type="button" onClick={() => setShowForm(false)}>
                            Cancel
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default UserBaggage;
