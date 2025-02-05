import LinuxFile from "./File";
import { FileType } from "./Interfaces";
import TreeNode from "./TreeNode";

export default class Filesystem {
  root: TreeNode;

  constructor() {
    const rootFile = new LinuxFile({
      name: "/",
      owner: "root",
      group: "root",
      fileType: FileType.Directory,
      inode: 1
    })
    this.root = new TreeNode(rootFile, null as unknown as TreeNode);
    this.root.parent = this.root;

    //TODO: create basic files of a linux distro like etc, dev, mnt, bin, sbin...
  }
}
