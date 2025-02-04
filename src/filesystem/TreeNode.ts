import LinuxFile from "./File";

export default class TreeNode {
  value: LinuxFile;
  children: Map<string, TreeNode>;

  constructor(value: LinuxFile) {
    this.value = value;
    this.children = new Map();
  }

  //TODO: when renaming 
  public get name() {
    return this.value.name;
  }

  addChild(key: string, value: LinuxFile): TreeNode {
    const childNode = new TreeNode(value);
    this.children.set(key, childNode);
    return childNode;
  }

  getChild(key: string): TreeNode | undefined {
    return this.children.get(key);
  }

  listChildren(): TreeNode[] {
    return Array.from(this.children.values());
  }
}
