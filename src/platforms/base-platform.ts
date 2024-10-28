import { Drive } from "../types.ts";

export abstract class BasePlatform {
  abstract getDrives(): Drive[];

  protected standardizeDrive(drive: Partial<Drive>): Drive {
    return {
      device: drive.device ?? "",
      displayName: drive.displayName ?? "Unknown Drive",
      description: drive.description ?? "Unknown",
      size: drive.size ?? 0,
      mountpoints: drive.mountpoints ?? [],
      raw: drive.raw ?? "",
      protected: drive.protected ?? false,
      system: drive.system ?? false,
      removable: drive.removable ?? false,
      fileSystem: drive.fileSystem ?? "Unknown",
      driveType: drive.driveType ?? "Unknown",
      mounted: drive.mounted ?? false,
      serialNumber: drive.serialNumber,
    };
  }
}
