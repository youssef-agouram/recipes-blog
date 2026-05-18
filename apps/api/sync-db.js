const { Client } = require('pg');

async function main() {
  const localUrl = "postgresql://postgres:postgres@localhost:5432/recipes_db";
  const remoteUrl = "postgresql://postgres.vzngrcrdyzsahnuofvmw:Ayou123beMr@aws-1-eu-west-2.pooler.supabase.com:6543/postgres";

  console.log("Initializing database sync...");
  console.log(`Source (Local): ${localUrl}`);
  console.log(`Target (Supabase): ${remoteUrl}`);

  const localClient = new Client({ connectionString: localUrl });
  const remoteClient = new Client({ connectionString: remoteUrl });

  try {
    await localClient.connect();
    console.log("Connected to local database.");
    await remoteClient.connect();
    console.log("Connected to Supabase database.");

    // 1. Get list of all public tables
    const tablesRes = await localClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public' AND table_type='BASE TABLE' AND table_name NOT LIKE '_prisma_migrations'
    `);
    
    const tables = tablesRes.rows.map(r => r.table_name);
    console.log(`Found ${tables.length} tables to sync:`, tables);

    // 2. Disable triggers and constraints on remote to prevent foreign key errors during sync
    console.log("Disabling constraints on Supabase...");
    await remoteClient.query("SET session_replication_role = 'replica';");

    // 3. Sync table contents
    for (const table of tables) {
      console.log(`\nSyncing table: "${table}"...`);

      // Clear table on remote
      await remoteClient.query(`TRUNCATE TABLE "${table}" CASCADE;`);

      // Read rows from local
      const rowsRes = await localClient.query(`SELECT * FROM "${table}"`);
      const rows = rowsRes.rows;
      console.log(`- Read ${rows.length} rows from local.`);

      if (rows.length === 0) {
        console.log("- No rows to copy.");
        continue;
      }

      // Get columns
      const columns = Object.keys(rows[0]);
      const columnNames = columns.map(c => `"${c}"`).join(', ');

      // Insert rows into remote
      console.log(`- Inserting ${rows.length} rows into remote...`);
      for (const row of rows) {
        const values = columns.map(c => {
          let val = row[c];
          // If the value is a JavaScript object/array
          if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
            // Keep native array for string[] columns (images)
            if (Array.isArray(val) && c === 'images') {
              // Do nothing, pass native array
            } else {
              // Stringify for JSON/JSONB columns
              val = JSON.stringify(val);
            }
          }
          return val;
        });
        
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        
        await remoteClient.query({
          text: `INSERT INTO "${table}" (${columnNames}) VALUES (${placeholders})`,
          values: values
        });
      }
      console.log(`- Successfully synced table "${table}"!`);
    }

    // 4. Re-enable triggers and constraints on remote
    console.log("\nRe-enabling constraints on Supabase...");
    await remoteClient.query("SET session_replication_role = 'origin';");

    console.log("\n🎉 DATABASE SYNC COMPLETED SUCCESSFULLY! 🎉");
    console.log("All your local recipes, articles, and settings have been migrated to Supabase!");

  } catch (err) {
    console.error("❌ Sync failed with error:", err.message);
    try {
      await remoteClient.query("SET session_replication_role = 'origin';");
    } catch (_) {}
  } finally {
    await localClient.end().catch(() => {});
    await remoteClient.end().catch(() => {});
  }
}

main();
