const { Client } = require('pg');

async function main() {
  const url = "postgresql://postgres:Ayou123beMr@localhost:5432/recipes_db";
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    console.log("Connected using password Ayou123beMr.");
    const articles = await client.query("SELECT id, title, \"imageUrl\" FROM \"Article\"");
    console.log("Articles:", articles.rows);
  } catch (err) {
    console.error("Failed:", err.message);
  } finally {
    await client.end().catch(() => {});
  }
}

main();
