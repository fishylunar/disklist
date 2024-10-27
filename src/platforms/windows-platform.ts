import { BasePlatform } from "./base-platform.ts";
import { Drive, WindowsDrive, WindowsVolume } from "../types.ts";
import { DiskListUtils } from "../utils.ts";

export class WindowsPlatform extends BasePlatform {
  getDrives(): Drive[] {
    const volumeInfo = this.getVolumeInfo();
    let physicalDrives = this.getPhysicalDrives();
    // Check if physicalDrives is an array, if not make it an array
    if (!Array.isArray(physicalDrives)) {
      physicalDrives = [physicalDrives];
    }

    return physicalDrives.map((drive: WindowsDrive, index: number) => {
      const volume = volumeInfo.filter((vol: WindowsVolume) =>
        vol.DriveLetter?.includes(":")
      )[index];

      const standarizedDrive = this.standardizeDrive({
        device: drive.Name,
        displayName: volume?.Label, //volume?.DriveLetter ?? drive.Name,
        description: DiskListUtils.serializeDescriptionString(drive.Model) ??
          "Unknown",
        size: drive.Size,
        mountpoints: volume?.DriveLetter
          ? [{ path: `${volume.DriveLetter}/` }]
          : [],
        raw: drive.Name,
        protected: volume.IsReadOnly !== 0,
        system: volume?.BootVolume ?? false,
        // Removed because it's the same as displayName.
        // label: volume?.Label ?? 'Unnamed Drive',
        removable: drive.MediaType === "Removable Media",
        fileSystem: volume?.FileSystem ?? "Unknown",
        driveType: DiskListUtils.serializeDriveTypeString(drive.MediaType) ??
          "Unknown",
        mounted: !!volume?.DriveLetter,
        serialNumber: drive.SerialNumber, // We change this later
        // healthStatus: drive.Status
      });

      // Update the serial number of the drive
      standarizedDrive.serialNumber = DiskListUtils.generateSerialNumber(
        standarizedDrive,
      );
      return standarizedDrive;
    });
  }

  private getVolumeInfo() {
    const command = `
      Get-CimInstance Win32_Volume |
      Where-Object { $_.DriveType -eq 2 -or $_.DriveType -eq 3 } |
      Select-Object DriveLetter, FileSystem, Label, BootVolume,
                    @{N='IsReadOnly';E={$_.Attributes -band 1}} |
      ConvertTo-Json
    `;
    return JSON.parse(
      DiskListUtils.executeCommand(command, { shell: "powershell.exe" }),
    );
  }

  private getPhysicalDrives() {
    const command = `
      Get-CimInstance Win32_DiskDrive |
      Select-Object Model, Size, MediaType, Name, SerialNumber, Status |
      ConvertTo-Json
    `;
    return JSON.parse(
      DiskListUtils.executeCommand(command, { shell: "powershell.exe" }),
    );
  }
}
