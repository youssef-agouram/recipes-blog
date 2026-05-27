const { Client } = require('pg');

async function main() {
  const remoteUrl = "postgresql://postgres.vzngrcrdyzsahnuofvmw:Ayou123beMr@aws-1-eu-west-2.pooler.supabase.com:5432/postgres";
  const remoteClient = new Client({ connectionString: remoteUrl });
  try {
    console.log("Connecting to Supabase direct port 5432...");
    await remoteClient.connect();
    console.log("SUCCESS! Connected to Supabase direct port.");
    const res = await remoteClient.query("SELECT COUNT(*) FROM \"Article\"");
    console.log("Article count on Supabase:", res.rows[0].count);
    const articles = await remoteClient.query("SELECT id, title, \"imageUrl\" FROM \"Article\"");
    console.log("Articles on Supabase:", articles.rows);
  } catch (err) {
    console.error("Failed to connect to Supabase:", err.message);
  } finally {
    await remoteClient.end().catch(() => {});
  }
}

main();
