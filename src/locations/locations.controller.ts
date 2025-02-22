import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FavoriteLocationDto } from './dto/favorite-location.dto';
import { User } from '../auth/entities';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Location } from './entities';

@ApiTags('Locations')
@ApiBearerAuth()
@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Favorite a location' })
  @ApiResponse({
    status: 201,
    description: 'Location added successfully to favorites',
  })
  @ApiResponse({
    status: 409,
    description: 'Location already exists in favorites',
  })
  async favoriteLocation(
    @Body() dto: FavoriteLocationDto,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    return this.locationsService.favoriteLocation(dto.city, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get user favorite locations' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of favorite locations',
  })
  async getFavoriteLocations(@CurrentUser() user: User): Promise<Location[]> {
    return this.locationsService.getFavoriteLocations(user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a location from favorites' })
  @ApiResponse({ status: 200, description: 'Location deleted successfully' })
  @ApiResponse({ status: 404, description: 'Location not found in favorites' })
  async deleteLocation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    return this.locationsService.deleteFavoriteLocation(+id, user);
  }
}
