export const ErrorMsg: { [name: string]: ((params: any) => string) } = {
  isADir: (n: string) => `${n} Is a directory`
}
