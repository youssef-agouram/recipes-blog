const { BetaAnalyticsDataClient } = require('@google-analytics/data');

const ga4PropertyId = "538988923";
const ga4ServiceAccount = {
  "type": "service_account",
  "project_id": "recipes-blog-497518",
  "private_key_id": "REMOVED",
  "private_key": "REMOVED",
  "client_email": "analytics-reader@recipes-blog-497518.iam.gserviceaccount.com",
  "client_id": "105164227888212465583",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/analytics-reader%40recipes-blog-497518.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

async function main() {
  const client = new BetaAnalyticsDataClient({ credentials: ga4ServiceAccount });
  const property = `properties/${ga4PropertyId}`;

  console.log("Querying GA4 API...");
  const [response] = await client.runReport({
    property,
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'sessionSource' }],
    metrics: [{ name: 'activeUsers' }],
    limit: 6
  });

  console.log("Successfully retrieved GA4 data!");
  console.log(JSON.stringify(response, null, 2));
}

main().catch(err => {
  console.error("Failed to query GA4:");
  console.error(err);
});
