import moment from 'moment-timezone';
import { scrapePoolHours } from './scraping-utils.js';

/**
 * API route to scrape pool hours from Highlands Recreation District
 * 
 * The API accepts a 'date' query parameter (YYYY-MM-DD format) from the client
 * to determine which day's pool hours to return. This allows the client to specify
 * the date based on their local timezone rather than the server's timezone.
 * 
 * All time calculations are performed in GMT/UTC timezone to ensure consistency
 * regardless of the server's timezone. The client will handle local timezone conversion.
 * Website parsing assumes PST timezone since that's where the pool is located.
 * 
 * Example usage:
 * GET /api/pool-hours?date=2024-01-15
 */
export async function GET(request) {
  try {
    // Get the date from query parameters, defaulting to today if not provided
    const { searchParams } = new URL(request.url);
    const clientDate = searchParams.get('date'); // Expected format: YYYY-MM-DD
    
    const result = await scrapePoolHours(clientDate);
    
    return Response.json(result);
  } catch (error) {
    console.error('Error scraping pool hours:', error);
    return Response.json({
      hours: [],
      error: `Failed to scrape pool hours: ${error.message}`,
      timestamp: moment().utc().toISOString(),
      date: null,
      dayName: null
    }, { status: 500 });
  }
}


