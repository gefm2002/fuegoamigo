/**
 * Script completo de migración con conversión y subida de imágenes
 * Ejecutar: npx tsx scripts/migrate-with-images.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import sharp from 'sharp';
import { randomUUID, createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env.local
config({ path: path.join(process.cwd(), '.env.local') });

// Función para generar UUID determinístico desde un string
function uuidFromString(str: string): string {
  const hash = createHash('sha256').update(str).digest('hex');
  // Formatear como UUID v4
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-4${hash.substring(13, 16)}-${(parseInt(hash.substring(16, 17), 16) & 0x3 | 0x8).toString(16)}${hash.substring(17, 20)}-${hash.substring(20, 32)}`;
}

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('Asegúrate de tener .env.local configurado');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Cache de imágenes ya subidas
const imageCache = new Map<string, string>();

async function convertAndUploadImage(
  imagePath: string,
  entityId: string,
  entityType: 'product' | 'event'
): Promise<string | null> {
  // Si es una URL externa o ya está en cache, retornar
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return imagePath;
  }

  if (imageCache.has(imagePath)) {
    return imageCache.get(imagePath)!;
  }

  try {
    // Resolver path relativo
    let fullPath: string;
    if (imagePath.startsWith('/images/')) {
      fullPath = path.join(process.cwd(), 'public', imagePath);
    } else {
      fullPath = path.join(process.cwd(), imagePath);
    }

    if (!fs.existsSync(fullPath)) {
      console.warn(`Image not found: ${fullPath}, keeping original path`);
      return imagePath;
    }

    // Leer imagen
    const imageBuffer = fs.readFileSync(fullPath);
    
    // Convertir a WebP con sharp
    const webpBuffer = await sharp(imageBuffer)
      .resize(1600, 1600, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    // Generar path único
    const uuid = randomUUID();
    const storagePath = `fuegoamigo/${entityType}/${entityId}/${uuid}.webp`;

    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from('fuegoamigo_assets')
      .upload(storagePath, webpBuffer, {
        contentType: 'image/webp',
        upsert: false,
      });

    if (error) {
      console.error(`Error uploading image ${imagePath}:`, error);
      return imagePath; // Fallback a path original
    }

    // Guardar en cache
    imageCache.set(imagePath, storagePath);
    console.log(`✅ Uploaded: ${imagePath} → ${storagePath}`);

    return storagePath;
  } catch (error: any) {
    console.error(`Error processing image ${imagePath}:`, error.message);
    return imagePath; // Fallback a path original
  }
}

async function migrateProducts() {
  console.log('\n📦 Migrando productos...');
  const productsPath = path.join(process.cwd(), 'src/data/products.json');
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

  // Obtener categorías para mapear
  const { data: categories } = await supabase.from('fuegoamigo_categories').select('id, slug');

  const categoryMap = new Map(categories?.map((c) => [c.slug, c.id]) || []);

  for (const product of products) {
    const categoryId = categoryMap.get(product.category);

    // Convertir ID a UUID si no lo es
    const productId = product.id.includes('-') && product.id.length === 36 
      ? product.id 
      : uuidFromString(`product-${product.id}`);

    // Convertir y subir imagen
    let images: string[] = [];
    if (product.image) {
      const uploadedPath = await convertAndUploadImage(product.image, productId, 'product');
      if (uploadedPath) {
        images = [uploadedPath];
      }
    }

    const { error } = await supabase.from('fuegoamigo_products').upsert({
      id: productId,
      slug: product.slug,
      name: product.name,
      description: product.description,
      price: product.price,
      category_id: categoryId,
      images,
      tags: product.tags || [],
      stock: product.stock || 0,
      is_active: product.isActive !== false,
      featured: product.featured || false,
      product_type: 'standard',
    });

    if (error) {
      console.error(`❌ Error migrating product ${product.id}:`, error.message);
    } else {
      console.log(`✅ Migrated product: ${product.name}`);
    }
  }
}

async function migrateEvents() {
  console.log('\n🎉 Migrando eventos...');
  const eventsPath = path.join(process.cwd(), 'src/data/events.json');
  const events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));

  for (const event of events) {
    // Convertir ID a UUID si no lo es
    const eventId = event.id.includes('-') && event.id.length === 36 
      ? event.id 
      : uuidFromString(`event-${event.id}`);

    // Convertir y subir imágenes
    const images: string[] = [];
    if (event.images && Array.isArray(event.images)) {
      for (const imgPath of event.images.slice(0, 5)) {
        // Limitar a 5 imágenes máximo
        const uploadedPath = await convertAndUploadImage(imgPath, eventId, 'event');
        if (uploadedPath) {
          images.push(uploadedPath);
        }
      }
    }

    const { error } = await supabase.from('fuegoamigo_events').upsert({
      id: eventId,
      title: event.title,
      event_type: event.eventType,
      location: event.location || '',
      guests_range: event.guestsRange || '',
      highlight_menu: event.highlightMenu || '',
      description: event.description || '',
      images,
      is_active: event.isActive !== false,
    });

    if (error) {
      console.error(`❌ Error migrating event ${event.id}:`, error.message);
    } else {
      console.log(`✅ Migrated event: ${event.title}`);
    }
  }
}

async function migratePromos() {
  console.log('\n💰 Migrando promociones...');
  const promosPath = path.join(process.cwd(), 'src/data/promos.json');
  const promos = JSON.parse(fs.readFileSync(promosPath, 'utf-8'));

  for (const promo of promos) {
    // Convertir ID a UUID si no lo es
    const promoId = promo.id.includes('-') && promo.id.length === 36 
      ? promo.id 
      : uuidFromString(`promo-${promo.id}`);

    const { error } = await supabase.from('fuegoamigo_promos').upsert({
      id: promoId,
      banco: promo.banco,
      dia: promo.dia,
      tope_reintegro: promo.topeReintegro || 0,
      porcentaje: promo.porcentaje || 0,
      medios: promo.medios || [],
      vigencia: promo.vigencia || '',
      is_active: true,
    });

    if (error) {
      console.error(`❌ Error migrating promo ${promo.id}:`, error.message);
    } else {
      console.log(`✅ Migrated promo: ${promo.banco}`);
    }
  }
}

async function migrateFAQs() {
  console.log('\n❓ Migrando FAQs...');
  const faqsPath = path.join(process.cwd(), 'src/data/faqs.json');
  const faqs = JSON.parse(fs.readFileSync(faqsPath, 'utf-8'));

  for (let i = 0; i < faqs.length; i++) {
    const faq = faqs[i];
    // Convertir ID a UUID si no lo es
    const faqId = faq.id.includes('-') && faq.id.length === 36 
      ? faq.id 
      : uuidFromString(`faq-${faq.id}`);

    const { error } = await supabase.from('fuegoamigo_faqs').upsert({
      id: faqId,
      question: faq.question,
      answer: faq.answer,
      order: i,
      is_active: true,
    });

    if (error) {
      console.error(`❌ Error migrating FAQ ${faq.id}:`, error.message);
    } else {
      console.log(`✅ Migrated FAQ: ${faq.question.substring(0, 50)}...`);
    }
  }
}

async function createAdminUser() {
  console.log('\n👤 Creando usuario admin...');
  const email = process.env.ADMIN_EMAIL || 'admin@fuegoamigo.com';
  const password = process.env.ADMIN_PASSWORD || 'fuegoamigo2024';

  const passwordHash = await bcrypt.hash(password, 10);

  const { error } = await supabase.from('fuegoamigo_admin_users').upsert({
    email,
    password_hash: passwordHash,
    is_active: true,
    role: 'admin',
  }, {
    onConflict: 'email',
  });

  if (error) {
    console.error('❌ Error creating admin user:', error.message);
  } else {
    console.log(`✅ Admin user created: ${email}`);
    console.log(`   Password: ${password}`);
  }
}

async function main() {
  console.log('🚀 Iniciando migración completa...');
  console.log(`📡 Conectado a: ${supabaseUrl}`);
  console.log('');

  try {
    await migrateProducts();
    await migrateEvents();
    await migratePromos();
    await migrateFAQs();
    await createAdminUser();

    console.log('\n✅ Migración completada exitosamente!');
    console.log(`📸 Total de imágenes procesadas: ${imageCache.size}`);
  } catch (error: any) {
    console.error('\n❌ Error durante la migración:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
