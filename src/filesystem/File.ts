export default class File {
  private _owner: string = "";

  name: string;
  content: string; // only text files accepted
  permissions: string;
  group: string;
  createdAt: Date;
  modifiedAt: Date;
  accessedAt: Date;
  isSymlink: boolean;
  symlinkTarget?: string;

  constructor(
    name: string,
    content: string,
    owner: string,
    group: string,
    permissions: string = "rw-r--r--",
  ) {
    this.name = name;
    this.content = content;
    this.owner = owner;
    this.group = group;
    this.permissions = permissions;
    this.createdAt = new Date();
    this.modifiedAt = new Date();
    this.accessedAt = new Date();
    this.isSymlink = false;
  }

  public get size(): number {
    return this.content.length + 1;
  }

  public set owner(new_owner: string) {
    //TODO: validate the owner exists
    this._owner = new_owner;
  }

  public get owner() {
    return this._owner;
  }
}
