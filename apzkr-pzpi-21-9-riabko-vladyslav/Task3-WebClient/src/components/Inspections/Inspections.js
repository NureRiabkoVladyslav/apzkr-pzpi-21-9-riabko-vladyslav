import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Inspections.css';

function UserInspections() {
    const { userId } = useParams();
    const [inspections, setInspections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedInspection, setSelectedInspection] = useState(null);
    const [editedNotes, setEditedNotes] = useState('');
    const [inspectors, setInspectors] = useState({});

    useEffect(() => {
        const fetchInspections = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                const response = await axios.get(`http://localhost:3001/inspection/${userId}/inspections`, { headers });
                setInspections(response.data);
                
                const fetchInspectors = async () => {
                    const inspectorPromises = response.data.map(async (inspection) => {
                        if (inspection.inspector && !inspectors[inspection.inspector]) {
                            try {
                                const inspectorResponse = await axios.get(`http://localhost:3001/user/user/${inspection.inspector}`, { headers });
                                setInspectors(prev => ({ ...prev, [inspection.inspector]: inspectorResponse.data.name }));
                            } catch (error) {
                                console.error('Error fetching inspector data:', error);
                            }
                        }
                        return inspection;
                    });
                    await Promise.all(inspectorPromises);
                };

                await fetchInspectors();
                setLoading(false);
            } catch (error) {
                console.error('Error fetching inspections:', error);
                setError('Error fetching inspections');
                setLoading(false);
            }
        };
        fetchInspections();
    }, [userId, inspectors]);

    const handleInspectClick = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.post('http://localhost:3001/inspection/doinspection', 
                { inspectionId: selectedInspection._id },
                { headers }
            );
            console.log('Inspection processed:', response.data);
            setSelectedInspection(null);
            const updatedResponse = await axios.get(`http://localhost:3001/inspection/${userId}/inspections`, { headers });
            setInspections(updatedResponse.data);
        } catch (error) {
            console.error('Error inspecting:', error);
            setError('Error processing inspection');
        }
    };

    const handleMakeAdditionalInspection = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.post('http://localhost:3001/inspection/finalinspection', 
                { inspectionId: selectedInspection._id },
                { headers }
            );
            console.log('Final inspection processed:', response.data);
            setSelectedInspection(null);
            const updatedResponse = await axios.get(`http://localhost:3001/inspection/${userId}/inspections`, { headers });
            setInspections(updatedResponse.data);
        } catch (error) {
            console.error('Error making additional inspection:', error);
            setError('Error processing additional inspection');
        }
    };

    const handleNotesChange = (e) => {
        setEditedNotes(e.target.value);
    };

    const handleSaveNotes = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            await axios.put(`http://localhost:3001/inspection/inspection/${selectedInspection._id}`, 
                { notes: editedNotes },
                { headers }
            );
            console.log('Notes updated');
            
            setInspections(inspections.map(ins => 
                ins._id === selectedInspection._id 
                ? { ...ins, notes: editedNotes } 
                : ins
            ));
        } catch (error) {
            console.error('Error updating notes:', error);
            setError('Error updating notes');
        }
    };

    if (loading) return <p className="loading">Loading...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="inspections-container">
            <h2>Your Inspections</h2>
            <div className="inspections-row">
                {inspections.length > 0 ? (
                    inspections.map((inspection, index) => (
                        <div
                            key={inspection._id}
                            className={`inspection-card ${inspection.status === 'restricted' ? 'restricted' : ''}`}
                            onClick={() => {
                                setSelectedInspection(inspection);
                                setEditedNotes(inspection.notes);
                            }}
                        >
                            <p className="inspection-title">Inspection {index + 1}</p>
                            <p className={`inspection-status ${inspection.status}`}>
                                Status: {inspection.status}
                            </p>
                            <p className="inspection-date">Inspected At: {new Date(inspection.inspectedAt).toLocaleDateString()}</p>
                        </div>
                    ))
                ) : (
                    <p className="no-inspections">No inspections found</p>
                )}
            </div>
            {selectedInspection && (
                <div className="inspection-details">
                    <h3>Inspection Details</h3>
                    <p><strong>Status:</strong> <span className={`inspection-status ${selectedInspection.status}`}>{selectedInspection.status}</span></p>
                    <p><strong>Inspected At:</strong> {new Date(selectedInspection.inspectedAt).toLocaleDateString()}</p>
                    <p><strong>Inspector:</strong> {inspectors[selectedInspection.inspector] || 'Unknown'}</p>
                    <p><strong>Declaration ID:</strong> {selectedInspection.declaration._id}</p>
                    <textarea 
                        value={editedNotes} 
                        onChange={handleNotesChange} 
                        rows="4"
                        placeholder="Edit notes..."
                    />
                    <button className="save-notes-button" onClick={handleSaveNotes}>
                        Save Notes
                    </button>
                    {selectedInspection.status === 'waiting_for_inspection' && (
                        <button className="inspect-button" onClick={handleInspectClick}>
                            Inspect
                        </button>
                    )}
                    {selectedInspection.status === 'awaiting_additional_review' && (
                        <button className="make-additional-inspection-button" onClick={handleMakeAdditionalInspection}>
                            Make Additional Inspection
                        </button>
                    )}
                    {selectedInspection.status === 'restricted' && (
                        <p className="restricted-message">This inspection is restricted and cannot be processed further.</p>
                    )}
                    <button className="close-details" onClick={() => setSelectedInspection(null)}>
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}

export default UserInspections;
