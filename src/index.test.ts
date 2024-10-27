
import Disklist from './index.ts';
import { expect } from "jsr:@std/expect";

const disks = Disklist.listDrivesSync().filter(disk => disk.removable);

Deno.test("Disk is type object", () => {
    expect(typeof disks[0]).toBe('object')
  });

  Deno.test("Disk should be removable", () => {
    expect(disks[0].removable).toBe(true);
  });
  
  Deno.test("Disk should not be a system disk", () => {
    expect(disks[0].system).toBe(false);
  });
  
  Deno.test("Disk should have FAT32 file system", () => {
    expect(disks[0].fileSystem).toBe('FAT32');
  });
  
  Deno.test("Disk should be recognized as USB Drive", () => {
    expect(disks[0].driveType).toBe('USB Drive');
  });
  
  Deno.test("Disk should have correct display name", () => {
    expect(disks[0].displayName).toBe('WINDOWS10');
  });
  
  Deno.test("Disk should have correct description", () => {
    expect(disks[0].description).toBe('USB Mass Storage Device');
  });
  
  Deno.test("Disk should have correct size", () => {
    expect(disks[0].size.toString().substring(0, 4)).toBe('3126');
  });
  
  Deno.test("Disk should have correct serial number", () => {
    expect(disks[0].serialNumber).toBe("2a30d57d2e49d654229299c66f80e0e4");
  });