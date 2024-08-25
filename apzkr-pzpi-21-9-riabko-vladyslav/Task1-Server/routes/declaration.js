const express = require('express');
const router = express.Router();
const Declaration = require('../models/Declaration');
const Inspection = require('../models/Inspection'); 
const Baggage = require('../models/Baggage')
const auth = require('../validation/auth'); 
const User = require('../models/User');


router.post('/declaration', async (req, res) => {
    const { passenger, baggage, inspection, totalCost, status } = req.body;

    try {
        const declaration = new Declaration({
            passenger,
            baggage,
            inspection,
            totalCost,
            status
        });
        const newDeclaration = await declaration.save();
        res.status(201).json(newDeclaration);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get('/declarations/under_review', async (req, res) => {
    try {
        const declarations = await Declaration.find({ status: 'under_review' })
            .populate('passenger')
            .populate('baggage')
            .populate('inspection'); 

        if (!declarations.length) {
            return res.status(404).json({ message: 'No declarations with status under_review found' });
        }

        res.json(declarations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;


router.get('/:userId/declarations', auth, async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findById(userId).populate({
            path: 'declarations',
            populate: {
                path: 'baggage',
                populate: {
                    path: 'itemsList.item',
                }
            }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user.declarations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.get('/declaration/:id', async (req, res) => {
    try {
        const declaration = await Declaration.findById(req.params.id)
            .populate('passenger')
            .populate('baggage')
            .populate('inspection');

        if (!declaration) return res.status(404).json({ message: 'Declaration not found' });
        res.json(declaration);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/declaration/:id', async (req, res) => {
    const { status, totalCost } = req.body;

    try {
        const updatedDeclaration = await Declaration.findByIdAndUpdate(
            req.params.id,
            { status, totalCost },
            { new: true }
        );

        if (!updatedDeclaration) return res.status(404).json({ message: 'Declaration not found' });
        res.json(updatedDeclaration);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/declaration/:id', async (req, res) => {
    try {
        const deletedDeclaration = await Declaration.findByIdAndDelete(req.params.id);

        if (!deletedDeclaration) return res.status(404).json({ message: 'Declaration not found' });
        res.json({ message: 'Declaration deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/declaration/:id/pay', async (req, res) => {
    try {
        const updatedDeclaration = await Declaration.findByIdAndUpdate(
            req.params.id,
            { status: 'paid' },
            { new: true }
        );

        if (!updatedDeclaration) return res.status(404).json({ message: 'Declaration not found' });
        res.json({ message: 'Payment successful', declaration: updatedDeclaration });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
