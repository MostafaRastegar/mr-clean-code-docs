const express = require("express");
const path = require("path");
const corsMiddleware = require("./middleware/cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Set EJS as template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../templates"));

// Routes
const reportsRouter = require("./routes/reports");
app.use("/api/reports", reportsRouter);

// Serve the main report page
app.get("/", async (req, res) => {
  try {
    // Try to get the latest report for initial data
    const reportsRoute = require("./routes/reports");
    const reportsData = await new Promise((resolve, reject) => {
      const mockReq = {};
      const mockRes = {
        json: resolve,
        status: (code) => ({
          json: reject,
        }),
      };

      // This is a workaround to get the latest report data
      // In a real scenario, we'd make a proper API call
      resolve({ success: false });
    });

    res.render("report-template-simple", {
      title: "Clean Code Report Viewer",
      initialData: null,
    });
  } catch (error) {
    console.error("Error serving main page:", error);
    res.render("report-template-simple", {
      title: "Clean Code Report Viewer",
      initialData: null,
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api/reports`);
  console.log(`📄 View reports at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});
