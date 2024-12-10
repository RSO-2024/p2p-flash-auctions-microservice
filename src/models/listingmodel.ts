import { IsString, IsNumber, IsBoolean, IsOptional, IsUUID, validateOrReject } from 'class-validator';
import { BaseModel, DataColumn, getDataColumn, getDataFieldEntries, IsQueryable } from './basemodel';
import { formatDateForPostgres } from '../utils/datetime';
import { parseNumericValues } from '../utils/dbUtils';
import supabase from '../supabase/client';

export class ListingModel extends BaseModel {

  TABLE_NAME = 'p2p_listings';

  // Data fields
  @DataColumn('listing_id')
  @IsOptional()
  listing_id?: number;
  
  @DataColumn('user_id')
  @IsUUID()
  user_id?: string;

  @DataColumn('title')
  @IsString()
  title!: string;

  @DataColumn('description')
  @IsString()
  @IsOptional()
  description?: string;

  @DataColumn('user_price')
  @IsNumber()
  user_price!: number;

  @DataColumn('seo_tag')
  @IsString()
  @IsOptional()
  seo_tag?: string;

  @DataColumn('seo_desc')
  @IsString()
  @IsOptional()
  seo_desc?: string;

  @DataColumn('firstreg')
  @IsOptional()
  firstreg?: string;

  @DataColumn('man_year')
  @IsOptional()
  man_year?: string;

  @DataColumn('mileage')
  @IsOptional()
  mileage?: number;

  @DataColumn('fuel')
  @IsString()
  @IsOptional()
  fuel?: string;

  @DataColumn('transmission')
  @IsString()
  @IsOptional()
  transmission?: string;

  @DataColumn('kw')
  @IsNumber()
  @IsOptional()
  kw?: number;

  @DataColumn('enginesize')
  @IsNumber()
  @IsOptional()
  enginesize?: number;

  @DataColumn('vin')
  @IsString()
  @IsOptional()
  vin?: string;

  @DataColumn('ddv')
  @IsBoolean()
  @IsOptional()
  ddv?: boolean;

  @DataColumn('location')
  @IsString()
  @IsOptional()
  location?: string;

  @DataColumn('color')
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
  startReqQuery?: string

  @IsOptional()
  @IsQueryable()
  endReqQuery?: string

  @IsOptional()
  @IsQueryable()
  userIdQuery?: string

  // Prepare data from client for PostgresSQL database
  prepareData() {
    this.firstreg = formatDateForPostgres(this.firstreg);
    this.man_year = formatDateForPostgres(this.man_year);
  }

  // Prepare query data conditions
  prepareQueryData(queryData : any) {
    this.startReqQuery = queryData.startFirstReg;
    this.endReqQuery = queryData.endFirstReqQuery;
    this.titleQuery = queryData.title;
    this.listingIdQuery = queryData.listing_id;
  }

  // Applies all the Postgres filters to the query
  applyFilters(query: any) {
    
    if (this.startReqQuery) {
      query = query.gte(getDataColumn(this, 'firstreg'), this.startReqQuery);
    }
    if (this.endReqQuery) {
      query = query.lte(getDataColumn(this, 'firstreg'), this.endReqQuery);
    }
    if (this.titleQuery) {
      query = query.like(getDataColumn(this, 'title'), `%${this.titleQuery}%`);
    }
    if (this.listingIdQuery) {
      query = query.eq(getDataColumn(this, 'listing_id'), this.listingIdQuery);
    }

    return query;
  }

  // Parse date from PostgresSQL to client for easier interpretation
  parseData() {
    this.user_price = parseNumericValues(this.user_price, "float");
    this.kw = parseNumericValues(this.user_price, "float");
  }

  // Custom APIs
  async fetchData() {

    // Validate the data
    await validateOrReject(this, {
      skipMissingProperties: true
    });

    var query = supabase.from(this.TABLE_NAME).select(`*, profiles ( username )`);

    query = this.applyFilters(query);

    return await query;
  }

  async createListing(user : any, authToken : string) {

    this.user_id = user.id;

    if (!this.user_id) {
      throw Error("The user id was not provided for the data.")
    }

    // Validate the data
    await validateOrReject(this);

    let query = supabase.from(this.TABLE_NAME).insert(Object.fromEntries(getDataFieldEntries(this))).setHeader(
      'Authorization', `${authToken}`
    );

    return await query;
  }

  async deleteListing(user : any, authToken : string) {

    this.user_id = user.id;

    if (!this.user_id) {
      throw Error("The user id was not provided for the data.");
    }

    if (!this.listingIdQuery) {
      throw Error("The listing id was not provided for the data.");
    }

    // Validate the data
    await validateOrReject(this, {
      skipMissingProperties: true
    });

    var query = supabase.from(this.TABLE_NAME).delete().setHeader(
      'Authorization', `${authToken}`
    );

    query = this.applyFilters(query);

    return await query;
  }

  async updateListing(user : any, authToken : string) {

    this.user_id = user.id;

    if (!this.user_id) {
      throw Error("The user id was not provided for the data.");
    }

    if (!this.listingIdQuery) {
      throw Error("The listing id was not provided for the data.");
    }

    // Validate the data
    await validateOrReject(this, {
      skipMissingProperties: true
    });
    
    var query = supabase.from(this.TABLE_NAME).update(Object.fromEntries(getDataFieldEntries(this))).setHeader(
      'Authorization', `${authToken}`
    );

    query = this.applyFilters(query);

    return await query;
  }

}