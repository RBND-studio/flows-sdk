const fs = require("node:fs");

// Rename global module variable names
// because tsup doesn't support specifying different variable names for different entry points
const renameItems = [
  {
    filename: "components.global.js",
    originalValue: "flows_js_components",
    newValue: "flows_js_components_components",
  },
  {
    filename: "tour-components.global.js",
    originalValue: "flows_js_components",
    newValue: "flows_js_components_tour_components",
  },
];

renameItems.forEach(({ filename, originalValue, newValue }) => {
  const filePath = `./dist/${filename}`;
  const content = fs.readFileSync(filePath, { encoding: "utf-8" });
  const newContent = content.replace(originalValue, newValue);
  fs.writeFileSync(filePath, newContent, { encoding: "utf-8" });
});
