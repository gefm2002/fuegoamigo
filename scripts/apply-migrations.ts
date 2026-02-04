/**
 * Script para aplicar migrations desde archivos SQL
 * Ejecutar: npx tsx scripts/apply-migrations.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function applyMigration(fileName: string) {
  const filePath = path.join(process.cwd(), 'supabase', 'migrations', fileName);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Migration file not found: ${filePath}`);
    return false;
  }

  const sql = fs.readFileSync(filePath, 'utf-8');
  
  // Dividir por statements (separados por ;)
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`\n📄 Aplicando ${fileName}...`);
  console.log(`   ${statements.length} statements encontrados`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    // Skip comentarios y líneas vacías
    if (statement.startsWith('--') || statement.length === 0) {
      continue;
    }

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
      
      // Si RPC no funciona, intentar con query directa (solo para SELECT)
      if (error && error.message.includes('function') && statement.trim().toUpperCase().startsWith('SELECT')) {
        // Para SELECT statements, usar query normal
        continue; // Skip SELECT statements en migrations
      } else if (error && !error.message.includes('already exists') && !error.message.includes('duplicate')) {
        console.error(`❌ Error en statement ${i + 1}:`, error.message);
        console.error(`   SQL: ${statement.substring(0, 100)}...`);
        return false;
      }
    } catch (err: any) {
      // Algunos errores son esperados (como "already exists")
      if (!err.message?.includes('already exists') && !err.message?.includes('duplicate')) {
        console.warn(`⚠️  Warning en statement ${i + 1}:`, err.message);
      }
    }
  }

  console.log(`✅ ${fileName} aplicado correctamente`);
  return true;
}

async function main() {
  console.log('🚀 Aplicando migrations...');
  console.log(`📡 Conectado a: ${supabaseUrl}`);
  console.log('\n⚠️  NOTA: Este script intenta aplicar las migrations.');
  console.log('   Si hay errores, es mejor aplicar manualmente desde SQL Editor.');
  console.log('');

  const migrations = ['001_init.sql', '002_storage.sql', '003_add_product_fields.sql', '004_fix_orders_rls.sql'];

  for (const migration of migrations) {
    const success = await applyMigration(migration);
    if (!success) {
      console.error(`\n❌ Falló la aplicación de ${migration}`);
      console.error('   Por favor, aplica manualmente desde Supabase SQL Editor');
      process.exit(1);
    }
  }

  console.log('\n✅ Todas las migrations aplicadas!');
  console.log('\n📝 Siguiente paso: Ejecutar npm run migrate');
}

main().catch(console.error);
