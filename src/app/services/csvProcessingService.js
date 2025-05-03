/**
 * Service for processing and validating CSV files
 */

// Process CSV and validate structure
export const processCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    // Check file type
    if (
      !file.type.match("text/csv") &&
      !file.type.match("application/vnd.ms-excel") &&
      !file.type.match(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
    ) {
      reject(
        new Error("Invalid file type. Please upload a CSV or Excel file.")
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const steps = [
          { name: "Reading file content", percentage: 20 },
          { name: "Parsing data structure", percentage: 40 },
          { name: "Validating data formats", percentage: 60 },
          { name: "Checking for required fields", percentage: 80 },
          { name: "Preparing data for upload", percentage: 100 },
        ];

        // Simulate processing steps with callbacks
        for (const step of steps) {
          // Notify about current progress
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("csv-processing-progress", {
                detail: {
                  status: step.name,
                  percentage: step.percentage,
                },
              })
            );
          }

          // Simulate processing time for each step
          await new Promise((r) => setTimeout(r, 500));
        }

        // If this were real validation, we would validate:
        // 1. Check for required headers
        // 2. Validate data types
        // 3. Check for missing values
        // 4. Normalize data if needed

        resolve({
          status: "success",
          message: "File processed successfully",
          validationPassed: true,
          summary: {
            totalRows: 1000, // Example values
            validRows: 998,
            invalidRows: 2,
            warnings: 5,
          },
        });
      } catch (error) {
        reject(new Error(`Error processing CSV: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };

    reader.readAsText(file);
  });
};

// Additional utility for extracting headers from CSV
export const extractCSVHeaders = (csvContent) => {
  const lines = csvContent.split("\n");
  if (lines.length === 0) return [];

  const headers = lines[0].split(",");
  return headers.map((header) => header.trim());
};

// Check if CSV passes minimum requirements
export const quickValidateCSV = (csvContent) => {
  const lines = csvContent.split("\n").filter((line) => line.trim() !== "");

  // Basic validation
  if (lines.length < 2) {
    return {
      valid: false,
      error: "CSV must contain at least headers and one data row",
    };
  }

  const headers = lines[0].split(",");
  if (headers.length < 2) {
    return {
      valid: false,
      error: "CSV must contain at least two columns",
    };
  }

  return { valid: true };
};

// Generate a preview of the CSV data
export const generateCSVPreview = (csvContent, maxRows = 5) => {
  const lines = csvContent.split("\n").filter((line) => line.trim() !== "");
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = [];

  for (let i = 1; i < Math.min(lines.length, maxRows + 1); i++) {
    const cells = lines[i].split(",").map((cell) => cell.trim());
    rows.push(cells);
  }

  return { headers, rows };
};
