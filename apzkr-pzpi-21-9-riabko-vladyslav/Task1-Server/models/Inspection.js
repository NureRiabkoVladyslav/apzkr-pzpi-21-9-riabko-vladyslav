    const mongoose = require('mongoose');

    const inspectionSchema = new mongoose.Schema({
        declaration: { type: mongoose.Schema.Types.ObjectId, ref: 'Declaration', required: true }, 
        inspector: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        inspectedAt: { type: Date, default: Date.now }, 
        status: { 
            type: String, 
            enum: ['awaiting_additional_review', 'Restricted', 'waiting_for_inspection', 'passed'], 
            default: 'waiting_for_inspection' 
        }, 
        notes: { type: String, default: '' } 
    });

    const Inspection = mongoose.models.Inspection || mongoose.model('Inspection', inspectionSchema);
    module.exports = Inspection;
