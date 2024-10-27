import { execSync } from 'node:child_process';
import { CommandExecutionError } from './errors.ts';
import { Drive, FilterOptions, macOSDiskDevice } from './types.ts';
import { createHash } from 'node:crypto';
export class DiskListUtils {
  /**
   * Safely executes a shell command and returns its output
   */
  static executeCommand(command: string, options: { shell?: string } = {}): string {
    try {
      return execSync(command, options).toString().trim();
    } catch (error) {
      throw new CommandExecutionError(
        command,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Parses plist output into JSON format (macOS specific)
   */
  static parsePlistOutput(plistStr: string): macOSDiskDevice {
    const escapedStr = plistStr.replace(/'/g, '\'\\\'\'');
    return JSON.parse(
      this.executeCommand(`echo '${escapedStr}' | plutil -convert json -o - -`, {
        shell: '/bin/bash'
      })
    );
  }

  /**
   * Applies filters to an array of drives
   */
  static filterDrives(drives: Drive[], filter: FilterOptions): Drive[] {
    if (!filter || Object.keys(filter).length === 0) {
      return drives;
    }

    const { key, value, limit } = filter;

    let filteredDrives = drives;

    if (key && value !== undefined) {
      filteredDrives = drives.filter(drive => drive[key] === value);
    }

    if (typeof limit === 'number') {
      filteredDrives = filteredDrives.slice(0, limit);
    }

    return filteredDrives;
  }

  /**
   * Converts size strings to bytes
   */
  static sizeToBytes(size: string | number): number {
    if (typeof size === 'number') return size;
    
    const units = {
      B: 1,
      KB: 1024,
      MB: 1024 ** 2,
      GB: 1024 ** 3,
      TB: 1024 ** 4
    };

    const match = size.match(/^(\d+(?:\.\d+)?)\s*([KMGT]B|B)$/i);
    if (!match) return 0;

    const [, value, unit] = match;
    return Math.floor(parseFloat(value) * units[unit as keyof typeof units]);
  }

  /**
   * getDriveNameMacOS - Gets the display name of a disk/volume on macOS
   * @param diskName Name of the disk
   * @returns {string | null} DisplayName of the disk - Returns undefined if no name was found.
   */
  static getDriveNameMacOS(diskName: string): string | undefined {
    try {
        const infoStr = execSync(`diskutil info -plist ${diskName}s1`).toString();
        const parsed = this.parsePlistOutput(infoStr);
        return parsed.VolumeName || parsed.MediaName || 'Unnamed Disk';
    } catch (error) {
        console.error(`Error getting name for disk ${diskName}:`, error);
        return undefined;
    }
}
  /**
   * getDriveNameMacOS - Gets the display name of a disk/volume on macOS
   * @param diskName Name of the disk
   * @returns {string | null} DisplayName of the disk - Returns undefined if no name was found.
   */
  static getFileSystemNameMacOS(diskName: string): string | undefined {
    try {
        const infoStr = execSync(`diskutil info -plist ${diskName}s1`).toString();
        const parsed = this.parsePlistOutput(infoStr);
        let fsString = parsed.FilesystemUserVisibleName || parsed.FilesystemName || 'Unnamed Disk';
        if (fsString.includes("(")) {
          fsString = fsString.split("(")[1].replace(")", "").trim();
        }
        return fsString;
    } catch (error) {
        console.error(`Error getting name for disk ${diskName}:`, error);
        return undefined;
    }
}
  /** Attempt to unify the drive.descripton */
  static serializeDescriptionString(description: string): string {
    switch (description) {
      case 'Storage Device':
        return 'USB Mass Storage Device';
      case 'Mass Storage Device USB Device':
        return 'USB Mass Storage Device';
      default:
        return description;
    }
  }

    /** Attempt to unify the drive.driveType */
    static serializeDriveTypeString(driveTupe: string): string {
      switch (driveTupe) {
        case 'Removable Media':
          return 'USB Drive';
        case 'USB':
          return 'USB Drive';
        default:
          return driveTupe;
      }
    }

    /** Generate drive serial number */
    static generateSerialNumber(drive: Drive): string {

      // TODO: unify sizes. For now we use the first 4 chars of the Drive.size
      const sizeString = drive.size.toString().substring(0, 4);
      const serialString = drive.displayName + drive.description + drive.removable + drive.fileSystem + sizeString + drive.driveType + drive.system
      return createHash('md5').update(serialString).digest('hex');
    }
}