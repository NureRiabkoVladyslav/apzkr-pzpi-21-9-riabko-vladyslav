const express = require('express');
const router = express.Router();
const Inspection = require('../models/Inspection');
const Declaration = require('../models/Declaration');
const Category = require('../models/Category');
const Baggage = require('../models/Baggage'); 
const auth = require('../validation/auth');
const User = require('../models/User');
const axios = require('axios');


router.post('/inspection', async (req, res) => {
    const { declaration, inspector, notes } = req.body;

    try {
        const inspection = new Inspection({
            declaration,
            inspector,
            notes: notes || '',
            status: 'waiting_for_inspection' 
        });

        const newInspection = await inspection.save();

        const updatedDeclaration = await Declaration.findByIdAndUpdate(
            declaration,
            {
                inspection: newInspection._id,
                status: 'waiting_for_inspection'
            },
            { new: true }
        );

        res.status(201).json({
            inspection: newInspection,
            declaration: updatedDeclaration
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/doinspection', async (req, res) => {
    const { inspectionId } = req.body;

    try {
        const inspection = await Inspection.findById(inspectionId).populate({
            path: 'declaration',
            populate: {
                path: 'baggage',
                populate: {
                    path: 'itemsList.item',
                    populate: 'category'
                }
            }
        });

        if (!inspection) {
            return res.status(404).json({ message: 'Inspection not found' });
        }

        const declarationData = inspection.declaration;
        if (!declarationData) {
            return res.status(404).json({ message: 'Declaration not found' });
        }

        let isInspectionSuccessful = true;
        let totalCost = 0;

        for (const itemEntry of declarationData.baggage.itemsList) {
            const item = itemEntry.item;
            const category = item.category;
            
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }

            if (category.isProhibited) {
                isInspectionSuccessful = false;
                break;
            }

            totalCost += itemEntry.quantity * item.weight * category.transportCost;
        }

        const updatedInspection = await Inspection.findByIdAndUpdate(
            inspectionId,
            { status: isInspectionSuccessful ? 'awaiting_additional_review' : 'Restricted' },
            { new: true }
        );

        const updatedDeclaration = await Declaration.findByIdAndUpdate(
            declarationData._id,
            {
                totalCost: totalCost,
                status: isInspectionSuccessful ? 'awaiting_additional_review' : 'canceled'
            },
            { new: true }
        );

        res.status(200).json({
            inspection: updatedInspection,
            declaration: updatedDeclaration
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


router.get('/:userId/inspections', auth, async (req, res) => {
    try {
        const userId = req.params.userId;

        const inspections = await Inspection.find({ inspector: userId }).populate('declaration');

        if (inspections.length === 0) return res.status(404).json({ message: 'No inspections found for this user' });

        res.json(inspections);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/inspection/:id', async (req, res) => {
    try {
        const inspection = await Inspection.findById(req.params.id)
            .populate('declaration')
            .populate('inspector');

        if (!inspection) return res.status(404).json({ message: 'Inspection not found' });
        res.json(inspection);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/inspection/:id', async (req, res) => {
    const { status, notes } = req.body;

    try {
        const updatedInspection = await Inspection.findByIdAndUpdate(
            req.params.id,
            { status, notes },
            { new: true }
        );

        if (!updatedInspection) return res.status(404).json({ message: 'Inspection not found' });
        res.json(updatedInspection);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/inspection/:id', async (req, res) => {
    try {
        const deletedInspection = await Inspection.findByIdAndDelete(req.params.id);

        if (!deletedInspection) return res.status(404).json({ message: 'Inspection not found' });
        res.json({ message: 'Inspection deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const performScanRequest = async () => {
    try {
        const response = await fetch('http://localhost:1880/scanBaggage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch scan results');
        }

        const data = await response.json();
        return data;

    } catch (error) {
        throw new Error(`Error during scan request: ${error.message}`);
    }
};

router.post('/finalinspection', async (req, res) => {
    const { inspectionId } = req.body; 

    try {
        const inspection = await Inspection.findById(inspectionId).populate({
            path: 'declaration',
            populate: {
                path: 'baggage',
                populate: {
                    path: 'itemsList.item',
                    populate: 'category'
                }
            }
        });

        if (!inspection) {
            return res.status(404).json({ message: 'Inspection not found' });
        }

        const declarationData = inspection.declaration;
        if (!declarationData) {
            return res.status(404).json({ message: 'Declaration not found' });
        }


        const response = await axios.post('http://localhost:1880/scanBaggage', {
            inspectionId: inspectionId
        });

        const { status, error, results } = response.data;

        let isInspectionSuccessful = (status === 'allowed');
        let notes = isInspectionSuccessful ? '' : error;

        const updatedInspection = await Inspection.findByIdAndUpdate(
            inspectionId,
            { 
                status: isInspectionSuccessful ? 'passed' : 'Restricted',
                notes: notes
            },
            { new: true }
        );

        const updatedDeclaration = await Declaration.findByIdAndUpdate(
            declarationData._id,
            {
                status: isInspectionSuccessful ? 'waiting_payment' : 'failed'
            },
            { new: true }
        );

        res.status(200).json({
            inspection: updatedInspection,
            declaration: updatedDeclaration
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
module.exports = router;