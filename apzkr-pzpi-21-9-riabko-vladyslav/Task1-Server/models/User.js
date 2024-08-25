const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['passenger', 'customs_officer', 'admin'], default: 'passenger' },
    phone: { type: String, required: true },
    baggage: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Baggage' }], 
    declarations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Declaration' }] 
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;
