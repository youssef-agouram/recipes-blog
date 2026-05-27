const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ga4PropertyId = "538988923";
const ga4Id = "G-DWMNJJXF87";
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
  const currentSettings = await prisma.analyticsSettings.findFirst();
  console.log("Current Settings in DB:", currentSettings);

  const updatedSettings = await prisma.analyticsSettings.upsert({
    where: { id: 1 },
    update: {
      ga4PropertyId,
      ga4Id,
      googleAnalyticsId: ga4Id,
      ga4ServiceAccount: JSON.stringify(ga4ServiceAccount),
      analyticsEnabled: true,
    },
    create: {
      id: 1,
      ga4PropertyId,
      ga4Id,
      googleAnalyticsId: ga4Id,
      ga4ServiceAccount: JSON.stringify(ga4ServiceAccount),
      analyticsEnabled: true,
      trackingSettings: { pageTracking: true, recipeTracking: true, searchTracking: true }
    }
  });

  console.log("Updated Settings in DB:", updatedSettings);
}

main()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
