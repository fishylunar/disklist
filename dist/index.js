import h from"node:os";var m=class{standardizeDrive(e){return{device:e.device??"",displayName:e.displayName??"Unknown Drive",description:e.description??"Unknown",size:e.size??0,mountpoints:e.mountpoints??[],raw:e.raw??"",protected:e.protected??!1,system:e.system??!1,removable:e.removable??!1,fileSystem:e.fileSystem??"Unknown",driveType:e.driveType??"Unknown",mounted:e.mounted??!1,serialNumber:e.serialNumber}}};import{execSync as g}from"node:child_process";var c=class extends Error{constructor(t,r){super(t);this.code=r;this.name="DiskListError"}},u=class extends c{constructor(e){super(`Platform '${e}' is not supported`,"UNSUPPORTED_PLATFORM")}},p=class extends c{constructor(e,t){super(`Failed to execute command '${e}': ${t}`,"COMMAND_EXECUTION_ERROR")}};import{createHash as b}from"node:crypto";var i=class{static executeCommand(e,t={}){try{return g(e,t).toString().trim()}catch(r){throw new p(e,r instanceof Error?r.message:"Unknown error")}}static parsePlistOutput(e){let t=e.replace(/'/g,"'\\''");return JSON.parse(this.executeCommand(`echo '${t}' | plutil -convert json -o - -`,{shell:"/bin/bash"}))}static filterDrives(e,t){if(!t||Object.keys(t).length===0)return e;let{key:r,value:s,limit:n}=t,o=e;return r&&s!==void 0&&(o=e.filter(l=>l[r]===s)),typeof n=="number"&&(o=o.slice(0,n)),o}static sizeToBytes(e){if(typeof e=="number")return e;let t={B:1,KB:1024,MB:1024**2,GB:1024**3,TB:1024**4},s=/^(\d+(?:\.\d+)?)\s*([KMGT]B|B)$/i.exec(e);if(!s)return 0;let[,n,o]=s;return Math.floor(parseFloat(n)*t[o])}static getDriveNameMacOS(e){try{let t=g(`diskutil info -plist ${e}s1`).toString(),r=this.parsePlistOutput(t);return r.VolumeName||r.MediaName||"Unnamed Disk"}catch(t){console.error(`Error getting name for disk ${e}:`,t);return}}static getFileSystemNameMacOS(e){try{let t=g(`diskutil info -plist ${e}s1`).toString(),r=this.parsePlistOutput(t),s=r.FilesystemUserVisibleName||r.FilesystemName||"Unnamed Disk";return s.includes("(")&&(s=s.split("(")[1].replace(")","").trim()),s}catch(t){console.error(`Error getting name for disk ${e}:`,t);return}}static serializeDescriptionString(e){switch(e){case"Storage Device":return"USB Mass Storage Device";case"Mass Storage Device USB Device":return"USB Mass Storage Device";default:return e}}static serializeDriveTypeString(e){switch(e){case"Removable Media":return"USB Drive";case"USB":return"USB Drive";default:return e}}static generateSerialNumber(e){let t=e.size.toString().substring(0,4),r=e.displayName+e.description+e.removable+e.fileSystem+t+e.driveType+e.system;return b("md5").update(r).digest("hex")}};var d=class extends m{getDrives(){let e=this.getVolumeInfo(),t=this.getPhysicalDrives();return Array.isArray(t)||(t=[t]),t.map((r,s)=>{let n=e.filter(l=>l.DriveLetter?.includes(":"))[s],o=this.standardizeDrive({device:r.Name,displayName:n?.Label,description:i.serializeDescriptionString(r.Model)??"Unknown",size:r.Size,mountpoints:n?.DriveLetter?[{path:`${n.DriveLetter}/`}]:[],raw:r.Name,protected:n.IsReadOnly!==0,system:n?.BootVolume??!1,removable:r.MediaType==="Removable Media",fileSystem:n?.FileSystem??"Unknown",driveType:i.serializeDriveTypeString(r.MediaType)??"Unknown",mounted:!!n?.DriveLetter,serialNumber:r.SerialNumber});return o.serialNumber=i.generateSerialNumber(o),o})}getVolumeInfo(){return JSON.parse(i.executeCommand(`
      Get-CimInstance Win32_Volume |
      Where-Object { $_.DriveType -eq 2 -or $_.DriveType -eq 3 } |
      Select-Object DriveLetter, FileSystem, Label, BootVolume,
                    @{N='IsReadOnly';E={$_.Attributes -band 1}} |
      ConvertTo-Json
    `,{shell:"powershell.exe"}))}getPhysicalDrives(){return JSON.parse(i.executeCommand(`
      Get-CimInstance Win32_DiskDrive |
      Select-Object Model, Size, MediaType, Name, SerialNumber, Status |
      ConvertTo-Json
    `,{shell:"powershell.exe"}))}};var D=class extends m{getDrives(){return i.parsePlistOutput(i.executeCommand("diskutil list -plist")).AllDisksAndPartitions.map(t=>{let r=this.getDiskInfo(t.DeviceIdentifier);if(!r||r.BusProtocol==="Disk Image")return null;let s=this.standardizeDrive({device:r.DeviceNode,displayName:i.getDriveNameMacOS(r.DeviceNode),description:i.serializeDescriptionString(r.MediaName||r.IORegistryEntryName),size:r.Size,mountpoints:r.MountPoint?[{path:r.MountPoint}]:[],raw:r.DeviceNode,protected:!r.WritableMedia,system:r.SystemImage||!1,removable:r.RemovableMedia||r.Ejectable,fileSystem:i.getFileSystemNameMacOS(r.DeviceNode)||"Unknown",driveType:i.serializeDriveTypeString(r.BusProtocol)||"Unknown",mounted:!!r.MountPoint,serialNumber:""});return s.serialNumber=i.generateSerialNumber(s),s}).filter(t=>t!==null)}getDiskInfo(e){let t=i.executeCommand(`diskutil info -plist /dev/${e}`);return i.parsePlistOutput(t)}};var f=class extends m{getDrives(){return this.getBlockDevices().filter(t=>t.type==="disk").map(t=>{let r=this.getUdevInfo(t.name);return this.standardizeDrive({device:`/dev/${t.name}`,displayName:t.label||`/dev/${t.name}`,description:r.model||"Unknown",size:parseInt(t.size,10),mountpoints:t.mountpoint?[{path:t.mountpoint}]:[],raw:`/dev/${t.name}`,protected:t.ro==="1",system:this.isSystemDrive(t.name),removable:!!t.rm,fileSystem:t.fstype||"Unknown",driveType:r.type||"Unknown",mounted:!!t.mountpoint,serialNumber:r.serial})})}getBlockDevices(){return JSON.parse(i.executeCommand("lsblk -J -b -o NAME,SIZE,RO,TYPE,MOUNTPOINT,LABEL,RM,FSTYPE")).blockdevices}getSmartInfo(e){try{return{health:i.executeCommand(`smartctl -H /dev/${e}`).includes("PASSED")?"Healthy":"Warning"}}catch{return{health:"Unknown"}}}getUdevInfo(e){let t=i.executeCommand(`udevadm info --query=property --name=${e}`),r=/ID_MODEL=(.*)/,s=/ID_TYPE=(.*)/,n=/ID_SERIAL=(.*)/,o=r.exec(t),l=s.exec(t),S=n.exec(t);return{model:o?.[1]||"Unknown",type:l?.[1]||"Unknown",serial:S?.[1]}}isSystemDrive(e){try{return i.executeCommand("findmnt / -n -o SOURCE").includes(e)}catch{return!1}}};var v=class{static getPlatform(){let e=h.platform();switch(e){case"win32":return new d;case"darwin":return new D;case"linux":return new f;default:throw new u(e)}}};var y=class{static listDrivesSync(e={returnOnlyRemovable:!1,filter:{}}){let r=v.getPlatform().getDrives();return e.returnOnlyRemovable&&(r=r.filter(s=>s.removable)),i.filterDrives(r,e.filter)}static async listDrives(e={returnOnlyRemovable:!1,filter:{}}){return await this.listDrivesSync(e)}};export{p as CommandExecutionError,c as DiskListError,u as UnsupportedPlatformError,y as default};
//# sourceMappingURL=index.js.map