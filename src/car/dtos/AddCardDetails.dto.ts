import { IsArray, IsNumber, IsString, Length, Max, Min } from 'class-validator';

class AddCarDetailsDto {
  @IsString()
  @Length(2)
  brand: string;

  @IsString()
  @Length(2)
  model: string;

  @IsString()
  @Length(2)
  modelDetail: string;

  @IsNumber()
  year: number;

  @IsString()
  @Length(4)
  plateNumber: string;

  @IsString()
  color: string;

  @IsNumber()
  @Min(50)
  horsePower: number;

  @IsString()
  transmission: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  fuelLevel: number;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  @Min(0)
  pricePerDay: number;

  @IsNumber()
  @Min(0)
  pricePerMin: number;

  @IsNumber()
  @Min(0)
  fuelPrice: number;

  @IsArray()
  carImages: string[];
}

export { AddCarDetailsDto };
