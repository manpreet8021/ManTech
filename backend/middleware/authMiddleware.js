// import { verifyToken } from "../config/jwtTojen.js";
// import asyncHandler from "./asyncHandler.js";
// import { getUser } from "../model/userService.js";

// const protect = asyncHandler(async(req, res, next) => {
//     let token = '';
//     token = verifyToken(req.headers.authorization)
//     if(token) {
//         let condition = { id: token.id, active: true, updated: true }
//         const user = await getUser(condition);
//         if(user) {
//             req.user = user
//             next();
//         } else {
//             res.status(401);
//             throw new Error("Unauthorized")
//         }
//     } else {
//         res.status(401);
//         throw new Error("Token is not valid please login again")
//     }
// })

// const protectAuth = asyncHandler(async(req, res, next) => {
//     let token = '';
//     token = verifyToken(req.headers.authorization)
//     if(token) {
//         let condition = { id: token.id, active: true }
//         const user = await getUser(condition);
//         if(user) {
//             req.user = user
//             next();
//         } else {
//             res.status(401);
//             throw new Error("Unauthorized")
//         }
//     } else {
//         res.status(401);
//         throw new Error("Token is not valid please login again")
//     }
// })

// const protectSocket = asyncHandler(async(socket, next) => {
//     const token = verifyToken(socket.handshake.auth?.token);
//     if(token) {
//         let condition = { id: token.id, active: true, updated: true }
//         const user = await getUser(condition);
//         if(user) {
//             socket.user = user
//             next();
//         } else {
//             return next("Error")
//         }
//     } else {
//         return next("Error")
//     }
// })

// export {protect, protectAuth, protectSocket}