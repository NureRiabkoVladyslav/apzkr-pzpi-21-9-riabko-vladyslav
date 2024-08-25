const express = require('express');
const router = express.Router();
const Baggage = require('../models/Baggage');
const Declaration = require('../models/Declaration');
const auth = require('../validation/auth');
const Items = require('../models/Item');
const User = require('../models/User');

router.get('/:userId/baggages', auth, async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findById(userId).populate({
            path: 'baggage',
            populate: {
                path: 'itemsList.item', 
            }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user.baggage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/baggage', auth, async (req, res) => {
    try {
        const baggage = await Baggage.find()
            .populate('owner')
            .populate('itemsList.item');
        res.json(baggage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/baggage/:id', auth, async (req, res) => {
    try {
        const baggage = await Baggage.findById(req.params.id)
            .populate('owner')
            .populate('itemsList.item');
        if (!baggage) return res.status(404).json({ message: 'Baggage not found' });
        res.json(baggage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/baggage', auth, async (req, res) => {
    try {
        const { owner, itemsList } = req.body;

        const items = await Items.find({ '_id': { $in: itemsList.map(item => item.item) } });

        let totalWeight = 0;
        for (const item of items) {
            const itemDetails = itemsList.find(i => i.item.toString() === item._id.toString());
            if (itemDetails) {
                totalWeight += item.weight * itemDetails.quantity;
            }
        }

        const baggage = new Baggage({
            owner,
            itemsList,
            totalWeight
        });

        const newBaggage = await baggage.save();

        const declaration = new Declaration({
            passenger: owner, 
            baggage: newBaggage._id,
            status: 'under_review' 
        });

        const newDeclaration = await declaration.save();

        await User.findByIdAndUpdate(owner, {
            $push: {
                baggage: newBaggage._id,
                declarations: newDeclaration._id
            }
        });

        res.status(201).json({
            baggage: newBaggage,
            declaration: newDeclaration
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


router.put('/baggage/:id', auth, async (req, res) => {
    try {
        const { itemsList } = req.body;

        const items = await Items.find({ '_id': { $in: itemsList.map(item => item.item) } });

        let totalWeight = 0;
        for (const item of items) {
            const itemDetails = itemsList.find(i => i.item.toString() === item._id.toString());
            if (itemDetails) {
                totalWeight += item.weight * itemDetails.quantity;
            }
        }

        const updatedBaggage = await Baggage.findByIdAndUpdate(
            req.params.id, 
            { ...req.body, totalWeight }, 
            { new: true }
        );

        if (!updatedBaggage) return res.status(404).json({ message: 'Baggage not found' });

        res.json(updatedBaggage);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


router.delete('/baggage/:id', auth, async (req, res) => {
    try {
        const baggage = await Baggage.findById(req.params.id);
        if (!baggage) return res.status(404).json({ message: 'Baggage not found' });

        const declaration = await Declaration.findOneAndDelete({ baggage: req.params.id });
        
        if (!declaration) {
            console.log('No declaration found for this baggage');
        }

        await Baggage.findByIdAndDelete(req.params.id);

        res.json({ message: 'Baggage and related declaration deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/baggage/:id/add-item', auth, async (req, res) => {
    const baggageId = req.params.id;
    const { item, quantity } = req.body;

    try {
        const baggage = await Baggage.findById(baggageId);
        if (!baggage) return res.status(404).json({ message: 'Baggage not found' });

        const itemDetails = await Items.findById(item);
        if (!itemDetails) return res.status(404).json({ message: 'Item not found' });

        const existingItemIndex = baggage.itemsList.findIndex(i => i.item.toString() === item);
        
        if (existingItemIndex > -1) {
            baggage.itemsList[existingItemIndex].quantity += quantity;
        } else {
            baggage.itemsList.push({ item, quantity });
        }

        let totalWeight = 0;
        for (const item of baggage.itemsList) {
            const itemDetails = await Items.findById(item.item);
            totalWeight += itemDetails.weight * item.quantity;
        }
        baggage.totalWeight = totalWeight;

        const updatedBaggage = await baggage.save();
        res.json(updatedBaggage);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
