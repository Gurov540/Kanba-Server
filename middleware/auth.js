import jwt from "jsonwebtoken";

export default function (req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(403).json({ message: "No access" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded._id;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
}
