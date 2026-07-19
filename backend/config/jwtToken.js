import jwt from "jsonwebtoken";

export const generateToken = (id) => {
  return jwt.sign(
    { id: id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const verifyToken = (token) => {
  if (!token) {
    return false
  }
  try {
    token = token.replace('Bearer ','')
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    return decoded;
  } catch (error) {
    return false
  }
};