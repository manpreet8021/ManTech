import { verifyToken } from "../config/jwtToken.js";
import asyncHandler from "./asyncHandler.js";

const protect = asyncHandler(async(req, res, next) => {
    let token = '';
    token = verifyToken(req.headers.authorization)
    if(token) {
        let condition = { id: token.id, active: true }
        const user = await findUser(condition);
        if(user) {
            req.user = user;
            req.tokenPermission = token.permissions;
            next();
        } else {
            res.status(401);
            throw new Error("Unauthorized")
        }
    } else {
        res.status(401);
        throw new Error("Token is not valid please login again")
    }
})

export {protect}