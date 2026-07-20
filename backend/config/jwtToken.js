import jwt from "jsonwebtoken";

export const generateToken = (data) => {
  return jwt.sign(
    { data },
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

// Deliberately separate from generateToken/verifyToken above: a password-reset
// token must NOT be usable as a session token (no role/permissions in the
// payload), and carries its own short expiry and a `purpose` claim so it can
// never be accepted anywhere a session token is expected, or vice versa.
const PASSWORD_RESET_EXPIRY = "24h";
const PASSWORD_RESET_PURPOSE = "password-reset";

export const generatePasswordResetToken = (userId) => {
  return jwt.sign(
    { id: userId, purpose: PASSWORD_RESET_PURPOSE },
    process.env.JWT_SECRET,
    { expiresIn: PASSWORD_RESET_EXPIRY }
  );
};

export const verifyPasswordResetToken = (token) => {
  if (!token) {
    return false
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.purpose !== PASSWORD_RESET_PURPOSE) {
      return false
    }
    return decoded;
  } catch (error) {
    return false
  }
};