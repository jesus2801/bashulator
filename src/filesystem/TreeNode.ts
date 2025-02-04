import LinuxFile from "./File";

export default class TreeNode {
  file: LinuxFile;
  parent: TreeNode;
  children: Map<string, TreeNode>;

  constructor(file: LinuxFile, parent: TreeNode) {
    this.file = file;
    this.parent = parent;
    this.children = new Map();
  }

  addChild(file: LinuxFile): TreeNode {
    const childNode = new TreeNode(file, this);

    this.children.set(file.name, childNode);

    return childNode;
  }

  getChild(name: string): TreeNode | undefined {
    return this.children.get(name);
  }

  listChildren(): TreeNode[] {
    return Array.from(this.children.values());
  }
}
