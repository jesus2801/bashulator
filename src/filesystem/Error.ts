export default class FileSystemError extends Error {
  constructor(message: string, explanation: string) {
    super(message);
    this.name = "FileSystemError";
  }
}

