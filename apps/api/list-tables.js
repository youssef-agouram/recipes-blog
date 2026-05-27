const { Client } = require('pg');

async function main() {
  const url = "postgresql://postgres:postgres@localhost:5432/postgres";
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    console.log("Connected to postgres database.");
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public' AND table_type='BASE TABLE'
    `);
    console.log("Tables:", tables.rows.map(r => r.table_name));
    
    // Check if Article table exists in postgres
    const hasArticle = tables.rows.some(r => r.table_name === 'Article');
    if (hasArticle) {
      const res = await client.query("SELECT id, title, \"imageUrl\" FROM \"Article\"");
      console.log("Articles:", res.rows);
    } else {
      console.log("No Article table in postgres database.");
    }
  } catch (err) {
    console.error("Failed:", err.message);
  } finally {
    await client.end().catch(() => {});
  }
}

main();
