import { BasePlatform } from './base-platform.ts';
import { Drive, MacOSDiskDevice } from '../types.ts';
import { DiskListUtils } from '../utils.ts';

export class MacOSPlatform extends BasePlatform {
  getDrives(): Drive[] {
    const diskList = DiskListUtils.parsePlistOutput(
      DiskListUtils.executeCommand('diskutil list -plist')
    );

    return diskList.AllDisksAndPartitions
      .map((disk: MacOSDiskDevice) => {
        const diskInfo = this.getDiskInfo(disk.DeviceIdentifier);
        if (!diskInfo || diskInfo.BusProtocol === 'Disk Image') {
          return null;
        }
        
        const standarizedDrive = this.standardizeDrive({
          device: diskInfo.DeviceNode,
          displayName: DiskListUtils.getDriveNameMacOS(diskInfo.DeviceNode),
          description: DiskListUtils.serializeDescriptionString(diskInfo.MediaName || diskInfo.IORegistryEntryName),
          size: diskInfo.Size,
          mountpoints: diskInfo.MountPoint ? [{ path: diskInfo.MountPoint }] : [],
          raw: diskInfo.DeviceNode,
          protected: !diskInfo.WritableMedia,
          system: diskInfo.SystemImage || false,
          // Removed because it's the same as displayName.
          // label: volume?.Label ?? 'Unnamed Drive',
          removable: diskInfo.RemovableMedia || diskInfo.Ejectable,
          fileSystem: DiskListUtils.getFileSystemNameMacOS(diskInfo.DeviceNode) || 'Unknown',
          driveType: DiskListUtils.serializeDriveTypeString(diskInfo.BusProtocol) || 'Unknown',
          mounted: !!diskInfo.MountPoint,
          // healthStatus: diskInfo.SMARTStatus,
          serialNumber: ""
        });
        standarizedDrive.serialNumber = DiskListUtils.generateSerialNumber(standarizedDrive);

        return standarizedDrive
      })
      .filter((drive: Drive | null): drive is Drive => drive !== null);
  }

  private getDiskInfo(diskName: string): MacOSDiskDevice {
    const infoStr = DiskListUtils.executeCommand(`diskutil info -plist /dev/${diskName}`);
    return DiskListUtils.parsePlistOutput(infoStr);
  }
}