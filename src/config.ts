import path from "path";

const BASE_DIR = path.resolve(__dirname);
const uploadDir = path.join(BASE_DIR, "uploads");
const filePaths = {
  uploadDir,
  uploadDirTemp: path.join(uploadDir, "temp"),
  THUMB_50x50: path.join(uploadDir, "temp", "thumbs", "50x50"), // Size: 50x50
  THUMB_150x150: path.join(uploadDir, "temp", "thumbs", "150x150"), // Size: 150x150
  THUMB_250x250: path.join(uploadDir, "temp", "thumbs", "250x250"), // Size: 250x250
  THUMB_500x500: path.join(uploadDir, "temp", "thumbs", "500x500"), // Size: 500x500
  THUMB_1000x1000: path.join(uploadDir, "temp", "thumbs", "1000x1000"), // Size: 1000x1000
  THUMB_2000x2000: path.join(uploadDir, "temp", "thumbs", "2000x2000"), // Size: 2000x2000
};

export default Object.freeze({
    filePaths,
});