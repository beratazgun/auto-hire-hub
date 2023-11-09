import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

class TerminateBodyDto {
  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  fuelLevel: number;
}

export { TerminateBodyDto };
