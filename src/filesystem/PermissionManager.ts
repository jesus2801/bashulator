export default class PermissionManager {

  static readonly _linuxPermissionRegex = /^(r|-)(w|-)(x|-)(r|-)(w|-)(x|-)(r|-)(w|-)(x|-)$/;

  static validateFormat(permission: string) {
    return this._linuxPermissionRegex.test(permission);
  }
}
