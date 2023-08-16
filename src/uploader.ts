import config from "./config";
import fileUtils from "./utils";
import multer from "multer";
import path from "path";
import { v4 } from "uuid";

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileDestination = config.filePaths.uploadDirTemp;
    fileUtils.createDirectory(fileDestination);
    cb(null, fileDestination);
  },
  filename: (req, file, cb) => {
    const fileName = `${v4()}${path.extname(file.originalname)}`;
    cb(null, fileName);
  },
});
const zipUploader = multer({
  storage: diskStorage,
  fileFilter: (req, file, cb) => {
    // Take only zip files
    if (file.mimetype !== "application/zip") {
      cb(new Error("Only zip files are allowed"));
    } else {
      cb(null, true);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
    fieldNameSize: 100,
    files: 1,
    // parts: 2,
  },
}).single("file");

const multipleImageUploader = multer({
  storage: diskStorage,
  fileFilter: (req, file, cb) => {
    // Take only image files
    const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(new Error("Only image files are allowed"));
    } else {
      cb(null, true);
    }
  },
  limits: {
    // 2mb per image
    fileSize: 2 * 1024 * 1024,
    fieldNameSize: 100,
    files: 200,
    // parts: 2,
  },
}).array("images", 200);

export default Object.freeze({
  zipUploader,
  multipleImageUploader,
});

export { zipUploader };
