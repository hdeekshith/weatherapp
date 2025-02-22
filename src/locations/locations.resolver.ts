import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { LocationsService } from './locations.service';
import { Location } from './entities';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../auth/entities';
import { FavoriteLocationDto } from './dto';

@Resolver(() => Location)
@UseGuards(JwtAuthGuard)
export class LocationsResolver {
  constructor(private readonly locationsService: LocationsService) { }

  @Query(() => [Location])
  async getFavoriteLocations(@CurrentUser() user: User): Promise<Location[]> {
    return this.locationsService.getFavoriteLocations(user);
  }

  @Mutation(() => String)
  async favoriteLocation(
    @Args('input') input: FavoriteLocationDto,
    @CurrentUser() user: User,
  ): Promise<string> {
    const result = await this.locationsService.favoriteLocation(
      input.city,
      user,
    );
    return result.message;
  }

  @Mutation(() => String)
  async deleteFavoriteLocation(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<string> {
    const result = await this.locationsService.deleteFavoriteLocation(id, user);
    return result.message;
  }
}
