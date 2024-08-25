import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Items.css';

function Items() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [itemForm, setItemForm] = useState({
        name: '',
        category: '',
        description: '',
        weight: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                
                const [itemsResponse, categoriesResponse] = await Promise.all([
                    axios.get('http://localhost:3001/item/items', { headers }),
                    axios.get('http://localhost:3001/category/categories', { headers })
                ]);

                setItems(itemsResponse.data);
                setCategories(categoriesResponse.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Error fetching data');
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const openModal = (item = null) => {
        if (item) {
            setEditMode(true);
            setItemForm({ ...item });
        } else {
            setEditMode(false);
            setItemForm({
                name: '',
                category: categories.length > 0 ? categories[0]._id : '',
                description: '',
                weight: 0,
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleSaveItem = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            if (editMode) {
                await axios.put(`http://localhost:3001/item/item/${itemForm._id}`, itemForm, { headers });
            } else {
                await axios.post('http://localhost:3001/item/item', itemForm, { headers });
            }

            const response = await axios.get('http://localhost:3001/item/items', { headers });
            setItems(response.data);
            closeModal();
        } catch (error) {
            console.error('Error saving item:', error);
            setError('Error saving item');
        }
    };

    const handleDeleteItem = async (itemId) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            await axios.delete(`http://localhost:3001/item/item/${itemId}`, { headers });

            const response = await axios.get('http://localhost:3001/item/items', { headers });
            setItems(response.data);
        } catch (error) {
            console.error('Error deleting item:', error);
            setError('Error deleting item');
        }
    };

    if (loading) return <p className="loading">Loading...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="items-container">
            <h2>Items</h2>
            <div className="items-row">
                {items.length > 0 ? (
                    items.map((item) => (
                        <div key={item._id} className="item-card">
                            <h3 className="item-name">{item.name}</h3>
                            <p className="item-category">Category: {item.category.name}</p>
                            <p className="item-description">{item.description}</p>
                            <p className="item-weight">Weight: {item.weight} kg</p>
                            <div className="item-buttons">
                                <button 
                                    className="button edit-button" 
                                    onClick={() => openModal(item)}
                                >
                                    Edit
                                </button>
                                <button 
                                    className="button delete-button" 
                                    onClick={() => handleDeleteItem(item._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-items">No items found</p>
                )}
                <div className="item-card add-item-card" onClick={() => openModal()}>
                    <div className="plus-icon">+</div>
                    <div className="add-text">Add Item</div>
                </div>
            </div>

            {/* Modal for adding/editing an item */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>{editMode ? 'Edit Item' : 'Add New Item'}</h3>
                        <form onSubmit={(e) => { e.preventDefault(); handleSaveItem(); }}>
                            <label>Name</label>
                            <input 
                                type="text" 
                                value={itemForm.name} 
                                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                                required 
                            />

                            <label>Category</label>
                            <select 
                                value={itemForm.category} 
                                onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                                required
                            >
                                {categories.map((category) => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                            <label>Description</label>
                            <textarea 
                                value={itemForm.description} 
                                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                            />

                            <label>Weight (kg)</label>
                            <input 
                                type="number" 
                                value={itemForm.weight} 
                                onChange={(e) => setItemForm({ ...itemForm, weight: parseFloat(e.target.value) })}
                                required 
                            />

                            <div className="modal-buttons">
                                <button type="submit" className="button save-button">
                                    {editMode ? 'Save Changes' : 'Add Item'}
                                </button>
                                <button type="button" className="button cancel-button" onClick={closeModal}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Items;
