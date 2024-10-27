import os from "node:os";
import { BasePlatform } from "./platforms/base-platform.ts";
import { WindowsPlatform } from "./platforms/windows-platform.ts";
import { MacOSPlatform } from "./platforms/macos-platform.ts";
import { LinuxPlatform } from "./platforms/linux-platform.ts";
import { UnsupportedPlatformError } from "./errors.ts";

export class PlatformFactory {
  static getPlatform(): BasePlatform {
    const platform = os.platform();

    switch (platform) {
      case "win32":
        return new WindowsPlatform();
      case "darwin":
        return new MacOSPlatform();
      case "linux":
        return new LinuxPlatform();
      default:
        throw new UnsupportedPlatformError(platform);
    }
  }
}
