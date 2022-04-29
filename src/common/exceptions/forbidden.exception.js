import { HttpException } from './http.exception.js';

export class ForbiddenException extends HttpException {
  constructor(message = '접근 권한이 없습니다.') {
    super(403, message);
  }
}
