import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities';
import { User } from '../auth/entities';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    private readonly logger: LoggerService,
  ) { }

  async favoriteLocation(
    city: string,
    user: User,
  ): Promise<{ message: string }> {
    try {
      const existingLocation = await this.locationRepository.findOne({
        where: { city, user: { id: user.id } },
      });
      if (existingLocation) {
        throw new ConflictException('Location already exists in favorites');
      }

      const location = this.locationRepository.create({ city, user });
      await this.locationRepository.insert(location);
      return { message: 'Location added successfully to favorites' };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      this.logger.error('Error adding location', error);
      throw new InternalServerErrorException('Could not add location');
    }
  }

  async getFavoriteLocations(user: User): Promise<Location[]> {
    try {
      return await this.locationRepository
        .createQueryBuilder('location')
        .where('location.user.id = :userId', { userId: user.id })
        .orderBy('location.createdAt', 'DESC')
        .getMany();
    } catch (error) {
      this.logger.error('Error fetching locations', error);
      throw new InternalServerErrorException('Could not fetch locations');
    }
  }

  async deleteFavoriteLocation(
    id: number,
    user: User,
  ): Promise<{ message: string }> {
    try {
      const result = await this.locationRepository.delete({ id, user });

      if (!result.affected) {
        throw new NotFoundException('Location not found in favorites');
      }
      return { message: 'Location deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error deleting location', error);
      throw new InternalServerErrorException('Could not delete location');
    }
  }

  async getUniqueCities(): Promise<string[]> {
    const locations = await this.locationRepository
      .createQueryBuilder('location')
      .select('DISTINCT location.city', 'city')
      .getRawMany();

    return locations.map((loc) => loc.city);
  }
}
