// file: scripts/test-yelp-api.ts
// description: Verifies Yelp API connectivity and data availability for Columbus, OH (43228)
// reference: server/_core/yelp_rest_search.ts

const YELP_API_KEY = process.env.YELP_API_KEY;
const YELP_API_BASE = 'https://api.yelp.com/v3';

if (!YELP_API_KEY) {
  console.error('❌ Error: YELP_API_KEY is not set in environment variables.');
  process.exit(1);
}

async function testYelpApi() {
  console.log('🧪 Starting Yelp API Test...');
  console.log('📍 Target: Columbus, OH 43228');

  const startTime = performance.now();
  
  try {
    const params = new URLSearchParams({
      location: '43228',
      term: 'plumber',
      limit: '5',
      sort_by: 'best_match'
    });

    const url = `${YELP_API_BASE}/businesses/search?${params.toString()}`;
    
    console.log(`📡 Requesting: ${url}`);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${YELP_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    console.log('\n✅ Yelp API Success!');
    console.log(`⏱️  Latency: ${duration}ms`);
    console.log(`📦 Results found: ${data.total}`);
    console.log(`📝 Returned: ${data.businesses?.length} businesses`);

    if (data.businesses && data.businesses.length > 0) {
      console.log('\n🏢 First Result Sample:');
      const first = data.businesses[0];
      console.log(`   Name: ${first.name}`);
      console.log(`   Address: ${first.location?.address1}, ${first.location?.city}`);
      console.log(`   Rating: ${first.rating} (${first.review_count} reviews)`);
      console.log(`   Distance: ${(first.distance / 1609.34).toFixed(2)} miles`);
    } else {
      console.warn('⚠️  No businesses returned for this query.');
    }

  } catch (error) {
    console.error('\n❌ Yelp API Test Failed:', error);
    process.exit(1);
  }
}

testYelpApi();

