import {
  IsBoolean,
  IsNumber,
  IsString,
  Length,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

class UpdateCarDetailsDto {
  @IsString()
  @Length(2)
  @ValidateIf((o) => o.brand !== undefined)
  brand?: string;

  @IsString()
  @Length(2)
  @ValidateIf((o) => o.model !== undefined)
  model?: string;

  @IsString()
  @Length(2)
  @ValidateIf((o) => o.modelDetail !== undefined)
  modelDetail?: string;

  @IsNumber()
  @ValidateIf((o) => o.year !== undefined)
  year?: number;

  @IsString()
  @Length(4)
  @ValidateIf((o) => o.plateNumber !== undefined)
  plateNumber?: string;

  @IsNumber()
  @Min(50)
  @ValidateIf((o) => o.horsePower !== undefined)
  horsePower?: number;

  @IsString()
  @ValidateIf((o) => o.transmission !== undefined)
  transmission?: string;

  @IsString()
  color: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @ValidateIf((o) => o.fuelLevel !== undefined)
  fuelLevel?: number;

  @IsNumber()
  @ValidateIf((o) => o.latitude !== undefined)
  latitude?: number;

  @IsNumber()
  @ValidateIf((o) => o.longitude !== undefined)
  longitude?: number;

  @IsBoolean()
  @ValidateIf((o) => o.isRentable !== undefined)
  isRentable?: boolean;

  @IsNumber()
  @Min(0)
  @ValidateIf((o) => o.pricePerDay !== undefined)
  pricePerDay?: number;

  @IsNumber()
  @Min(0)
  @ValidateIf((o) => o.pricePerMin !== undefined)
  pricePerMin?: number;

  @IsNumber()
  @Min(0)
  @ValidateIf((o) => o.fuelPrice !== undefined)
  fuelPrice?: number;
}

export { UpdateCarDetailsDto };
