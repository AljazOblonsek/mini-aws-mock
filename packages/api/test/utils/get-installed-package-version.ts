import { readFile } from 'fs/promises';
import { join } from 'path/posix';

/**
 * Finds package in node_modules and returns installed package version. Returns null if package is not found or cannot be read.
 * @param packageName Name of the package to find version for.
 */
export const getInstalledPackageVersion = async (packageName: string): Promise<string | null> => {
  try {
    const packageJsonPath = join(process.cwd(), 'node_modules', packageName, 'package.json');
    const packageJsonContent = await readFile(packageJsonPath, { encoding: 'utf-8' });
    const packageJson = JSON.parse(packageJsonContent);

    if (!packageJson.version) {
      return null;
    }

    return packageJson.version;
  } catch {
    return null;
  }
};
