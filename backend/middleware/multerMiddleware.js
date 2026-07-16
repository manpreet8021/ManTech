import multer from "multer";

const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './temp')
    },
    filename: function(req, file, cb) {
        cb(null, new Date() + file.originalname)
    }
})

export const upload = multer({ storage: diskStorage, limits: {fileSize: 5 * 1024 * 1024} })