import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './dto';

const mockSignupDto: SignupDto = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
};

const mockLoginDto: LoginDto = {
  email: 'john@example.com',
  password: 'password123',
};

const mockAuthResponse = { access_token: 'mock-jwt-token' };

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signup: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signup', () => {
    it('should successfully register a user and return a token', async () => {
      jest.spyOn(authService, 'signup').mockResolvedValue(mockAuthResponse);

      const result = await authController.signup(mockSignupDto);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.signup).toHaveBeenCalledWith(mockSignupDto);
    });

    it('should throw a ConflictException if email is already registered', async () => {
      jest
        .spyOn(authService, 'signup')
        .mockRejectedValue(
          new ConflictException('Email is already registered'),
        );

      await expect(authController.signup(mockSignupDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should successfully authenticate a user and return a token', async () => {
      jest.spyOn(authService, 'login').mockResolvedValue(mockAuthResponse);

      const result = await authController.login(mockLoginDto);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.login).toHaveBeenCalledWith(mockLoginDto);
    });

    it('should throw an UnauthorizedException if login credentials are invalid', async () => {
      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(
          new UnauthorizedException('Invalid email or password'),
        );

      await expect(authController.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
