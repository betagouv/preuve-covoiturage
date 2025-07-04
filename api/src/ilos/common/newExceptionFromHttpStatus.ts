import {
  ConflictException,
  Exception,
  ForbiddenException,
  InvalidRequestException,
  MethodNotFoundException,
  NotFoundException,
  ServiceDisabledException,
  TimeoutException,
  TooManyRequestsException,
  UnauthorizedException,
  UnexpectedException,
  UnimplementedException,
  UnprocessableRequestException,
} from "./index.ts";

export function newExceptionFromHttpStatus(status: number, text?: string): Exception {
  switch (status) {
    case 400:
      return new InvalidRequestException(text);
    case 401:
      return new UnauthorizedException(text);
    case 403:
      return new ForbiddenException(text);
    case 404:
      return new NotFoundException(text);
    case 405:
      return new MethodNotFoundException(text);
    case 408:
      return new TimeoutException(text);
    case 409:
      return new ConflictException(text);
    case 422:
      return new UnprocessableRequestException(text);
    case 429:
      return new TooManyRequestsException(text);
    case 500:
      return new UnexpectedException(text);
    case 501:
      return new UnimplementedException(text);
    case 503:
      return new ServiceDisabledException();
    default:
      return new Exception(`Unexpected HTTP status: ${status}`);
  }
}
