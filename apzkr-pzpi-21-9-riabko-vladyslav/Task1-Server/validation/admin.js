const admin = (req, res, next) => {

    if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    next();
}

module.exports = admin;
