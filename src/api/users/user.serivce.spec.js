import { compare } from 'bcryptjs';
import { internet } from 'faker';
import { UserRepository } from './user.repository.js';
import { UserService } from './user.service.js';

describe('UserService', () => {
  let userService;
  let userRepository;

  beforeEach(async () => {
    userRepository = new UserRepository();
    userService = new UserService(userRepository);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('signUp', () => {
    it('성공 - 비밀번호를 암호화하고 사용자를 생성한다.', async () => {
      // given
      const countByEmailStub = jest
        .spyOn(userRepository, 'countByEmail')
        .mockImplementation(() => ({ count: 0 }));
      const createStub = jest
        .spyOn(userRepository, 'create')
        .mockImplementation((user) => ({
          lastInsertRowid: user.id,
          changes: 1,
        }));

      const dto = {
        email: internet.email(),
        name: internet.userName(),
        password: internet.password(),
      };

      // when
      const result = await userService.signUp(dto);

      // then
      expect(result).not.toBeFalsy();
      expect(countByEmailStub).toHaveBeenCalled();
      expect(createStub).toHaveBeenCalled();

      const user = createStub.mock.calls[0][0];
      expect(user.id).toEqual(result);
      expect(user.email).toEqual(dto.email);
      expect(user.name).toEqual(dto.name);

      const isValidPassword = await compare(dto.password, user.password);
      expect(isValidPassword).toBe(true);
    });

    it('실패 - 이미 사용중인 이메일은 가입 할 수 없다.', async () => {
      // given
      const countByEmailStub = jest
        .spyOn(userRepository, 'countByEmail')
        .mockImplementation(() => ({ count: 1 }));
      const createStub = jest
        .spyOn(userRepository, 'create')
        .mockImplementation((user) => ({
          lastInsertRowid: user.id,
          changes: 1,
        }));

      const dto = {
        email: internet.email(),
        name: internet.userName(),
        password: internet.password(),
      };

      // when
      const result = expect(() => userService.signUp(dto));

      // then
      await result.rejects.toThrow('중복된 이메일이 있습니다.');

      expect(countByEmailStub).toHaveBeenCalled();
      expect(createStub).not.toHaveBeenCalled();
    });
  });
});
