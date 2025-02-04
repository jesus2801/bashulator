export enum FileType {
  RegularFile = "-",
  Directory = "d",
  SymbolicLink = "l",
  CharacterDevice = "c",
  BlockDevice = "b",
  NamedPipe = "p",
  Socket = "s",
  //Door = "D" //NOTE: Do not know if it is a good idea to implement this
}
