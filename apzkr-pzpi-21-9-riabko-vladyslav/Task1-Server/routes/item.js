const express = require('express');
const router = express.Router();
const Items = require('../models/Item');
const auth = require('../validation/auth');

router.get('/items', auth, async (req, res) => {
    try {
        const items = await Items.find().populate('category');
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/item/:id', auth, async (req, res) => {
    try {
        const item = await Items.findById(req.params.id).populate('category');
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/item', auth, async (req, res) => {
    const item = new Items(req.body);
    try {
        const newItem = await item.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/item/:id', auth, async (req, res) => {
    try {
        const updatedItem = await Items.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
        res.json(updatedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/item/:id', auth, async (req, res) => {
    try {
        const deletedItem = await Items.findByIdAndDelete(req.params.id);
        if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
