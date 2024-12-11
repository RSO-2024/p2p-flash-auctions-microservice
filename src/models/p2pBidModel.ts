import { IsNumber, IsOptional, IsPositive, IsUUID } from "class-validator";
import { BaseModel, DataColumn, getDataColumn, getDataFieldEntries } from "./basemodel";
import supabase from "../supabase/client";
import { P2PAuctionModel } from "./p2pAuctionModel";

export class P2PBidModel extends BaseModel {

    static TABLE_NAME = 'p2p_bids'

    @DataColumn('bidding_id')
    @IsNumber()
    @IsOptional()
    bidding_id?: number;

    @DataColumn('auction_id')
    @IsUUID()
    auction_id!: string;

    @DataColumn('user_id')
    @IsUUID()
    @IsOptional()
    user_id?: string;

    @DataColumn('bid_amount')
    @IsNumber()
    @IsPositive()
    bid_amount!: number;

    prepareData(): void {
        throw new Error("Method not implemented.");
    }
    parseData(): void {
        throw new Error("Method not implemented.");
    }
    prepareQueryData(query_data: any): void {
        throw new Error("Method not implemented.");
    }


    // Custom APIs

    async getUserCredits(user : any) {

        this.user_id = user.id;

        // Get current user credits
        return await supabase.from('profiles').select('*, bid:p2p_bids ( bid_amount, auction_id )').eq('user_id', this.user_id).eq('bid.auction_id', this.auction_id).single();
    }

    async placeBid(authToken : string, bidData : any) {

        // User already bid on this auction
        if (bidData.bid && bidData.bid[0]) {
            this.bid_amount += bidData.bid[0].bid_amount;

            return await supabase.from(P2PBidModel.TABLE_NAME).update({... Object.fromEntries(getDataFieldEntries(this)), 'updated_at': new Date().toISOString()})
            .eq(getDataColumn(this, 'auction_id'), this.auction_id)
            .eq(getDataColumn(this, 'user_id'), this.user_id)
            .select().single()
            .setHeader(
                'Authorization', `${authToken}`
            );
        }
        
        // Else insert a new bid record
        return await supabase.from(P2PBidModel.TABLE_NAME).insert(Object.fromEntries(getDataFieldEntries(this))).select().single().setHeader(
            'Authorization', `${authToken}`
        );

        // Upsert the amount of bid tokens
        // Here we assume that the user has enough credits to bid with
        // When the bid is completed, we also update the credits in the table

        //return await supabase.from(P2PBidModel.TABLE_NAME).upsert({... Object.fromEntries(getDataFieldEntries(this)), 'updated_at': new Date().toISOString()}, {
        //    onConflict: 'auction_id, user_id'
        //}).setHeader(
        //    'Authorization', `${authToken}`
        //);
    }

    async updateUserCredits(authToken : string, creditData: any, bid_amount : number) {

        if (creditData.credits == undefined) {
            throw Error("No credits were found!")
        }
        
        return await supabase.from('profiles').update({
            credits: creditData.credits - bid_amount,
            updated_at: new Date().toISOString()
        }).eq('user_id', this.user_id).select().single().setHeader(
            'Authorization', `${authToken}`
        );
    }
    
}