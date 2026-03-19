/**
 * 누락된 마이그레이션을 강제로 실행하는 스크립트
 * TiDB에 0001~0005 마이그레이션이 적용되지 않은 경우 사용
 */
import { readFileSync } from "fs";
import { createConnection } from "mysql2/promise";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "dotenv";

config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL is required");

const url = new URL(dbUrl);

const conn = await createConnection({
  host: url.hostname,
  port: parseInt(url.port),
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: true },
  multipleStatements: true,
});

// 실행할 마이그레이션 파일 목록 (0001~0005)
const migrationFiles = [
  "0001_clean_kang.sql",
  "0002_familiar_charles_xavier.sql",
  "0003_right_fixer.sql",
  "0004_nice_rhodey.sql",
  "0005_tranquil_black_cat.sql",
];

for (const file of migrationFiles) {
  const filePath = join(projectRoot, "drizzle", file);
  const sql = readFileSync(filePath, "utf-8");
  
  // drizzle의 --> statement-breakpoint 구분자로 분리
  const statements = sql
    .split("--> statement-breakpoint")
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  console.log(`\n📄 실행 중: ${file} (${statements.length}개 구문)`);
  
  for (const stmt of statements) {
    try {
      await conn.execute(stmt);
      const tableName = stmt.match(/CREATE TABLE `([^`]+)`/)?.[1] || 
                        stmt.match(/ALTER TABLE `([^`]+)`/)?.[1] || 
                        "unknown";
      console.log(`  ✅ ${tableName}`);
    } catch (err) {
      if (err.code === "ER_TABLE_EXISTS_ERROR" || err.message?.includes("already exists") || err.message?.includes("Duplicate")) {
        console.log(`  ⏭️  이미 존재함 (건너뜀)`);
      } else {
        console.error(`  ❌ 오류: ${err.message}`);
        console.error(`     SQL: ${stmt.substring(0, 100)}...`);
      }
    }
  }
}

// 마이그레이션 기록 업데이트
console.log("\n📝 마이그레이션 기록 업데이트...");
const hashes = [
  { hash: "0001_clean_kang", ts: Date.now() + 1 },
  { hash: "0002_familiar_charles_xavier", ts: Date.now() + 2 },
  { hash: "0003_right_fixer", ts: Date.now() + 3 },
  { hash: "0004_nice_rhodey", ts: Date.now() + 4 },
  { hash: "0005_tranquil_black_cat", ts: Date.now() + 5 },
];

for (const { hash, ts } of hashes) {
  try {
    await conn.execute(
      "INSERT IGNORE INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)",
      [hash, ts]
    );
    console.log(`  ✅ ${hash}`);
  } catch (err) {
    console.log(`  ⏭️  ${hash} (이미 기록됨)`);
  }
}

await conn.end();
console.log("\n✅ 마이그레이션 완료!");
