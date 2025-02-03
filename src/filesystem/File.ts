import FileSystemError from "./Error";
import PermissionManager from "./PermissionManager";

export default class File {
  private _owner: string = "";
  private _name: string = "";
  private _permissions: string = "";

  /* Content of the file: The reason why content is not private is because
   any char can be accepted as we interpret all
   chars as UTF-8 */
  content: string; // only text files accepted
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
    permissions: string = "rw-rw-r--",
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

  public set name(new_name: string) {
    if (new_name.length > 255) {
      throw new FileSystemError(
        "File name too long",
        "File names must be less than 255 characters"
      );
    }

    // checks if new_name contains a slash
    if (new_name.indexOf("/") !== -1)
      //TODO: check if the dir does not exist and if then add "Is not a directory"
      throw new FileSystemError(
        `${new_name} Is a directory`,
        "The file name cannot contain a slash, as this is reserved for directories"
      );

    if (new_name === ".") {
      throw new FileSystemError(
        `${new_name} Is a directory`,
        ". refers to the current directory so it cannot be a file name"
      );
    }

    if (new_name === "..") {
      throw new FileSystemError(
        `${new_name} Is a directory`,
        `${new_name} refers to the current directory so it cannot be a file name`
      );
    }

    //TODO: in theory, any other char can be used in a file name
    //so in further updates there is any problem with that, validate those chars here.

    this._name = new_name;
  }

  public get name() {
    return this._name;
  }

  public set permissions(new_permissions: string) {
    PermissionManager.validateFormat(new_permissions)

    //TODO: check what happens when a user tries to delete its own permissions
    //of a file

    this._permissions = new_permissions;
  }

  public get permissions() {
    return this._permissions;
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
