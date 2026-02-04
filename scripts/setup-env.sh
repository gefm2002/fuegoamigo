#!/bin/bash

# Script para configurar variables de entorno
# Ejecutar: bash scripts/setup-env.sh

cat > .env.local << 'EOF'
# Supabase - Proyecto: juancito-mercado-boutique
SUPABASE_URL=https://oseeysmiwfdhpizzeota.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZWV5c21pd2ZkaHBpenplb3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNTU3MTAsImV4cCI6MjA4NTczMTcxMH0.nN9kPdZf_eDdcSwAbUrYloKvJY3yJF-qaqDXNngIGJY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZWV5c21pd2ZkaHBpenplb3RhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE1NTcxMCwiZXhwIjoyMDg1NzMxNzEwfQ.VQE-HnKjkI5iF0XzkthUrA69EWcpxhwXG8dfIA_Btno

# Supabase Project
SUPABASE_ACCESS_TOKEN=sbp_5413937740855e338b963b11a2fc451575e09fb3
SUPABASE_ORG_SLUG=gopntmzxqonsqbsykbup
SUPABASE_PROJECT_NAME=juancito-mercado-boutique
SUPABASE_REGION=us-east-1

# Netlify Functions
NETLIFY_JWT_SECRET=

# Admin inicial
ADMIN_EMAIL=admin@fuegoamigo.com
ADMIN_PASSWORD=

# WhatsApp
WHATSAPP_NUMBER=+5491141464526
EOF

cat > .env << 'EOF'
# Variables para el frontend (Vite)
VITE_SUPABASE_URL=https://oseeysmiwfdhpizzeota.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZWV5c21pd2ZkaHBpenplb3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNTU3MTAsImV4cCI6MjA4NTczMTcxMH0.nN9kPdZf_eDdcSwAbUrYloKvJY3yJF-qaqDXNngIGJY
EOF

echo "✅ Archivos .env.local y .env creados exitosamente"
echo ""
echo "⚠️  IMPORTANTE: Configura las siguientes variables manualmente:"
echo "   - NETLIFY_JWT_SECRET (generar con: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\")"
echo "   - ADMIN_PASSWORD (si quieres cambiar el default)"
