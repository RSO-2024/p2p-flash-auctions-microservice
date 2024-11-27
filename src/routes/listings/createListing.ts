import { Router } from "express";
import sql from "../../database/db";
import { formatDateForPostgres } from "../../utils/datetime";
import { ListingModel } from "../../models/listingmodel";
import { validateOrReject } from "class-validator";

const router = Router();

/**
 * @swagger
 * /listings/create:
 *   post:
 *     tags:
 *      - Listings
 *     summary: Create a new listing
 *     description: Adds a new entry to the `listings` table with the provided data.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID of the user creating the listing.
 *               title:
 *                 type: string
 *                 description: Title of the listing.
 *                 maxLength: 255
 *               description:
 *                 type: string
 *                 description: Detailed description of the listing.
 *               user_price:
 *                 type: number
 *                 description: Price set by the user.
 *               is_appraised:
 *                 type: boolean
 *                 description: Indicates if the item is appraised.
 *               is_auction:
 *                 type: boolean
 *                 description: Indicates if the item is being auctioned.
 *               auction_end:
 *                 type: string
 *                 format: date-time
 *                 description: End date and time of the auction.
 *               seo_tag:
 *                 type: string
 *                 description: SEO tag for the listing.
 *               seo_desc:
 *                 type: string
 *                 description: SEO description for the listing.
 *               url:
 *                  type: string
 *                  description: URL of the current listing
 *               firstReg:
 *                  type: date-time
 *                  description: The date and time of first registration of the vehicle
 *               mileage:
 *                  type: number
 *                  description: Mileage on the car (in km)
 *               fuel:
 *                  type: string
 *                  description: Type of fuel
 *               transmission:
 *                  type: string
 *                  description: Type of transmission
 *               kw:
 *                  type: number
 *                  description: Power of the car (in kW)
 *               engineSize:
 *                  type: number
 *                  description: Size of engine (in cc)
 *               vin:
 *                  type: string
 *                  description: Vehicle identification number
 *               ddv:
 *                  type: boolean
 *                  description: DDV included
 *               location:
 *                  type: number
 *                  description: Mileage on the car
 *               possiblePrice:
 *                  type: number
 *                  description: First possible price on the car
 *               deliveryPrice:
 *                  type: number
 *                  description: Price of the delivery
 *               deliveryTime:
 *                  type: datetime
 *                  description: Date and time of the delivery possible
 *     responses:
 *       201:
 *         description: Listing created successfully.
 *       400:
 *         description: Invalid request data.
 *       500:
 *         description: Internal server error.
 */
router.post("/", async (req, res) => {
  try {
    // Map request body to the ListingRequest class
    const listingData = Object.assign(new ListingModel(), req.body);

    // Validate the data
    await validateOrReject(listingData);

    // Generate SQL INSERT query dynamically
    const sqlQuery = listingData.toCreateSQL('listings');
    
    // Execute the query
    const result = await sql.unsafe(sqlQuery);

    // Return the created record
    res.status(201).json({
      status: "success",
      message: "Listing created successfully.",
      data: result[0],
    });
  } catch (error) {
    console.error("Error creating listing:", error);
    res.status(500).json({
      status: "error",
      message: `Internal server error.`,
    });
  }
});

export default router;