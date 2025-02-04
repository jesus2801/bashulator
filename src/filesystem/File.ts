import FileSystemError from "./Error";
import { ErrorMsg } from "./Messages";
import PermissionManager from "./PermissionManager";

export default class LinuxFile {
  private _name: string = "";
  private _owner: string = "";
  private _group: string = "";

  //TODO: add the sticky bit implementation, SGID | SUID
  private _permissions: string = "";

  /* Content of the file: The reason why content is not private is because
   any char can be accepted as we interpret all
   chars as UTF-8 */
  private _content: string = ""; // only text files accepted

  readonly createdAt: Date;
  modifiedAt: Date; // when the content changes
  accessedAt: Date; // last time the file was accesed
  changedAt: Date; //when the content or any related info changes

  //TODO: modify all the functions in order to work properly
  //when this option is true
  isSymLink: boolean;
  symLinkTarget?: string;

  readonly isDir: boolean;

  constructor(
    name: string,
    owner: string,
    group: string,
    isDir: boolean,
    isSymLink: boolean = false,
    content: string = "",
    permissions: string = "rw-rw-r--",
    symLinkTarget?: string
  ) {
    this.name = name;
    this.owner = owner;
    this.group = group;
    this.permissions = permissions;

    this.content = content;

    this.createdAt = new Date();
    this.modifiedAt = new Date();
    this.accessedAt = new Date();
    this.changedAt = new Date();

    this.isSymLink = isSymLink;
    if (this.isSymLink)
      //TODO: check if the target exists
      ///TODO: check that there is no cycle in the calls
      this.symLinkTarget = symLinkTarget;

    this.isDir = isDir;
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

    this.changedAt = new Date();
    this._name = new_name;
  }

  public get name() {
    return this._name;
  }

  public get group() {

    this.changedAt = new Date();
    return this._group;
  }

  public set group(new_group: string) {
    //TODO: check if the group exists
    this._group = new_group;
  }

  public get content() {
    //updates the last accessed date
    this.accessedAt = new Date();
    return this._content;
  }

  public set content(new_content: string) {
    if (this.isDir)
      throw new FileSystemError(ErrorMsg.isADir(this._name), "You cannot add content to a Dir, only to files")

    //updates the last modified and changed date
    this.modifiedAt = new Date();
    this.changedAt = new Date();
    this._content = new_content;
  }

  public set permissions(new_permissions: string) {
    PermissionManager.validateFormat(new_permissions)

    //TODO: check what happens when a user tries to delete its own permissions
    //of a file

    this.changedAt = new Date();
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
    this.changedAt = new Date();
    this._owner = new_owner;
  }

  public get owner() {
    return this._owner;
  }
}
