import { createWriteStream, existsSync, mkdirSync, chmodSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { https } from 'follow-redirects';

const execAsync = promisify(exec);

const YT_DLP_VERSION = '2025.02.19';
const GITHUB_RELEASE_URL = 'https://github.com/yt-dlp/yt-dlp/releases/download';

interface PlatformInfo {
  platform: string;
  arch: string;
  binaryName: string;
  downloadUrl: string;
}

function getPlatformInfo(): PlatformInfo {
  const platform = process.platform;
  const arch = process.arch;

  let binaryName: string;
  let downloadPath: string;

  switch (platform) {
    case 'win32':
      binaryName = 'yt-dlp.exe';
      downloadPath = `yt-dlp.exe`;
      break;
    case 'darwin':
      binaryName = 'yt-dlp_macos';
      downloadPath = arch === 'arm64' ? 'yt-dlp_macos' : 'yt-dlp_macos';
      break;
    case 'linux':
      binaryName = 'yt-dlp';
      downloadPath = 'yt-dlp';
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  return {
    platform,
    arch,
    binaryName,
    downloadUrl: `${GITHUB_RELEASE_URL}/${YT_DLP_VERSION}/${downloadPath}`,
  };
}

function getBinDir(): string {
  return join(__dirname, '..', 'bin');
}

function getYtDlpPath(): string {
  const binDir = getBinDir();
  const { binaryName } = getPlatformInfo();
  return join(binDir, binaryName);
}

function ensureBinDir(): void {
  const binDir = getBinDir();
  if (!existsSync(binDir)) {
    mkdirSync(binDir, { recursive: true });
  }
}

async function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destPath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      unlinkSync(destPath);
      reject(err);
    });
  });
}

async function setExecutablePermissions(filePath: string): Promise<void> {
  if (process.platform !== 'win32') {
    chmodSync(filePath, 0o755);
  }
}

async function checkYtDlpExists(): Promise<boolean> {
  const ytDlpPath = getYtDlpPath();
  return existsSync(ytDlpPath);
}

async function verifyYtDlpInstallation(): Promise<boolean> {
  try {
    const ytDlpPath = getYtDlpPath();
    const { stdout } = await execAsync(`"${ytDlpPath}" --version`);
    return stdout.trim().length > 0;
  } catch {
    return false;
  }
}

export async function ensureYtDlpInstalled(): Promise<string> {
  const ytDlpPath = getYtDlpPath();
  
  if (await checkYtDlpExists()) {
    const isValid = await verifyYtDlpInstallation();
    if (isValid) {
      console.error(`[yt-dlp-mcp] Found existing yt-dlp at: ${ytDlpPath}`);
      return ytDlpPath;
    } else {
      console.error('[yt-dlp-mcp] Existing yt-dlp is corrupted, re-downloading...');
      unlinkSync(ytDlpPath);
    }
  }

  console.error('[yt-dlp-mcp] yt-dlp not found, downloading...');
  
  const { downloadUrl, binaryName } = getPlatformInfo();
  console.error(`[yt-dlp-mcp] Downloading from: ${downloadUrl}`);
  
  ensureBinDir();
  
  const tempPath = `${ytDlpPath}.downloading`;
  
  try {
    await downloadFile(downloadUrl, tempPath);
    await setExecutablePermissions(tempPath);
    
    const fs = await import('fs');
    fs.renameSync(tempPath, ytDlpPath);
    
    console.error(`[yt-dlp-mcp] yt-dlp downloaded successfully to: ${ytDlpPath}`);
    
    const version = await getYtDlpVersion();
    console.error(`[yt-dlp-mcp] yt-dlp version: ${version}`);
    
    return ytDlpPath;
  } catch (error) {
    if (existsSync(tempPath)) {
      unlinkSync(tempPath);
    }
    throw new Error(`Failed to download yt-dlp: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getYtDlpVersion(): Promise<string> {
  try {
    const ytDlpPath = getYtDlpPath();
    const { stdout } = await execAsync(`"${ytDlpPath}" --version`);
    return stdout.trim();
  } catch {
    return 'unknown';
  }
}

export { getYtDlpPath };
