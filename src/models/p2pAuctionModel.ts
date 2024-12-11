import { IsString, IsNumber, IsBoolean, IsOptional, IsUUID, validateOrReject, IsPositive, IsDate } from 'class-validator';
import { BaseModel, DataColumn, getDataColumn, getDataFieldEntries, IsQueryable } from './basemodel';
import { formatDateForPostgres, validateISODateRange } from '../utils/datetime';
import { parseNumericValues } from '../utils/dbUtils';
import supabase from '../supabase/client';

export class P2PAuctionModel extends BaseModel {

  static TABLE_NAME = 'p2p_auctions';

  // Data fields
  @DataColumn('auction_id')
  @IsOptional()
  @IsUUID()
  auction_id?: number;

  @DataColumn('listing_id')
  listing_id!: number;

  @DataColumn('start_time')
  @IsString()
  start_time!: string;

  @DataColumn('end_time')
  @IsString()
  end_time!: string;

  @DataColumn('is_flash')
  @IsBoolean()
  is_flash?: boolean;

  @DataColumn('has_ended')
  @IsBoolean()
  has_ended?: boolean;

  // Query fiels
  @IsQueryable()
  @IsOptional()
  auctionIdQuery?: string;

  @IsQueryable()
  @IsOptional()
  isFlashQuery?: boolean;

  @IsQueryable()
  @IsOptional()
  hasEndedQuery?: boolean;

  prepareData(): void {
    throw new Error('Method not implemented.');
  }

  // Prepare query data conditions
  prepareQueryData(queryData : any) {
    this.auctionIdQuery = queryData.auction_id;
    this.isFlashQuery = queryData.is_flash;
    this.hasEndedQuery = queryData.has_ended;
  }

  // Applies all the Postgres filters to the query
  applyFilters(query: any) {
    
    if (this.auctionIdQuery != undefined) {
      query = query.eq(getDataColumn(this, 'auction_id'), this.auctionIdQuery);
    }
    if (this.isFlashQuery != undefined) {
      query = query.eq(getDataColumn(this, 'is_flash'), this.isFlashQuery);
    }
    if (this.hasEndedQuery != undefined) {
      query = query.eq(getDataColumn(this, 'has_ended'), this.hasEndedQuery);
    }

    return query;
  }

  // Parse date from PostgresSQL to client for easier interpretation
  parseData() {
  }

  // Custom APIs
  async getAuctions() {

    // Validate the data
    await validateOrReject(this, {
      skipMissingProperties: true
    });

    // Get all auctions with listings and users along with top bids
    var query = supabase.from(P2PAuctionModel.TABLE_NAME).select(`
      *,
      listing:p2p_listings (
        *,
        user:profiles (
          username
        )
      ),
      bids:p2p_bids (
        bid_amount,
        updated_at,
        user: profiles (
          username
        )
      )
    `)
    .order('bid_amount', { referencedTable: 'p2p_bids', ascending: false })
    .limit(3, { referencedTable: 'p2p_bids' });

    query = this.applyFilters(query);

    return await query;
  }
  
  async createFlashAuction(authToken : string) {

    // Validate the data
    await validateOrReject(this);

    // Validate date range
    if (!validateISODateRange(this.start_time, this.end_time)) {
      throw Error("Start and end dates are invalid.")
    }

    let query = supabase.from(P2PAuctionModel.TABLE_NAME).insert(Object.fromEntries(getDataFieldEntries(this))).setHeader(
      'Authorization', `${authToken}`
    );

    return await query;
  }
}