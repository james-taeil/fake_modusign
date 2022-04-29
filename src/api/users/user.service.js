import bcrpytjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '../../common/exceptions/index.js';
import { hashRounds } from '../../config.js';
import * as jwt from '../../lib/jwt.js';

const { compare, hash } = bcrpytjs

export class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository
  }

  findById(id) {
    return this.userRepository.findById(id);
  }

  findByEmail(email) {
    return this.userRepository.findByEmail(email);
  }

  countByEmail(email) {
    return this.userRepository.countByEmail(email);
  }

  async signUp({ name, email, password }) {
    const { count: hasEmail } = this.countByEmail(email);

    if (hasEmail) {
      throw new BadRequestException('중복된 이메일이 있습니다.');
    }

    const encreyptedPassword = await hash(password, hashRounds);

    const id = uuidv4();
    const now = new Date().toISOString();

    this.userRepository.create({
      id,
      email,
      name,
      password: encreyptedPassword,
      created_at: now,
      updated_at: now,
    });

    return id;
  }

  async login({ email, password }) {
    const user = this.findByEmail(email);
    if (!user) {
      throw new BadRequestException(
        '이메일 또는 비밀번호를 다시 확인해 주세요.',
      );
    }

    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      throw new BadRequestException(
        '이메일 또는 비밀번호를 다시 확인해 주세요.',
      );
    }

    const token = jwt.sign({
      user_id: user.id,
      email,
    });

    return [token, user.toJson()]
  }
}
