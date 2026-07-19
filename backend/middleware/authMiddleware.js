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

            // Multi-tenant: resolve the org from the caller's Origin header
            // (always present on cross-origin requests) rather than requiring
            // the frontend to pass it explicitly on every call. Organisation.url
            // is stored with a trailing slash, Origin never has one, so match both.
            const origin = req.headers.origin
            const organisation = origin
                ? await findOrganisation({ url: { [Op.in]: [origin, `${origin}/`] }, active: true })
                : null
            req.org_id = organisation ? organisation.id : null

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
