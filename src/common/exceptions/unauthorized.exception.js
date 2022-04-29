import { HttpException } from './http.exception.js';

export class UnauthorizedException extends HttpException {
  constructor(message = '인증 자격 증명이 유효하지 않습니다.') {
    super(401, message);
  }
}
