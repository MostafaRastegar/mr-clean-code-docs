const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();

const DATA_DIR = path.join(__dirname, "../../data");

// Helper function to validate JSON file
async function validateJsonFile(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(content);

    // Validate structure
    if (!data.report || !data.report.metadata || !data.report.violations) {
      throw new Error("Invalid report structure");
    }

    return data;
  } catch (error) {
    throw new Error(`Invalid JSON file: ${error.message}`);
  }
}

// Get list of all report files
router.get("/", async (req, res) => {
  try {
    const files = await fs.readdir(DATA_DIR);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    const reports = [];

    for (const file of jsonFiles) {
      try {
        const filePath = path.join(DATA_DIR, file);
        const stats = await fs.stat(filePath);

        reports.push({
          filename: file,
          name: file.replace(".json", ""),
          size: stats.size,
          modified: stats.mtime,
          path: `/api/reports/${file}`,
        });
      } catch (error) {
        console.error(`Error reading file ${file}:`, error);
      }
    }

    res.json({
      success: true,
      reports: reports.sort((a, b) => b.modified - a.modified),
      total: reports.length,
    });
  } catch (error) {
    console.error("Error reading reports directory:", error);
    res.status(500).json({
      success: false,
      error: "Failed to read reports directory",
      message: error.message,
    });
  }
});

// Get specific report by filename
router.get("/:filename", async (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename.endsWith(".json")) {
      return res.status(400).json({
        success: false,
        error: "Invalid filename format",
        message: "Filename must end with .json",
      });
    }

    const filePath = path.join(DATA_DIR, filename);

    try {
      const data = await validateJsonFile(filePath);

      res.json({
        success: true,
        data: data,
      });
    } catch (error) {
      if (error.message.includes("ENOENT")) {
        return res.status(404).json({
          success: false,
          error: "Report not found",
          message: `Report file ${filename} not found`,
        });
      }

      return res.status(400).json({
        success: false,
        error: "Invalid report file",
        message: error.message,
      });
    }
  } catch (error) {
    console.error("Error serving report:", error);
    res.status(500).json({
      success: false,
      error: "Failed to serve report",
      message: error.message,
    });
  }
});

// Get latest report
router.get("/latest", async (req, res) => {
  try {
    const files = await fs.readdir(DATA_DIR);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    if (jsonFiles.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No reports found",
        message: "No report files found in data directory",
      });
    }

    // Find the latest file
    let latestFile = null;
    let latestTime = 0;

    for (const file of jsonFiles) {
      const filePath = path.join(DATA_DIR, file);
      const stats = await fs.stat(filePath);

      if (stats.mtime > latestTime) {
        latestTime = stats.mtime;
        latestFile = file;
      }
    }

    if (!latestFile) {
      return res.status(404).json({
        success: false,
        error: "No reports found",
        message: "No valid report files found",
      });
    }

    const filePath = path.join(DATA_DIR, latestFile);
    const data = await validateJsonFile(filePath);

    res.json({
      success: true,
      data: data,
      filename: latestFile,
    });
  } catch (error) {
    console.error("Error getting latest report:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get latest report",
      message: error.message,
    });
  }
});

module.exports = router;
