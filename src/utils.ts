import config from "./config";
import fs from "fs";
import path from "path";
import sharp from "sharp";

// ... Commented extractZip function ...

/**
 * Creates a directory if it doesn't already exist.
 * @param {string} path - The path of the directory to create.
 * @returns {boolean} - Returns true if the directory was created, false otherwise.
 */
const createDirectory = (path: string) => {
  return !fs.existsSync(path) && fs.mkdirSync(path, { recursive: true });
};

/**
 * Deletes a file from the given path.
 * @param {string} path - The path of the file to delete.
 */
const deleteFile = (path: string) => {
  if (fs.existsSync(path)) {
    try {
      fs.unlinkSync(path);
    } catch (error: any) {
      console.log(error.message);
    }
  }
};

/**
 * Checks asynchronously if a directory exists.
 * @param {string} path - The path of the directory to check.
 * @returns {Promise<boolean>} - A promise that resolves to true if the directory exists, false otherwise.
 */
const dirExistAsync = async (path: string): Promise<boolean> => {
  return new Promise((resolve) => {
    fs.access(path, (err) => {
      if (err) resolve(false);
      else resolve(true);
    });
  });
};

/**
 * Checks synchronously if a directory exists.
 * @param {string} path - The path of the directory to check.
 * @returns {boolean} - True if the directory exists, false otherwise.
 */
const dirExistSync = (path: string) => {
  return fs.existsSync(path);
};

/**
 * Recursively retrieves files from a directory (and its subdirectories).
 * @param {string} dir - The path of the directory to scan.
 * @param {string[]} [files_= []] - An optional array to store the file paths.
 * @returns {string[]} - An array of file paths.
 */
const getFiles = (dir: string, files_: string[] = []) => {
  const files = fs.readdirSync(dir);
  for (const i in files) {
    const name = dir + "/" + files[i];
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files_);
    } else {
      files_.push(name);
    }
  }
  return files_;
};

// Placeholder function for future implementation
const getDirectories = (dir: string) => {};

/**
 * Recursively retrieves files from a directory (and its subdirectories).
 * @deprecated
 * @param {string} dir - The path of the directory to scan.
 * @returns {string[]} - An array of file paths.
 */
const getDirectoriesSync = (dir: string) => {};

/**
 * Recursively retrieves files from a directory (and its subdirectories).
 * @param {string} dir - The path of the directory to scan.
 * @param {string[]} [files_= []] - An optional array to store the file paths.
 * @returns {string[]} - An array of file paths.
 */
const getFilesSync = (dir: string, files_: string[] = []) => {
  const files = fs.readdirSync(dir);
  for (const i in files) {
    const name = dir + "/" + files[i];
    if (fs.statSync(name).isDirectory()) {
      getFilesSync(name, files_);
    } else {
      files_.push(name);
    }
  }
  return files_;
};

/**
 * ImageProcessor is responsible for handling image resizing and processing
 * tasks for thumbnails of various sizes.
 */
class ImageProcessor {
  /**
   * Converts a file size in bytes into a human-readable format.
   *
   * This function will take a number representing bytes and will
   * return that size represented in the largest file size unit
   * (B, KB, MB, GB, etc.) for which the converted value is greater
   * than or equal to 1.
   *
   * For sizes greater than bytes and less than 10 (e.g., 5.5 MB, 2.2 GB),
   * the function will return one decimal point of precision.
   *
   * @param bytes - The file size in bytes.
   * @returns The human-readable file size string with an appropriate unit.
   *
   * @example
   * humanReadableSize(1500); // returns "1.5 KB"
   * humanReadableSize(10485760); // returns "10 MB"
   */
  static humanReadableSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    let l = 0,
      n = parseInt(bytes.toString(), 10) || 0;

    while (n >= 1024 && ++l) {
      n = n / 1024;
    }

    return n.toFixed(n < 10 && l > 0 ? 1 : 0) + " " + units[l];
  }

  /** The base directory from which file paths are constructed. */
  baseDir: string;

  /** Paths for various image processing tasks, derived from the configuration. */
  filePaths: any;

  /**
   * Initializes the ImageProcessor, setting the base directory and
   * ensuring that all necessary directories exist.
   */
  constructor() {
    this.baseDir = path.resolve(__dirname);
    this.filePaths = config.filePaths;

    // Create directories if they don't exist
    for (const key in config.filePaths) {
      if (!fs.existsSync(this.filePaths[key])) {
        fs.mkdirSync(this.filePaths[key], { recursive: true });
      }
    }
  }

  /**
   * Resizes an image based on the provided width and height, then saves
   * the resized image to the specified output path.
   *
   * @param inputPath - Path to the source image.
   * @param outputPath - Path where the resized image should be saved.
   * @param width - Desired width of the resized image.
   * @param height - Desired height of the resized image.
   */
  async resizeImage(
    inputPath: string,
    outputPath: string,
    width: number,
    height: number
  ) {
    try {
      await sharp(inputPath).resize(width, height).toFile(outputPath);
    } catch (err: any) {
      console.error(`Failed to resize image. Error: ${err.message}`);
    }
  }

  /**
   * Processes an image to create thumbnails of different sizes. The method
   * returns a mapping of the original file to its respective thumbnails.
   *
   * @param imagePath - Path to the original image.
   * @param originalFilename - Name of the original image file.
   * @returns An object containing paths to the original and thumbnail images.
   */
  async processImage(imagePath: string, originalFilename: string) {
    type MappingKeys =
      | "THUMB_50x50"
      | "THUMB_150x150"
      | "THUMB_250x250"
      | "THUMB_500x500"
      | "THUMB_1000x1000"
      | "THUMB_2000x2000";

    type ThumbnailMappings = Record<
      MappingKeys,
      { width: number; height: number }
    >;

    const mappings = {
      THUMB_50x50: { width: 50, height: 50 },
      THUMB_150x150: { width: 150, height: 150 },
      THUMB_250x250: { width: 250, height: 250 },
      THUMB_500x500: { width: 500, height: 500 },
      THUMB_1000x1000: { width: 1000, height: 1000 },
      THUMB_2000x2000: { width: 2000, height: 2000 },
    } as ThumbnailMappings;

    const result = {} as Record<
      MappingKeys,
      {
        path: string;
        size: string;
        originalSize?: string;
      }
    >;

    for (const key in mappings) {
      const outputPath = path.join(this.filePaths[key], originalFilename);
      await this.resizeImage(
        imagePath,
        outputPath,
        mappings[key as MappingKeys].width,
        mappings[key as MappingKeys].height
      );
      // Get size of the original image
      const originalStats = fs.statSync(imagePath);
      const originalFileSizeInBytes = ImageProcessor.humanReadableSize(
        originalStats.size
      );

      // Get size of saved thumbnail
      const stats = fs.statSync(outputPath);
      const fileSizeInBytes = ImageProcessor.humanReadableSize(stats.size);

      result[key as MappingKeys] = {
        path: outputPath,
        size: fileSizeInBytes,
        originalSize: originalFileSizeInBytes,
      };
      //outputPath;
    }

    // const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);

    return {
      original: imagePath,
      thumbnails: result,
    };
  }
}

const fileUtils = Object.freeze({
  createDirectory,
  deleteFile,
  dirExistAsync,
  dirExistSync,
  getFiles,
  getFilesSync,
  getDirectories,
  getDirectoriesSync,
  ImageProcessor,
});

export default fileUtils;
