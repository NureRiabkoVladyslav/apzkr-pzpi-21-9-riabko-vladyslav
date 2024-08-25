const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const authRouter = require('./routes/auth');
const baggageRouter = require('./routes/baggage');
const categoryRouter = require('./routes/category');
const declarationRouter = require('./routes/declaration');
const itemRouter = require('./routes/item');
const userRouter = require("./routes/user");
const inspectionRouter = require('./routes/inspection');
const exportRouter = require('./routes/export');
const auth = require('./validation/auth');

const authValidation = require('./validation/auth');
const adminValidation = require('./validation/admin');

const Baggage = require("./models/Baggage");
const Category = require("./models/Category");
const Declaration = require("./models/Declaration");
const Item = require("./models/Item");
const User = require("./models/User");
const Inspection = require("./models/Inspection");

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/baggage', auth, baggageRouter);
app.use('/category', auth, categoryRouter);
app.use('/declaration', auth, declarationRouter);
app.use('/item', auth, itemRouter);
app.use('/inspection', auth, inspectionRouter);
app.use('/user', auth, userRouter);
app.use('/export', auth, exportRouter);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
