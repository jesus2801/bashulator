export default class FileSystemError extends Error {
  explanation: string;

  constructor(message: string, explanation: string) {
    super(message);
    this.name = "FileSystemError";
    this.explanation = explanation;
  }
}

