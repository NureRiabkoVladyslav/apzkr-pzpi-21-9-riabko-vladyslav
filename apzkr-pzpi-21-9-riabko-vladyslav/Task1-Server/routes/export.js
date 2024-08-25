const express = require('express');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const Item = require('../models/Item');
const Declaration = require('../models/Declaration');
const User = require('../models/User');
const Baggage = require('../models/Baggage');
const Inspection = require('../models/Inspection');
const router = express.Router();

router.get('/export-items', async (req, res) => {
    try {
        console.log('Exporting all items');

        const items = await Item.find().populate('category');
        if (items.length === 0) {
            console.error('No items found');
            return res.status(404).send('No items found');
        }

        const ExcelJS = require('exceljs');
        const path = require('path');
        const fs = require('fs');

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Items');

        worksheet.columns = [
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Category', key: 'category', width: 30 },
            { header: 'Description', key: 'description', width: 50 },
            { header: 'Weight', key: 'weight', width: 15 },
            { header: 'Status', key: 'status', width: 20 },
        ];

        items.forEach(item => {
            const status = item.category && item.category.isProhibited ? 'Prohibited' : 'Allowed';
            const statusColor = status === 'Prohibited' ? 'FF0000' : '00FF00';
            const row = worksheet.addRow({
                name: item.name,
                category: item.category ? item.category.name : 'No category',
                description: item.description || 'No description',
                weight: item.weight,
                status: status,
            });

            row.getCell('status').font = { color: { argb: statusColor } };
        });

        const dirPath = path.join(__dirname, 'temp');
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const filePath = path.join(dirPath, 'all_items.xlsx');
        console.log(`Saving file to: ${filePath}`);

        await workbook.xlsx.writeFile(filePath);
        console.log('File saved successfully');

        res.download(filePath, 'all_items.xlsx', (err) => {
            if (err) {
                console.error('Failed to download the file:', err.message);
                res.status(500).json({ message: 'Failed to download the file', error: err.message });
            } else {
                console.log('File sent successfully');
            }
        });

    } catch (error) {
        console.error('Error exporting items:', error.message);
        res.status(500).send(error.message);
    }
});

router.get('/export-declarations/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log(`Exporting declarations for user: ${userId}`);

        if (!userId) {
            return res.status(400).send('User ID is required.');
        }

        const declarations = await Declaration.find({ passenger: userId })
            .populate('passenger') 
            .populate('baggage'); 

        if (declarations.length === 0) {
            console.error('No declarations found for the user');
            return res.status(404).send('No declarations found for the user');
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Declarations');

        worksheet.columns = [
            { header: 'Passenger', key: 'passenger', width: 30 },
            { header: 'Baggage Details', key: 'baggage', width: 50 },
            { header: 'Total Cost', key: 'totalCost', width: 15 },
            { header: 'Status', key: 'status', width: 25 },
        ];

        for (const declaration of declarations) {
            let baggageDetails = 'No baggage';
            if (declaration.baggage) {
                const baggage = declaration.baggage;
                const itemDetails = await Promise.all(baggage.itemsList.map(async (itemEntry) => {
                    const item = await Item.findById(itemEntry.item);
                    return item ? `${item.name} (Quantity: ${itemEntry.quantity})` : `Unknown Item (Quantity: ${itemEntry.quantity})`;
                }));

                baggageDetails = `Weight: ${baggage.totalWeight} kg, Items: ${itemDetails.join(', ')}`;
            }

            worksheet.addRow({
                passenger: declaration.passenger ? declaration.passenger.email : 'No passenger',
                baggage: baggageDetails,
                totalCost: declaration.totalCost || 0,
                status: declaration.status || 'No status',
            });
        }

        const dirPath = path.join(__dirname, 'temp');
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const filePath = path.join(dirPath, `user_${userId}_declarations.xlsx`);
        console.log(`Saving file to: ${filePath}`);

        await workbook.xlsx.writeFile(filePath);
        console.log('File saved successfully');

        res.download(filePath, `user_${userId}_declarations.xlsx`, (err) => {
            if (err) {
                console.error('Failed to download the file:', err.message);
                res.status(500).json({ message: 'Failed to download the file', error: err.message });
            } else {
                console.log('File sent successfully');
            }
        });

    } catch (error) {
        console.error('Error exporting declarations:', error.message);
        res.status(500).send(error.message);
    }
});


module.exports = router;
