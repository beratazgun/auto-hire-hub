import { IsString, ValidateIf } from 'class-validator';

export class FilterDto {
  @ValidateIf((o) => o.page !== undefined)
  @IsString()
  page?: string;

  @ValidateIf((o) => o.limit !== undefined)
  @IsString()
  limit?: string;

  @ValidateIf((o) => o.price !== undefined)
  @IsString()
  price?: string;

  @ValidateIf((o) => o.year !== undefined)
  @IsString()
  year?: string;

  @ValidateIf((o) => o.brand !== undefined)
  @IsString()
  brand?: string;

  @ValidateIf((o) => o.horsePower !== undefined)
  @IsString()
  horsePower?: string;

  @ValidateIf((o) => o.model !== undefined)
  @IsString()
  model?: string;

  @ValidateIf((o) => o.transmission !== undefined)
  @IsString()
  transmission?: string;

  @ValidateIf((o) => o.sort !== undefined)
  @IsString()
  sort?: string;

  @ValidateIf((o) => o.fuelLevel !== undefined)
  @IsString()
  fuelLevel?: string;

  @ValidateIf((o) => o.isRentable !== undefined)
  @IsString()
  isRentable?: string;

  @ValidateIf((o) => o.fuelPrice !== undefined)
  @IsString()
  fuelPrice?: string;

  @ValidateIf((o) => o.pricePerMin !== undefined)
  @IsString()
  pricePerMin?: string;

  @ValidateIf((o) => o.pricePerDay !== undefined)
  @IsString()
  pricePerDay?: string;
}
