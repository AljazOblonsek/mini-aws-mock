const fs = require('fs');
const path = require('path');

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function copyEjsFilesRecursively(srcPath, destPath) {
  fs.readdirSync(srcPath, { withFileTypes: true }).forEach((dirent) => {
    const srcFilePath = path.join(srcPath, dirent.name);
    const destFilePath = path.join(destPath, dirent.name);

    if (dirent.isDirectory()) {
      copyEjsFilesRecursively(srcFilePath, destFilePath);
    } else if (dirent.isFile() && dirent.name.endsWith('.ejs')) {
      ensureDirectoryExistence(destFilePath);
      fs.copyFileSync(srcFilePath, destFilePath);
    }
  });
}

// Copying service views
const srcServicesDirectory = './src/services';
const destServicesBaseDirectory = './dist/views/services';

fs.readdirSync(srcServicesDirectory, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .forEach((dirent) => {
    const serviceName = dirent.name;
    const srcServiceViewPath = path.join(srcServicesDirectory, serviceName, 'views');
    const destServiceViewPath = path.join(destServicesBaseDirectory, serviceName, 'views');

    copyEjsFilesRecursively(srcServiceViewPath, destServiceViewPath);
  });

// Copying core views
const srcCoreViewsPath = './src/core/views';
const destCoreViewsPath = './dist/views/core/views';

copyEjsFilesRecursively(srcCoreViewsPath, destCoreViewsPath);

console.log('Assets copied successfully.');
