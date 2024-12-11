import { createClient } from "@supabase/supabase-js";
import { CronJob } from 'cron';
import dotenv from 'dotenv';

dotenv.config();

const auctionJob = new CronJob('*/10 * * * *', async () => {

    try {
        var currentTime = new Date().toISOString();
        const supabaseAdminClient = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_KEY!
        );

        console.log(`${currentTime} - [CRON JOB] Running Flash Auction automation cron job...`);

        const { data, error } = await supabaseAdminClient.rpc('flash_auction_cleanup');

        supabaseAdminClient.auth.signOut();
        
        if (error) {
            console.error(`${currentTime} - [CRON JOB] Error calling process_ended_flash_auctions:`, error);
          } else {
            console.log(`${currentTime} - [CRON JOB] Flash auctions processed successfully:`, data);
          }

    } catch (error) {
        var currentTime = new Date().toISOString();
        console.error(`${currentTime} - [CRON JOB] Unexpected error during auction cleanup job`, error)
    }
    
});

export default auctionJob;