import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { LoggerService } from '../common/logger/logger.service';
import { LoginDto, SignupDto } from './dto';
import { User } from './entities';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
  ) { }

  async signup({
    email,
    password,
    name,
  }: SignupDto): Promise<{ access_token: string }> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });
      if (existingUser) {
        throw new ConflictException('Email is already registered');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = this.userRepository.create({
        name,
        email,
        password: hashedPassword,
      });
      await this.userRepository.save(user);

      return this.generateToken(user);
    } catch (error) {
      this.logger.error(`Signup failed for email: ${email}`, error);
      throw error;
    }
  }

  async login({
    email,
    password,
  }: LoginDto): Promise<{ access_token: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        select: ['id', 'email', 'password'],
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new UnauthorizedException('Invalid email or password');
      }

      return this.generateToken(user);
    } catch (error) {
      this.logger.error(`Login failed for email: ${email}`, error);
      throw error;
    }
  }

  private generateToken(user: User): { access_token: string } {
    return {
      access_token: this.jwtService.sign({ id: user.id, email: user.email }),
    };
  }
}
