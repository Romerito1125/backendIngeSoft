import fs from "fs";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/";
       if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const fileName = `${file.originalname}-${Date.now()}.pdf`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });
export default upload;
