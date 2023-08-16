import express from "express";
import logger from "morgan";
import uploader from "./uploader";
import utils from "./utils";

const PORT = process.env.PORT || 8000;
const app = express();
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/upload", uploader.multipleImageUploader, async (req, res) => {
  try {
    if (!req.files) {
      return res.status(400).send("No files were uploaded.");
    }
    const files = req.files as Express.Multer.File[];

    // Process images and get file details
    const fileDetailsPromises = files.map(async (file) => {
      const imageProcessor = new utils.ImageProcessor();
      const details = await imageProcessor.processImage(
        file.path,
        file.filename
      );
      return {
        originalName: file.originalname,
        fileName: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        ...details,
      };
    });

    // Wait for all promises to resolve
    const fileDetails = await Promise.all(fileDetailsPromises);

    return res.send(fileDetails);
  } catch (err: any) {
    console.log(err);
    return res.status(500).send(err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
