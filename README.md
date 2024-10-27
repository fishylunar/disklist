# disklist

JavaScript / TypeScript Library for getting info about drives & disks.


[![CodeFactor](https://www.codefactor.io/repository/github/fishylunar/disklist/badge/main)](https://www.codefactor.io/repository/github/fishylunar/disklist/overview/main)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=fishylunar_disklist&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=fishylunar_disklist)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=fishylunar_disklist&metric=bugs)](https://sonarcloud.io/summary/new_code?id=fishylunar_disklist)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=fishylunar_disklist&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=fishylunar_disklist)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=fishylunar_disklist&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=fishylunar_disklist)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=fishylunar_disklist&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=fishylunar_disklist)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=fishylunar_disklist&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=fishylunar_disklist)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=fishylunar_disklist&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=fishylunar_disklist)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=fishylunar_disklist&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=fishylunar_disklist)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=fishylunar_disklist&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=fishylunar_disklist)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=fishylunar_disklist&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=fishylunar_disklist)
[![SonarCloud](https://sonarcloud.io/images/project_badges/sonarcloud-black.svg)](https://sonarcloud.io/summary/new_code?id=fishylunar_disklist)

![Deno JS](https://img.shields.io/badge/deno%20js-000000?style=for-the-badge&logo=deno&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

![Windows](https://img.shields.io/badge/Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white)
![macOS](https://img.shields.io/badge/mac%20os-000000?style=for-the-badge&logo=macos&logoColor=F0F0F0)
![Linux](https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black)

### Example:

```typescript
import Disklist from "disklist";

const disks = Disklist.listDrivesSync();
console.log(disks.filter((disk) => disk.removable));
```

Would when run on a Windows machine result in: (With a USB Drive plugged in)

```js
[
  {
    device: "\\\\.\\PHYSICALDRIVE1",
    displayName: "WINDOWS10",
    description: "USB Mass Storage Device",
    size: 31264289280,
    mountpoints: [{ path: "E:/" }],
    raw: "\\\\.\\PHYSICALDRIVE1",
    protected: false,
    system: false,
    removable: true,
    fileSystem: "FAT32",
    driveType: "USB Drive",
    mounted: true,
    serialNumber: "2a30d57d2e49d654229299c66f80e0e4",
  },
];
```

And on MacOS (with the same drive plugged in) it would result in:

```js
[
  {
    device: "/dev/disk8",
    displayName: "WINDOWS10",
    description: "USB Mass Storage Device",
    size: 31266439168,
    mountpoints: [],
    raw: "/dev/disk8",
    protected: false,
    system: false,
    removable: true,
    fileSystem: "FAT32",
    driveType: "USB Drive",
    mounted: false,
    serialNumber: "2a30d57d2e49d654229299c66f80e0e4",
  },
];
```
