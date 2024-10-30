import { BasePlatform } from "./base-platform.ts";
import { Drive, LinuxDevice } from "../types.ts";
import { DiskListUtils } from "../utils.ts";

export class LinuxPlatform extends BasePlatform {
  getDrives(): Drive[] {
    const blockDevices = this.getBlockDevices();

    return blockDevices
      .filter((device: LinuxDevice) => device.type === "disk")
      .map((device: LinuxDevice) => {
        const udevInfo = this.getUdevInfo(device.name);

        const standarizedDrive = this.standardizeDrive({
          device: `/dev/${device.name}`,
          displayName: device.label || `/dev/${device.name}`,
          description: udevInfo.model || "Unknown",
          size: parseInt(device.size, 10),
          mountpoints: device.mountpoint ? [{ path: device.mountpoint }] : [],
          raw: `/dev/${device.name}`,
          protected: device.ro === "1",
          system: this.isSystemDrive(device.name),
          removable: !!device.rm,
          fileSystem: device.fstype || "Unknown",
          driveType: udevInfo.type || "Unknown",
          mounted: !!device.mountpoint,
          serialNumber: "",
        });
        
        standarizedDrive.serialNumber = DiskListUtils.generateSerialNumber(
          standarizedDrive,
        );

        return standarizedDrive;
      });
  }

  private getBlockDevices() {
    const command =
      "lsblk -J -b -o NAME,SIZE,RO,TYPE,MOUNTPOINT,LABEL,RM,FSTYPE";
    return JSON.parse(DiskListUtils.executeCommand(command)).blockdevices;
  }

  private getSmartInfo(deviceName: string) {
    try {
      const output = DiskListUtils.executeCommand(
        `smartctl -H /dev/${deviceName}`,
      );
      return {
        health: output.includes("PASSED") ? "Healthy" : "Warning",
      };
    } catch {
      return { health: "Unknown" };
    }
  }

  private getUdevInfo(deviceName: string) {
    const output = DiskListUtils.executeCommand(
      `udevadm info --query=property --name=${deviceName}`,
    );

    const modelPattern = /ID_MODEL=(.*)/;
    const typePattern = /ID_TYPE=(.*)/;
    const serialPattern = /ID_SERIAL=(.*)/;

    const modelMatch = modelPattern.exec(output);
    const typeMatch = typePattern.exec(output);
    const serialMatch = serialPattern.exec(output);

    return {
      model: modelMatch?.[1] || "Unknown",
      type: typeMatch?.[1] || "Unknown",
      serial: serialMatch?.[1],
    };
  }

  private isSystemDrive(deviceName: string): boolean {
    try {
      const rootMount = DiskListUtils.executeCommand("findmnt / -n -o SOURCE");
      return rootMount.includes(deviceName);
    } catch {
      return false;
    }
  }
}
