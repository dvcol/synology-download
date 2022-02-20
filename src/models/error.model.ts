import { HttpError } from './http.model';
import { Api, ErrorMap } from './synology.model';

export enum ErrorType {
  Synology = 'synology',
  Login = 'login',
  NotReady = 'not_ready',
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
}

export class NotReadyError extends Error {
  type = ErrorType.NotReady;
}
