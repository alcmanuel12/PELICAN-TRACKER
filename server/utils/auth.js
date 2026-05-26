const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET no configurado');

const createToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

const requireAdmin = (req, res, next) => {
    const token = req.cookies?.pelicanToken;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
        const decoded = verifyToken(token);
        if (decoded.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = { createToken, verifyToken, requireAdmin };
