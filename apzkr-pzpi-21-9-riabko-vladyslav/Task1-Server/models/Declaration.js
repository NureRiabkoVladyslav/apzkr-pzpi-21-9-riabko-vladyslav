const mongoose = require('mongoose');

const declarationSchema = new mongoose.Schema({
    passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    baggage: { type: mongoose.Schema.Types.ObjectId, ref: 'Baggage', required: true }, 
    inspection: { type: mongoose.Schema.Types.ObjectId, ref: 'Inspection' }, 
    totalCost: { type: Number, min: 0 }, 
    status: { 
        type: String, 
        enum: ['under_review', 'waiting_for_inspection', 'canceled', 'waiting_payment', 'completed', 'awaiting_additional_review', 'Restricted'], 
        default: 'under_review' 
    }, 
});

const Declaration = mongoose.models.Declaration || mongoose.model('Declaration', declarationSchema);
module.exports = Declaration;
