import FileSystemError from "./Error";
import { FileType } from "./Interfaces";
import { ErrorMsg } from "./Messages";
import PermissionManager from "./PermissionManager";

interface FileOptions {
  inode: number;
  name: string;
  owner: string;
  group: string;
  content?: string;
  symLinkTarget?: LinuxFile;
  fileType?: FileType;
  parent: LinuxFile;
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

  readonly inode: number;

  //TODO: modify all the functions in order to work properly
  //when the file is a symbolic link
  //TODO: implement support for hard links
  private _symLinkTarget?: string;
  private _targetInstance?: LinuxFile;

  readonly fileType: FileType = FileType.RegularFile;

  parent: LinuxFile;
  children: Map<string, LinuxFile>;


  constructor({
    inode,
    name,
    owner,
    group,
    parent,
    content = "",
    fileType = FileType.RegularFile,
    symLinkTarget,
  }: FileOptions
  ) {
    this.parent = parent;
    this.children = new Map();

    this.owner = owner;
    this.group = group;
    this.name = name;
    this.inode = inode;

    //TODO: modify this for symbolic links only
    //when changing the link target
    this.createdAt = new Date();
    this.modifiedAt = new Date();
    this.accessedAt = new Date();
    this.changedAt = new Date();

    this.fileType = fileType;

    if (this.fileType === FileType.SymbolicLink) {
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
    //TODO: set default permissions depending on the file type

    this.parent.addChild(this)
  }

  addChild(file: LinuxFile): LinuxFile {
    //validate that the file is a Dir
    if (this.fileType !== FileType.Directory)
      throw new FileSystemError("Not a directory", "Parent node is not a directory");

    this.children.set(file.name, file);

    return file;
  }

  getChild(name: string): LinuxFile | undefined {
    return this.children.get(name);
  }

  listChildren(): LinuxFile[] {
    return Array.from(this.children.values());
  }

  public get fullPath() {
    let path: string = this.name;

    let currentNode: LinuxFile = this;
    while (currentNode.parent !== currentNode) {

      path = currentNode.name + "/" + path;
      currentNode = currentNode.parent;
    }

    path = "/" + path;

    return path
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

    if (this.parent.getChild(new_name)) {
      throw new FileSystemError("File already exists", "Trying to assign an existing name for a new File instance");
    }

    //TODO: in theory, any other char can be used in a file name
    //so if in further updates there is any problem with that, I'd validate those chars here.

    this.changedAt = new Date();
    this._name = new_name;
  }

  public get name() {
    return this._name;
  }

  public get group() {
    return this._group;
  }

  public set group(new_group: string) {
    if (this.fileType === FileType.SymbolicLink) {
      this.symLinkTarget!.group = new_group;
      return;
    }

    //TODO: check if the group exists
    this.changedAt = new Date();
    this._group = new_group;
  }

  public get content() {
    if (this.fileType === FileType.SymbolicLink)
      return this.symLinkTarget!.content;

    //updates the last accessed date
    this.accessedAt = new Date();


    return this._content;
  }

  public set content(new_content: string) {
    if (this.fileType === FileType.SymbolicLink) {
      this.symLinkTarget!.content = new_content;
      return;
    }

    if (this.fileType === FileType.Directory)
      throw new FileSystemError(ErrorMsg.isADir(this._name), "Cannot add content to a Dir, only to files")

    //updates the last modified and changed date
    this.modifiedAt = new Date();
    this.changedAt = new Date();
    this._content = new_content;
  }

  public set permissions(new_permissions: string) {
    if (this.fileType === FileType.SymbolicLink) {
      this.symLinkTarget!.permissions = new_permissions;
      return;
    }

    PermissionManager.validateFormat(new_permissions)

    this.changedAt = new Date();
    this._permissions = new_permissions;
  }

  public get permissions() {
    return this._permissions;
  }

  public get size(): number {
    if (this.fileType === FileType.SymbolicLink)
      return this.symLinkTarget!.size;

    return this.content.length + 1;
  }

  public set owner(new_owner: string) {
    if (this.fileType === FileType.SymbolicLink) {
      this.symLinkTarget!.owner = new_owner;
      return;
    }

    //TODO: validate the owner exists
    this.changedAt = new Date();
    this._owner = new_owner;
  }

  public get owner() {
    return this._owner;
  }

  //do not have a setter in order to set this only when setting the symLinkTarget path
  public get targetInstance() {
    return this._targetInstance;
  }

  public get symLinkTarget(): string | undefined {
    return this._symLinkTarget;
  }

  public set symLinkTarget(new_target: string) {
    //NOTE: it does not matter if the target does not exist

    //check that there is no cycle generated by this new target
    let currentNode: LinuxFile | undefined = this.getFileInstance(new_target);

    if (!currentNode) {
      this._targetInstance = undefined;
      return;
    }

    const visitedNodes = new Map<number, boolean>();

    while (currentNode.fileType === FileType.SymbolicLink) {
      if (visitedNodes.has(currentNode.inode)) {
        throw new FileSystemError("Symbolic link target generates a cycle", "");
      }

      currentNode = currentNode.targetInstance as LinuxFile;
      visitedNodes.set(currentNode.inode, true)
    }

    this._symLinkTarget = new_target;
  }

  //FIX: this functions is not probably useful here, but I know it would in another place
  private getFileInstance(fullPath: string): LinuxFile | undefined {
    //TODO: think if it is necessary to validate the path (?)
    let currentNode = this.root;
    const names = fullPath.split("/")
    names.shift()

    while (names.length) {
      const nextNode = currentNode.getChild(names[0]);
      if (!nextNode)
        return undefined

      currentNode = nextNode;
      names.shift()
    }

    return currentNode;
  }

  public get root() {
    let currentNode: LinuxFile = this;
    while (currentNode.parent !== currentNode)
      currentNode = currentNode.parent;

    return currentNode;
  }
}
