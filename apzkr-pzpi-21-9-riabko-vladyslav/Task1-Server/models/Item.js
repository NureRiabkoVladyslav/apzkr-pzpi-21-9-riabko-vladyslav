const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true }, 
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, 
    description: { type: String }, 
    weight: { type: Number, required: true, min: 0 }, 
});

const Items = mongoose.models.Items || mongoose.model('Items', itemSchema);
module.exports = Items;
