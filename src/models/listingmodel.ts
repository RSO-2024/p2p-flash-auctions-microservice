import { IsString, IsNumber, IsBoolean, IsOptional, IsDate } from 'class-validator';
import { BaseModel, IsDataField, IsNotUpdatable, IsQueryable } from './basemodel';
import { formatDateForPostgres } from '../utils/datetime';
import { dateRangeCondition, likeCondition, parseNumericValues, simpleCondition } from '../utils/dbUtils';

export class ListingModel extends BaseModel {

  // Data fields

  @IsDataField()
  @IsNotUpdatable()
  @IsString()
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
  @IsString()
  @IsOptional()
  seo_tag?: string;

  @IsDataField()
  @IsString()
  @IsOptional()
  seo_desc?: string;

  @IsDataField()
  @IsOptional()
  firstReg?: string;

  @IsDataField()
  @IsOptional()
  man_year?: string;

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
  @IsString()
  @IsOptional()
  color?: string;

  // Queryable fields

  @IsOptional()
  @IsQueryable()
  listingIdQuery?: string;

  @IsOptional()
  @IsQueryable()
  titleQuery?: string

  @IsOptional()
  @IsQueryable()
  firstReqQuery?: string

  @IsOptional()
  @IsQueryable()
  userIdQuery?: string

  // Prepare data from client for PostgresSQL database
  prepareData() {
    this.firstReg = formatDateForPostgres(this.firstReg);
    this.man_year = formatDateForPostgres(this.man_year);
  }

  // Prepare query data conditions
  prepareQueryData(query_data : any) {
    // Build queries
    this.firstReqQuery = dateRangeCondition(query_data.startFirstReg, query_data.endFirstReg, "firstreg");
    this.userIdQuery = simpleCondition(query_data.user_id, "user_id");
    this.titleQuery = likeCondition(query_data.title, "title");
    this.listingIdQuery = simpleCondition(query_data.listing_id, "listing_id");
  }

  // Parse date from PostgresSQL to client for easier interpretation
  parseData() {
    this.user_price = parseNumericValues(this.user_price, "float");
    this.kw = parseNumericValues(this.user_price, "float");
  }
}