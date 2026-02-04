#!/usr/bin/env node

// Script para verificar que las variables de entorno estén configuradas
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const requiredVars = {
  '.env.local': [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NETLIFY_JWT_SECRET',
  ],
  '.env': [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ],
};

let allOk = true;

for (const [file, vars] of Object.entries(requiredVars)) {
  const filePath = path.join(path.dirname(__dirname), file);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ${file} no existe`);
    allOk = false;
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const missing = vars.filter(v => {
    const regex = new RegExp(`^${v}=`, 'm');
    return !regex.test(content) || content.match(new RegExp(`^${v}=$`, 'm'));
  });

  if (missing.length > 0) {
    console.error(`❌ ${file} falta: ${missing.join(', ')}`);
    allOk = false;
  } else {
    console.log(`✅ ${file} configurado correctamente`);
  }
}

if (allOk) {
  console.log('\n✅ Todas las variables de entorno están configuradas');
  process.exit(0);
} else {
  console.log('\n❌ Faltan algunas variables de entorno');
  process.exit(1);
}
