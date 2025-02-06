import LinuxFile from "./LinuxFile";
import { FileType } from "./Interfaces";

export default class Filesystem {
  root: LinuxFile;

  constructor() {
    this.root = new LinuxFile({
      name: "/",
      owner: "root",
      group: "root",
      fileType: FileType.Directory,
      inode: 1,
      parent: null as unknown as LinuxFile
    })

    //TODO: create basic files of a linux distro like etc, dev, mnt, bin, sbin...
  }
}
