const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { userValidationRules, validate } = require('../validation/validators');
const Declaration = require('../models/Declaration');


router.get('/users', async (req, res) => {
    try {
        const users = await User.find()
            .populate('baggage')
            .populate('declarations');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('baggage')
            .populate('declarations');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.put('/user/:id', userValidationRules(), validate, async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/user/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/user/:id/change-password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/user/pay', async (req, res) => {
    const { declarationId } = req.body;

    try {
        const declaration = await Declaration.findById(declarationId);

        if (!declaration) {
            return res.status(404).json({ message: 'Declaration not found' });
        }

        declaration.status = 'completed';
        await declaration.save();

        res.status(200).json({
            message: 'Payment successful, declaration status updated to completed',
            declaration
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
