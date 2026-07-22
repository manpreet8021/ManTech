import multer from "multer";

const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './temp')
    },
    filename: function(req, file, cb) {
        // Date.now() (not new Date().toString()) — the latter contains colons,
        // which are illegal in Windows filenames and made every upload fail.
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})

export const upload = multer({ storage: diskStorage, limits: {fileSize: 5 * 1024 * 1024} })