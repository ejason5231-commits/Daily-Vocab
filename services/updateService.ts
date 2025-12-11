import { App } from '@capacitor/app';

const CURRENT_APP_VERSION = '0.0.1'; // Update this when releasing new versions
const MIN_REQUIRED_VERSION = '0.0.1'; // Minimum version to prevent using old builds

// Firestore or external API to fetch latest version
// For now, using a simple config - in production, fetch from Firebase or your backend
const LATEST_VERSION_CONFIG = {
  latestVersion: '0.0.1', // Update this when releasing a new version (e.g., '0.0.2')
  minRequiredVersion: '0.0.1',
  forceUpdateUrl: 'https://play.google.com/store/apps/details?id=com.eric.dailyvocab',
};

export interface VersionCheckResult {
  needsUpdate: boolean;
  isForceUpdate: boolean;
  latestVersion: string;
  downloadUrl: string;
  message?: string;
}

/**
 * Compare semantic versions (e.g., "1.2.3" > "1.2.0")
 */
export const compareVersions = (v1: string, v2: string): number => {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
};

/**
 * Check if current app version needs update
 * Returns an object indicating if update is needed and if it's forced
 */
export const checkForUpdate = (): VersionCheckResult => {
  const latestVersion = LATEST_VERSION_CONFIG.latestVersion;
  const minRequired = LATEST_VERSION_CONFIG.minRequiredVersion;

  // Check if current version is below minimum required (force update)
  const isForceUpdate = compareVersions(CURRENT_APP_VERSION, minRequired) < 0;

  // Check if there's a newer version available (optional update)
  const needsUpdate = compareVersions(CURRENT_APP_VERSION, latestVersion) < 0;

  return {
    needsUpdate: needsUpdate || isForceUpdate,
    isForceUpdate,
    latestVersion,
    downloadUrl: LATEST_VERSION_CONFIG.forceUpdateUrl,
    message: isForceUpdate
      ? `Current version (${CURRENT_APP_VERSION}) is outdated. Please update to version ${latestVersion}.`
      : `A new version (${latestVersion}) is available.`,
  };
};

/**
 * Open Play Store to download the app update
 */
export const openPlayStoreUpdate = async (): Promise<void> => {
  try {
    const result = await checkForUpdate();
    await App.openUrl({ url: result.downloadUrl });
  } catch (err) {
    console.error('Failed to open Play Store:', err);
    throw err;
  }
};

export default {
  checkForUpdate,
  openPlayStoreUpdate,
  CURRENT_APP_VERSION,
};
