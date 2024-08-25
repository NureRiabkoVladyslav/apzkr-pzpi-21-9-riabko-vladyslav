import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Categories.css';

function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [categoryForm, setCategoryForm] = useState({
        _id: '',
        name: '',
        description: '',
        isProhibited: false,
        transportCost: 0,
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                const response = await axios.get('http://localhost:3001/category/categories', { headers });
                setCategories(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError('Error fetching categories');
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const openModal = (category = null) => {
        if (category) {
            setEditMode(true);
            setCategoryForm({ ...category });
        } else {
            setEditMode(false);
            setCategoryForm({
                name: '',
                description: '',
                isProhibited: false,
                transportCost: 0,
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleSaveCategory = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            if (editMode) {
                await axios.put(`http://localhost:3001/category/category/${categoryForm._id}`, categoryForm, { headers });
            } else {
                await axios.post('http://localhost:3001/category/category', categoryForm, { headers });
            }

            const response = await axios.get('http://localhost:3001/category/categories', { headers });
            setCategories(response.data);
            closeModal();
        } catch (error) {
            console.error('Error saving category:', error);
            setError('Error saving category');
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            await axios.delete(`http://localhost:3001/category/category/${categoryId}`, { headers });

            const response = await axios.get('http://localhost:3001/category/categories', { headers });
            setCategories(response.data);
        } catch (error) {
            console.error('Error deleting category:', error);
            setError('Error deleting category');
        }
    };

    if (loading) return <p className="loading">Loading...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="categories-container">
            <h2>Categories</h2>
            <div className="categories-row">
                {categories.length > 0 ? (
                    categories.map((category) => (
                        <div key={category._id} className="category-card">
                            <h3 className="category-name">{category.name}</h3>
                            <p className="category-description">{category.description}</p>
                            <p className="category-transport-cost">
                                Transport Cost: {category.transportCost} $
                            </p>
                            <p 
                                className={`category-is-prohibited ${category.isProhibited ? 'prohibited' : 'allowed'}`}
                            >
                                {category.isProhibited ? 'Prohibited' : 'Allowed'}
                            </p>
                            <div className="category-buttons">
                                <button 
                                    className="button edit-button" 
                                    onClick={() => openModal(category)}
                                >
                                    Edit
                                </button>
                                <button 
                                    className="button delete-button" 
                                    onClick={() => handleDeleteCategory(category._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-categories">No categories found</p>
                )}
                <div className="category-card add-category-card" onClick={() => openModal()}>
                    <div className="plus-icon">+</div>
                    <div className="add-text">Add Category</div>
                </div>
            </div>

            {}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>{editMode ? 'Edit Category' : 'Add New Category'}</h3>
                        <form onSubmit={(e) => { e.preventDefault(); handleSaveCategory(); }}>
                            <label>Name</label>
                            <input 
                                type="text" 
                                value={categoryForm.name} 
                                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                required 
                            />

                            <label>Description</label>
                            <textarea 
                                value={categoryForm.description} 
                                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                            />

                            <label>Transport Cost</label>
                            <input 
                                type="number" 
                                value={categoryForm.transportCost} 
                                onChange={(e) => setCategoryForm({ ...categoryForm, transportCost: parseFloat(e.target.value) })}
                                required 
                            />

                            <label>Status</label>
                            <select 
                                value={categoryForm.isProhibited} 
                                onChange={(e) => setCategoryForm({ ...categoryForm, isProhibited: e.target.value === 'true' })}
                            >
                                <option value="false">Allowed</option>
                                <option value="true">Prohibited</option>
                            </select>

                            <div className="modal-buttons">
                                <button type="submit" className="button save-button">
                                    {editMode ? 'Save Changes' : 'Add Category'}
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

export default Categories;
