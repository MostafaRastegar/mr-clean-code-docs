class ReportApp {
  constructor() {
    this.reportData = null;
    this.reports = [];
    this.selectedReport = null;
    this.selectedSeverity = "all";
    this.searchQuery = "";
    this.selectedViolation = null;

    this.elements = {
      loading: document.getElementById("loading"),
      errorMessage: document.getElementById("error-message"),
      reportSelector: document.getElementById("report-selector"),
      reportList: document.getElementById("report-list"),
      summaryGrid: document.getElementById("summary-grid"),
      totalViolations: document.getElementById("total-violations"),
      totalViolationsBadge: document.getElementById("total-violations-badge"),
      highSeverity: document.getElementById("high-severity"),
      mediumSeverity: document.getElementById("medium-severity"),
      lowSeverity: document.getElementById("low-severity"),
      filters: document.getElementById("filters"),
      filteredCount: document.getElementById("filtered-count"),
      totalCount: document.getElementById("total-count"),
      searchInput: document.getElementById("search-input"),
      violationsTable: document.getElementById("violations-table"),
      tableBody: document.getElementById("table-body"),
    };

    this.init();
  }

  async init() {
    await this.loadReports();
    this.setupEventListeners();
  }

  async loadReports() {
    this.showLoading();
    this.hideError();

    try {
      const response = await fetch("/api/reports");
      const data = await response.json();

      if (data.success) {
        this.reports = data.reports;
        this.renderReports();

        // Auto-load latest report if available
        if (this.reports.length > 0) {
          this.selectedReport = this.reports[0].filename;
          await this.loadReport(this.selectedReport);
        }
      } else {
        throw new Error(data.error || "Failed to load reports");
      }
    } catch (error) {
      this.showError("Failed to load reports: " + error.message);
      console.error("Error loading reports:", error);
    } finally {
      this.hideLoading();
    }
  }

  async loadReport(filename) {
    this.showLoading();
    this.hideError();
    this.selectedReport = filename;

    try {
      const response = await fetch(`/api/reports/${filename}`);
      const data = await response.json();

      if (data.success) {
        this.reportData = data.data;
        this.renderReport();
      } else {
        throw new Error(data.error || "Failed to load report");
      }
    } catch (error) {
      this.showError("Failed to load report: " + error.message);
      console.error("Error loading report:", error);
    } finally {
      this.hideLoading();
    }
  }

  setupEventListeners() {
    // Filter buttons
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document
          .querySelectorAll(".filter-btn")
          .forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");
        this.selectedSeverity = e.target.dataset.severity;
        this.renderViolations();
      });
    });

    // Search input
    this.elements.searchInput.addEventListener("input", (e) => {
      this.searchQuery = e.target.value;
      this.renderViolations();
    });

    // Modal close
    this.elements.modalClose.addEventListener("click", () => {
      this.closeModal();
    });

    this.elements.modalOverlay.addEventListener("click", (e) => {
      if (e.target === this.elements.modalOverlay) {
        this.closeModal();
      }
    });
  }

  renderReports() {
    if (this.reports.length === 0) {
      this.elements.reportSelector.style.display = "none";
      return;
    }

    this.elements.reportSelector.style.display = "block";
    this.elements.reportList.innerHTML = "";

    this.reports.forEach((report) => {
      const reportItem = document.createElement("div");
      reportItem.className = `report-item ${this.selectedReport === report.filename ? "active" : ""}`;
      reportItem.innerHTML = `
            <div class="report-name">${report.name}</div>
            <div class="report-meta">
              <span>${new Date(report.modified).toLocaleDateString()}</span>
              <span style="margin-left: 1rem;">${Math.round(report.size / 1024)} KB</span>
            </div>
          `;
      reportItem.addEventListener("click", () =>
        this.loadReport(report.filename),
      );
      this.elements.reportList.appendChild(reportItem);
    });
  }

  renderReport() {
    if (!this.reportData) {
      this.elements.summaryGrid.style.display = "none";
      this.elements.filters.style.display = "none";
      this.elements.violationsTable.style.display = "none";
      return;
    }

    // Show summary
    this.elements.summaryGrid.style.display = "grid";
    const metadata = this.reportData.report.metadata;
    this.elements.totalViolations.textContent = metadata.totalViolations || 0;
    this.elements.totalViolationsBadge.textContent =
      metadata.totalViolations || 0;
    this.elements.highSeverity.textContent = this.getSeverityCount("high");
    this.elements.mediumSeverity.textContent = this.getSeverityCount("medium");
    this.elements.lowSeverity.textContent = this.getSeverityCount("low");

    // Show filters
    this.elements.filters.style.display = "block";
    this.elements.totalCount.textContent =
      this.reportData.report.violations.length || 0;

    // Show violations table
    this.elements.violationsTable.style.display = "block";
    this.renderViolations();
  }

  renderViolations() {
    if (!this.reportData?.report?.violations) {
      this.elements.tableBody.innerHTML =
        '<div class="no-results">No violations found.</div>';
      this.elements.filteredCount.textContent = "0";
      return;
    }

    const violations = this.filteredViolations;
    this.elements.filteredCount.textContent = violations.length;

    if (violations.length === 0) {
      this.elements.tableBody.innerHTML =
        '<div class="no-results">No violations found matching your criteria.</div>';
      return;
    }

    this.elements.tableBody.innerHTML = violations
      .map(
        (violation) => `
          <div class="violation-row" onclick="app.toggleDetails(this)">
            <div class="line-number">Line <span>${violation.line}</span></div>
            <div>
              <span class="severity-tag severity-${violation.severity}" style="background: ${this.getSeverityColor(violation.severity)}">${violation.severity}</span>
            </div>
            <div>
              <span class="category-tag">${violation.category}</span>
            </div>
            <div class="message">${violation.message}</div>
          </div>
          <div class="violation-details">
            <div class="detail-section">
              <div class="detail-label">Message</div>
              <div class="detail-value">${violation.message}</div>
            </div>
            <div class="detail-section">
              <div class="detail-label">Code</div>
              <div class="detail-code">${violation.code}</div>
            </div>
            <div class="detail-section">
              <div class="detail-label">Recommended Fix</div>
              <div class="detail-value">${violation.recommendedFix}</div>
            </div>
            <div class="detail-section">
              <div class="detail-label">Reference</div>
              <div class="detail-value">
                <a href="${violation.reference}" target="_blank" style="color: var(--primary-color); text-decoration: none;">${violation.reference}</a>
              </div>
            </div>
            <div class="detail-section">
              <div class="detail-label">Location</div>
              <div class="detail-value">File: ${this.reportData.report.metadata.file} | Line: ${violation.line}, Column: ${violation.column}</div>
            </div>
          </div>
        `,
      )
      .join("");
  }

  get filteredViolations() {
    if (!this.reportData?.report?.violations) {
      return [];
    }

    return this.reportData.report.violations.filter((violation) => {
      // Filter by severity
      if (
        this.selectedSeverity !== "all" &&
        violation.severity !== this.selectedSeverity
      ) {
        return false;
      }

      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        return (
          violation.message.toLowerCase().includes(query) ||
          violation.code.toLowerCase().includes(query) ||
          violation.category.toLowerCase().includes(query) ||
          violation.rule.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }

  getSeverityCount(severity) {
    if (!this.reportData?.report?.violations) {
      return 0;
    }

    return this.reportData.report.violations.filter(
      (v) => v.severity === severity,
    ).length;
  }

  getSeverityColor(severity) {
    switch (severity) {
      case "critical":
        return "#fef2f2";
      case "high":
        return "#fff7ed";
      case "medium":
        return "#fffbeb";
      case "low":
        return "#f0fdf4";
      default:
        return "#f1f5f9";
    }
  }

  toggleDetails(rowElement) {
    // Find the details element next to the row
    const detailsElement = rowElement.nextElementSibling;

    // Toggle active class
    if (detailsElement) {
      detailsElement.classList.toggle("active");
    }
  }

  showLoading() {
    this.elements.loading.style.display = "flex";
  }

  hideLoading() {
    this.elements.loading.style.display = "none";
  }

  showError(message) {
    this.elements.errorMessage.textContent = message;
    this.elements.errorMessage.style.display = "block";
  }

  hideError() {
    this.elements.errorMessage.style.display = "none";
  }
}

// Initialize app
const app = new ReportApp();
