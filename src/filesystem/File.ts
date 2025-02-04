import FileSystemError from "./Error";
import { FileType } from "./Interfaces";
import { ErrorMsg } from "./Messages";
import PermissionManager from "./PermissionManager";
import TreeNode from "./TreeNode";

interface FileOptions {
  name: string;
  owner: string;
  group: string;
  content?: string;
  symLinkTarget?: TreeNode;
  fileType?: FileType;
}

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
  //when the file is a symbolic link
  //TODO: implement support for hard links
  symLinkTarget?: TreeNode;

  private _fileType: FileType = FileType.RegularFile;

  constructor({
    name,
    owner,
    group,
    content = "",
    fileType = FileType.RegularFile,
    symLinkTarget,
  }: FileOptions
  ) {
    this.owner = owner;
    this.group = group;
    this.name = name;

    //TODO: modify this for symbolic links only
    //when changing the link target
    //TODO: implement: change the link target
    this.createdAt = new Date();
    this.modifiedAt = new Date();
    this.accessedAt = new Date();
    this.changedAt = new Date();

    this.fileType = fileType;

    if (this.fileType === FileType.SymbolicLink) {
      //TODO: check if the target exists
      ///TODO: check that there is no cycle in the calls
      if (symLinkTarget)
        this.symLinkTarget = symLinkTarget;
      else
        throw new FileSystemError('Symbolic link target is missing', 'Symbolic link target must be passed through the func')
      this.permissions = "rwxrwxrwx"

      //remaining config is not needed as the actual config
      //is in the target file
      return;
    }

    if (this.fileType === FileType.Directory)
      this.permissions = "rwxrwxr-x"
    else {
      this.content = content;
      this.permissions = "rw-rw-r--";
    }
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
    if (this.fileType === FileType.SymbolicLink) {
      this.symLinkTarget!.file.group = new_group;
      return;
    }

    //TODO: check if the group exists
    this._group = new_group;
  }

  public get content() {
    if (this.fileType === FileType.SymbolicLink)
      return this.symLinkTarget!.file.content;

    //updates the last accessed date
    this.accessedAt = new Date();


    return this._content;
  }

  public set content(new_content: string) {
    if (this.fileType === FileType.SymbolicLink) {
      this.symLinkTarget!.file.content = new_content;
      return;
    }

    if (this.fileType === FileType.Directory)
      throw new FileSystemError(ErrorMsg.isADir(this._name), "You cannot add content to a Dir, only to files")

    //updates the last modified and changed date
    this.modifiedAt = new Date();
    this.changedAt = new Date();
    this._content = new_content;
  }

  public set permissions(new_permissions: string) {
    if (this.fileType === FileType.SymbolicLink) {
      this.symLinkTarget!.file.permissions = new_permissions;
      return;
    }

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
    if (this.fileType === FileType.SymbolicLink)
      return this.symLinkTarget!.file.size;

    return this.content.length + 1;
  }

  public set owner(new_owner: string) {
    if (this.fileType === FileType.SymbolicLink) {
      this.symLinkTarget!.file.owner = new_owner;
      return;
    }

    //TODO: validate the owner exists
    this.changedAt = new Date();
    this._owner = new_owner;
  }

  public get owner() {
    return this._owner;
  }

  public get fileType() {
    return this._fileType;
  }

  //TODO: How can I change the file type in real scenario? idk
  public set fileType(new_fileType) {
    this._fileType = new_fileType;
  }
}
