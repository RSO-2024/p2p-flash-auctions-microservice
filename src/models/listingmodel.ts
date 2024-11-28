import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { BaseModel, IsDataField, IsNotUpdatable, IsQueryable } from './basemodel';
import { formatDateForPostgres } from '../utils/datetime';
import { dateRangeCondition, parseNumericValues, simpleCondition } from '../utils/dbUtils';

export class ListingModel extends BaseModel {

  // Data fields

  @IsDataField()
  @IsNotUpdatable()
  @IsNumber()
  user_id!: number;

  @IsDataField()
  @IsString()
  title!: string;

  @IsDataField()
  @IsString()
  @IsOptional()
  description?: string;

  @IsDataField()
  @IsNumber()
  user_price!: number;

  @IsDataField()
  @IsBoolean()
  @IsOptional()
  is_appraised?: boolean;

  @IsDataField()
  @IsBoolean()
  @IsOptional()
  is_auction: boolean = false;

  @IsDataField()
  @IsOptional()
  auction_end?: string;

  @IsDataField()
  @IsString()
  @IsOptional()
  seo_tag?: string;

  @IsDataField()
  @IsString()
  @IsOptional()
  seo_desc?: string;

  @IsDataField()
  @IsString()
  @IsOptional()
  url?: string;

  @IsDataField()
  @IsOptional()
  firstReg?: string;

  @IsDataField()
  @IsOptional()
  mileage?: number;

  @IsDataField()
  @IsString()
  @IsOptional()
  fuel?: string;

  @IsDataField()
  @IsString()
  @IsOptional()
  transmission?: string;

  @IsDataField()
  @IsNumber()
  @IsOptional()
  kw?: number;

  @IsDataField()
  @IsNumber()
  @IsOptional()
  engineSize?: number;

  @IsDataField()
  @IsString()
  @IsOptional()
  vin?: string;

  @IsDataField()
  @IsBoolean()
  @IsOptional()
  ddv?: boolean;

  @IsDataField()
  @IsString()
  @IsOptional()
  location?: string;

  @IsDataField()
  @IsNumber()
  @IsOptional()
  possiblePrice?: number;

  @IsDataField()
  @IsNumber()
  @IsOptional()
  deliveryPrice?: number;

  @IsDataField()
  @IsOptional()
  deliveryTime?: string;

  // Queryable fields

  @IsOptional()
  startFirstReg?: string;

  @IsOptional()
  endFirstReg?: string

  @IsOptional()
  @IsQueryable()
  firstReqQuery?: string

  @IsOptional()
  @IsQueryable()
  user_idQuery?: string

  // Prepare data from client for PostgresSQL database
  prepareData() {
    this.firstReg = formatDateForPostgres(this.firstReg);
    this.deliveryTime = formatDateForPostgres(this.deliveryTime);
  }

  // Prepare query data conditions
  prepareQueryData() {
    this.firstReqQuery = dateRangeCondition(this.startFirstReg, this.endFirstReg, "firstreg");
    this.user_idQuery = simpleCondition(this.user_id, "user_id");
  }

  // Parse date from PostgresSQL to client for easier interpretation
  parseData() {
    this.user_price = parseNumericValues(this.user_price, "float");
    this.kw = parseNumericValues(this.user_price, "float");
  }
}