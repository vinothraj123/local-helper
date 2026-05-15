// const fs = require("fs");
// const path = require("path");

// const src = path.join(
//   __dirname,
//   "node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf",
// );
// const destDir = path.join(__dirname, "dist/_expo/static/fonts");
// const dest = path.join(destDir, "Ionicons.ttf");

// if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
// fs.copyFileSync(src, dest);
// console.log("✅ Ionicons.ttf copied!");
const fs = require("fs");
const path = require("path");

const source = path.join(
  __dirname,
  "node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf",
);

const destDir = path.join(__dirname, "dist/assets/fonts");

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(source, path.join(destDir, "Ionicons.ttf"));

console.log("✅ Ionicons.ttf copied!");
