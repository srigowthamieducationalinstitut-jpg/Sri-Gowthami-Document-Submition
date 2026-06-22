import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Resolve directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env configuration
dotenv.config({ path: path.resolve(__dirname, './.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '3306', 10)
};

async function setup() {
  console.log('[Setup] Starting MySQL database initialization...');
  let connection;

  try {
    // 1. Connect to MySQL server without database selected
    connection = await mysql.createConnection(dbConfig);
    console.log(`[Setup] Connected to MySQL server at ${dbConfig.host}:${dbConfig.port}`);

    // 2. Read schema.sql file content
    const schemaPath = path.resolve(__dirname, './schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`schema.sql file not found at ${schemaPath}`);
    }
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // 3. Split the schema SQL by semicolons to execute statements individually
    // Filter out empty lines/commands
    const statements = schemaSql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    console.log(`[Setup] Executing ${statements.length} DDL statements from schema.sql...`);
    for (const statement of statements) {
      await connection.query(statement);
    }
    console.log('[Setup] Relational database schemas initialized successfully.');

    // 4. Connect specifically to the created database to seed sample data
    await connection.changeUser({ database: process.env.DB_NAME || 'sri_gowthami_tracker' });

    // 5. Check if data already exists
    const [existingApps] = await connection.query('SELECT COUNT(*) AS count FROM applications');
    if (existingApps[0].count > 0) {
      console.log('[Setup] Database already contains data. Skipping seeding phase.');
      return;
    }

    console.log('[Setup] Database is empty. Seeding realistic sample student applications and documents...');

    // --- SEEDING APPLICATION 1: Ananya Patel (Verified / All documents Submitted) ---
    const [app1Result] = await connection.query(`
      INSERT INTO applications (student_name, student_email, phone, course_applied, admission_status, created_at)
      VALUES ('Ananya Patel', 'ananya.p@example.com', '+91 9876543213', 'B.Tech CSE', 'Verified', '2026-05-28T08:00:00Z')
    `);
    const app1Id = app1Result.insertId;

    await connection.query(`
      INSERT INTO documents (application_id, document_type, status)
      VALUES 
        (${app1Id}, 'Marks Memo', 'Submitted'),
        (${app1Id}, 'Aadhaar', 'Submitted'),
        (${app1Id}, 'Transfer Certificate', 'Submitted'),
        (${app1Id}, 'Photos', 'Submitted'),
        (${app1Id}, 'Caste Certificate', 'Submitted')
    `);

    await connection.query(`
      INSERT INTO comments_history (application_id, staff_role, comment_text, created_at)
      VALUES 
        (${app1Id}, 'System', 'Application created. Checklist initialized.', '2026-05-28T08:00:00Z'),
        (${app1Id}, 'Admission Counsellor', 'Verified student credentials and basic academic info.', '2026-06-01T10:00:00Z'),
        (${app1Id}, 'Verification Officer', 'All documents submitted and verified. Flipped admission status to Verified.', '2026-06-10T11:00:00Z')
    `);

    // --- SEEDING APPLICATION 2: Kiran Desai (Pending / Partial documents Submitted) ---
    const [app2Result] = await connection.query(`
      INSERT INTO applications (student_name, student_email, phone, course_applied, admission_status, created_at)
      VALUES ('Kiran Desai', 'kiran.d@example.com', '+91 9876543220', 'B.Tech ECE', 'Pending', '2026-06-05T10:00:00Z')
    `);
    const app2Id = app2Result.insertId;

    await connection.query(`
      INSERT INTO documents (application_id, document_type, status)
      VALUES 
        (${app2Id}, 'Marks Memo', 'Submitted'),
        (${app2Id}, 'Aadhaar', 'Submitted'),
        (${app2Id}, 'Transfer Certificate', 'Pending'),
        (${app2Id}, 'Photos', 'Submitted'),
        (${app2Id}, 'Caste Certificate', 'Pending')
    `);

    await connection.query(`
      INSERT INTO comments_history (application_id, staff_role, comment_text, created_at)
      VALUES 
        (${app2Id}, 'System', 'Application created. Checklist initialized.', '2026-06-05T10:00:00Z'),
        (${app2Id}, 'Verification Officer', 'Marks Memo, Aadhaar, and Photos have been uploaded. Waiting for Transfer Certificate and Caste Certificate.', '2026-06-12T15:00:00Z')
    `);

    // --- SEEDING APPLICATION 3: Rohit Nair (Rejected / Some documents Rejected) ---
    const [app3Result] = await connection.query(`
      INSERT INTO applications (student_name, student_email, phone, course_applied, admission_status, created_at)
      VALUES ('Rohit Nair', 'rohit.n@example.com', '+91 9876543230', 'MBA', 'Rejected', '2026-06-08T09:00:00Z')
    `);
    const app3Id = app3Result.insertId;

    await connection.query(`
      INSERT INTO documents (application_id, document_type, status)
      VALUES 
        (${app3Id}, 'Marks Memo', 'Submitted'),
        (${app3Id}, 'Aadhaar', 'Rejected'),
        (${app3Id}, 'Transfer Certificate', 'Submitted'),
        (${app3Id}, 'Photos', 'Submitted'),
        (${app3Id}, 'Caste Certificate', 'Pending')
    `);

    await connection.query(`
      INSERT INTO comments_history (application_id, staff_role, comment_text, created_at)
      VALUES 
        (${app3Id}, 'System', 'Application created. Checklist initialized.', '2026-06-08T09:00:00Z'),
        (${app3Id}, 'Verification Officer', 'Aadhaar scanned copy is blurred. Please resubmit. Setting application status to Rejected.', '2026-06-14T15:30:00Z')
    `);

    console.log('[Setup] Database seeding phase completed successfully.');
    console.log('[Setup] Seeded 3 applications, 15 document records, and 7 comments history logs.');
  } catch (error) {
    console.error('[Setup] Error occurred during database setup & seeding:');
    console.error(error.message);
    console.error('Verify that your MySQL server is running and configured correctly in server/.env.');
  } finally {
    if (connection) {
      await connection.end();
      console.log('[Setup] Database connection closed.');
    }
  }
}

setup();
