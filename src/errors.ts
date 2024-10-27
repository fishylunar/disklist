/**
 * Custom error types for DiskList operations
 */
export class DiskListError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "DiskListError";
  }
}

export class UnsupportedPlatformError extends DiskListError {
  constructor(platform: string) {
    super(`Platform '${platform}' is not supported`, "UNSUPPORTED_PLATFORM");
  }
}

export class CommandExecutionError extends DiskListError {
  constructor(command: string, error: string) {
    super(
      `Failed to execute command '${command}': ${error}`,
      "COMMAND_EXECUTION_ERROR",
    );
  }
}
