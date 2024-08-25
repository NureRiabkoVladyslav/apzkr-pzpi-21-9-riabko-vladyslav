const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, 
    description: { type: String }, 
    isProhibited: { type: Boolean, default: false }, 
    transportCost: { type: Number, required: true, min: 0 }, 
});

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
module.exports = Category;
