import { Api, ErrorMap } from './synology.model';
import { HttpError } from './http.model';

export class SynologyError extends Error {
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
