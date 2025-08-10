import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

export async function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id name email profile.role');
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    req.user = { id: user._id.toString(), role: user.profile.role, name: user.name, email: user.email };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
