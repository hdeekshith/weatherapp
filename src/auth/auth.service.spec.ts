import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { LoggerService } from '../common/logger/logger.service';
import { mockUser } from '../tests/mocks/auth';
import { AuthService } from './auth.service';
import { User } from './entities';

const mockToken = { access_token: 'mock-jwt-token' };

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue(mockToken.access_token),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signup', () => {
    it('should create a user and return a token', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword123');
      jest.spyOn(userRepository, 'create').mockReturnValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

      const result = await authService.signup({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockToken);
      expect(userRepository.create).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123',
      });
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should throw a ConflictException if email is already registered', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      await expect(
        authService.signup({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);

      expect(userRepository.create).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should log an error and throw if an unexpected error occurs in signup', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockRejectedValue(new Error('DB error'));

      await expect(
        authService.signup({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(Error);

      expect(loggerService.error).toHaveBeenCalledWith(
        'Signup failed for email: john@example.com',
        expect.any(Error),
      );
    });
  });

  describe('login', () => {
    it('should return a token if credentials are valid', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await authService.login({
        email: 'john@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockToken);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
        select: ['id', 'email', 'password'],
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        mockUser.password,
      );
    });

    it('should throw an UnauthorizedException if credentials are invalid', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(
        authService.login({
          email: 'john@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw an UnauthorizedException if user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'john@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should log an error and throw if an unexpected error occurs in login', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockRejectedValue(new Error('DB error'));

      await expect(
        authService.login({
          email: 'john@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(Error);

      expect(loggerService.error).toHaveBeenCalledWith(
        'Login failed for email: john@example.com',
        expect.any(Error),
      );
    });
  });

  describe('generateToken', () => {
    it('should generate a JWT token for a user', () => {
      const result = (authService as any).generateToken(mockUser);
      expect(result).toEqual(mockToken);
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
      });
    });
  });
});
