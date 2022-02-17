import { Api, ErrorMap } from './synology.model';
import { HttpError } from './http.model';

export enum ErrorType {
  Synology = 'synology',
  Login = 'login',
  NotReady = 'not-ready',
}

export class SynologyError extends Error {
  type = ErrorType.Synology;
  api: Api;
  code: number;
  errors?: any[];

  constructor(api: Api, { code, errors }: HttpError) {
    super(ErrorMap[api][code] ?? code);

    this.code = code;
    this.api = api;
    this.errors = errors;
  }
}

export class LoginError extends Error {
  type = ErrorType.Login;

  constructor(msg?: string) {
    super(msg);
  }
}

export class NotReadyError extends Error {
  type = ErrorType.NotReady;

  constructor(msg?: string) {
    super(msg);
  }
}
