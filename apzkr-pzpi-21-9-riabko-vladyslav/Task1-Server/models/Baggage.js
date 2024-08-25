    const mongoose = require('mongoose');

    const baggageSchema = new mongoose.Schema({
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
        itemsList: [
            {
                item: { type: mongoose.Schema.Types.ObjectId, ref: 'Items', required: true }, 
                quantity: { type: Number, required: true, min: 1 } 
            }
        ],
        totalWeight: { type: Number, required: true, min: 0 }, 
    });

    const Baggage = mongoose.models.Baggage || mongoose.model('Baggage', baggageSchema);
    module.exports = Baggage;
