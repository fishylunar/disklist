/**
 * Represents a drive's mountpoint information
 */
export interface Mountpoint {
    path: string;
  }
  
  /**
   * Represents unified drive information across all operating systems
   */
  export interface Drive {
    /** Unique device identifier (e.g., /dev/disk0, C:) */
    device: string;
    /** Human-readable name of the drive */
    displayName: string;
    /** Manufacturer and model information */
    description: string;
    /** Drive size in bytes */
    size: number;
    /** Array of mount points where the drive is mounted */
    mountpoints: Mountpoint[];
    /** Raw device path */
    raw: string;
    /** Whether the drive is write-protected */
    protected: boolean;
    /** Whether this is a system/boot drive */
    system: boolean;
    /** Volume label or name */
    // label: string;
    /** Whether the drive is removable */
    removable: boolean;
    /** File system type (e.g., NTFS, HFS+, ext4) */
    fileSystem: string;
    /** Drive type (e.g., SSD, HDD, USB) */
    driveType: string;
    /** Drive health status if available */
    // healthStatus?: string; 
    /** Whether the drive is currently mounted */
    mounted: boolean;
    /** Drive serial number if available */
    serialNumber?: string;
  }
  
  /* Linux Drive Device */
  export interface LinuxDevice {
    type: string;
    name: string;
    label: string;
    size: string;
    mountpoint: string;
    rm: string; // Removable
    ro: string // Read Only
    fstype: string;
  }

  /** macOS Disk Device */
  export interface macOSDiskDevice {
    DeviceIdentifier: string;
    BusProtocol: string;
    DeviceNode: string
    MediaName: string;
    IORegistryEntryName: string;
    Size: number;
    MountPoint: string;
    WritableMedia: boolean;
    RemovableMedia: boolean;
    Ejectable: boolean;
    SystemImage: boolean;
    AllDisksAndPartitions: macOSDiskDevice[];
    VolumeName: string;
    FilesystemName: string;
    FilesystemUserVisibleName: string;
  }

  /** Windows Drive */
  export interface WindowsDrive {
    Name: string;
    Size: number;
    DeviceID: string;
    SerialNumber: string;
    Model: string;
    MediaType: string;
  }
  /** Windows Volume */
  export interface WindowsVolume {
    Label: string;
    DriveLetter: string;
    FileSystem: string;
    BootVolume: boolean;
    IsReadOnly: number;
  }
  /**
   * Filter options for drive listing
   */
  export interface FilterOptions {
    key?: keyof Drive;
    value?: string | number | boolean;
    limit?: number;
  }
  
  /**
   * Configuration options for drive listing
   */
  export interface DiskListOptions {
    /** Only return removable drives like USB drives */
    returnOnlyRemovable: boolean;
    /** Filter options for the results */
    filter: FilterOptions;
  }