import { Op } from "sequelize";
import { verifyToken } from "../config/jwtToken.js";
import asyncHandler from "./asyncHandler.js";
import { findUser } from "../model/userModel.js";
import { findOrganisation } from "../model/organisationModel.js";

const protect = asyncHandler(async(req, res, next) => {
    const decoded = verifyToken(req.headers.authorization)

    if(decoded) {
        let condition = { id: decoded.data.id, active: true }
        const user = await findUser(condition);
        if(user) {
            req.user = user;
            req.tokenPermission = decoded.data.permissions;

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
