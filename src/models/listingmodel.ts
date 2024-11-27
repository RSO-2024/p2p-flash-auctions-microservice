import { IsString, IsNumber, IsBoolean, IsOptional, validateOrReject } from 'class-validator';
import { BaseModel } from './basemodel';
import { formatDateForPostgres } from '../utils/datetime';

export class ListingModel extends BaseModel {

  @IsNumber()
  user_id!: number;

  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  user_price!: number;

  @IsBoolean()
  @IsOptional()
  is_appraised?: boolean;

  @IsBoolean()
  @IsOptional()
  is_auction: boolean = false;

  @IsString()
  @IsOptional()
  auction_end?: string;

  @IsString()
  @IsOptional()
  seo_tag?: string;

  @IsString()
  @IsOptional()
  seo_desc?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsOptional()
  firstReg?: string;

  @IsOptional()
  mileage?: number;

  @IsString()
  @IsOptional()
  fuel?: string;

  @IsString()
  @IsOptional()
  transmission?: string;

  @IsNumber()
  @IsOptional()
  kw?: number;

  @IsNumber()
  @IsOptional()
  engineSize?: number;

  @IsString()
  @IsOptional()
  vin?: string;

  @IsString()
  @IsOptional()
  ddv?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber()
  @IsOptional()
  possiblePrice?: number;

  @IsNumber()
  @IsOptional()
  deliveryPrice?: number;

  @IsOptional()
  deliveryTime?: string;

  // Parse dates to the PostgreSQL format
  parseDates() {
    this.firstReg = formatDateForPostgres(this.firstReg);
    this.deliveryTime = formatDateForPostgres(this.deliveryTime);
  }
}
