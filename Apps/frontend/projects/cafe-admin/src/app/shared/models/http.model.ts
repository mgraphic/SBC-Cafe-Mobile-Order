export interface IHttpError {
  error: string;
}

export interface IHttpSuccess<T> {
  message?: string;
  data?: T;
}

export type HttpResponse<T = never> = IHttpSuccess<T> | IHttpError;
