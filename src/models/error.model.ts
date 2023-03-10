import { ErrorMap } from './synology.model';

import type { HttpError } from './http.model';
import type { Api } from './synology.model';

export enum ErrorType {
  Synology = 'synology',
  Login = 'login',
  Fetch = 'fetch',
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

    if (errors?.length) this.errors = this.errors?.map(err => (err.code ? { ...err, message: ErrorMap[api][err.code] } : err));
  }
}

export class FetchError extends Error {
  type = ErrorType.Fetch;
  error: Error;

  constructor(_error: Error, message = 'fetch_failed') {
    super(message);
    this.error = _error;
  }
}

export class LoginError extends Error {
  type = ErrorType.Login;
}

export class NotReadyError extends Error {
  type = ErrorType.NotReady;
}
