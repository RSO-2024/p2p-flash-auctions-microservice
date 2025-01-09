import { createClient } from "@supabase/supabase-js";
import { CronJob } from 'cron';
import dotenv from 'dotenv';
import { configManager } from "../config/configmanager";
import * as Sentry from "@sentry/node";

dotenv.config();

const auctionJob = new CronJob("0 * * * *", async () => {

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

            let errorMessage = `${currentTime} - [CRON JOB] Error calling process_ended_flash_auctions: ${error}`
            console.error(errorMessage);

            // Log to Sentry
            if (configManager.getConfig().NODE_ENV === "prod") {
                Sentry.captureMessage(errorMessage, "error");
            }
          } else {
            console.log(`${currentTime} - [CRON JOB] Flash auctions processed successfully: ${data}`);
          }

    } catch (error) {
        var currentTime = new Date().toISOString();

        let sentryMessage = `${currentTime} - [CRON JOB] Unexpected error during auction cleanup job: ${error}`

        console.error(sentryMessage)

        // Log to Sentry
        if (configManager.getConfig().NODE_ENV === "prod") {
            Sentry.captureMessage(sentryMessage, "error");
        }
    }
    
});

export default auctionJob;