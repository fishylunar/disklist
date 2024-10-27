import { Drive, DiskListOptions } from './types.ts';
import { PlatformFactory } from './platform-factory.ts';
import { DiskListUtils } from './utils.ts';

export default class DiskList {
  /**
   * Lists all drives on the system synchronously
   * @param options Configuration options for drive listing
   * @returns Array of standardized drive information
   */
  static listDrivesSync(options: DiskListOptions = { returnOnlyRemovable: false, filter: {} }): Drive[] {
    const platform = PlatformFactory.getPlatform();
    let drives = platform.getDrives();

    if (options.returnOnlyRemovable) {
      drives = drives.filter(drive => drive.removable);
    }

    return DiskListUtils.filterDrives(drives, options.filter);
  }

  /**
   * Lists all drives on the system asynchronously
   * @param options Configuration options for drive listing
   * @returns Promise resolving to array of standardized drive information
   */
  static async listDrives(options: DiskListOptions = { returnOnlyRemovable: false, filter: {} }): Promise<Drive[]> {
    return await this.listDrivesSync(options);
  }
}

export * from './types.ts';
export * from './errors.ts';