/**
 * Script para migrar datos desde JSON a Supabase
 * Ejecutar: npx tsx scripts/migrate-from-json.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function migrateProducts() {
  const productsPath = path.join(process.cwd(), 'src/data/products.json');
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

  // Obtener categorías para mapear
  const { data: categories } = await supabase.from('fuegoamigo_categories').select('id, slug');

  const categoryMap = new Map(categories?.map((c) => [c.slug, c.id]) || []);

  for (const product of products) {
    const categoryId = categoryMap.get(product.category);

    const { error } = await supabase.from('fuegoamigo_products').upsert({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      price: product.price,
      category_id: categoryId,
      images: product.image ? [product.image] : [],
      tags: product.tags || [],
      stock: product.stock || 0,
      is_active: product.isActive !== false,
      featured: product.featured || false,
      product_type: 'standard',
    });

    if (error) {
      console.error(`Error migrating product ${product.id}:`, error);
    } else {
      console.log(`Migrated product: ${product.name}`);
    }
  }
}

async function migrateEvents() {
  const eventsPath = path.join(process.cwd(), 'src/data/events.json');
  const events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));

  for (const event of events) {
    const { error } = await supabase.from('fuegoamigo_events').upsert({
      id: event.id,
      title: event.title,
      event_type: event.eventType,
      location: event.location || '',
      guests_range: event.guestsRange || '',
      highlight_menu: event.highlightMenu || '',
      description: event.description || '',
      images: event.images || [],
      is_active: event.isActive !== false,
    });

    if (error) {
      console.error(`Error migrating event ${event.id}:`, error);
    } else {
      console.log(`Migrated event: ${event.title}`);
    }
  }
}

async function migratePromos() {
  const promosPath = path.join(process.cwd(), 'src/data/promos.json');
  const promos = JSON.parse(fs.readFileSync(promosPath, 'utf-8'));

  for (const promo of promos) {
    const { error } = await supabase.from('fuegoamigo_promos').upsert({
      id: promo.id,
      banco: promo.banco,
      dia: promo.dia,
      tope_reintegro: promo.topeReintegro || 0,
      porcentaje: promo.porcentaje || 0,
      medios: promo.medios || [],
      vigencia: promo.vigencia || '',
      is_active: true,
    });

    if (error) {
      console.error(`Error migrating promo ${promo.id}:`, error);
    } else {
      console.log(`Migrated promo: ${promo.banco}`);
    }
  }
}

async function migrateFAQs() {
  const faqsPath = path.join(process.cwd(), 'src/data/faqs.json');
  const faqs = JSON.parse(fs.readFileSync(faqsPath, 'utf-8'));

  for (let i = 0; i < faqs.length; i++) {
    const faq = faqs[i];
    const { error } = await supabase.from('fuegoamigo_faqs').upsert({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      order: i,
      is_active: true,
    });

    if (error) {
      console.error(`Error migrating FAQ ${faq.id}:`, error);
    } else {
      console.log(`Migrated FAQ: ${faq.question.substring(0, 50)}...`);
    }
  }
}

async function createAdminUser() {
  const email = process.env.ADMIN_EMAIL || 'admin@fuegoamigo.com';
  const password = process.env.ADMIN_PASSWORD || 'fuegoamigo2024';

  const passwordHash = await bcrypt.hash(password, 10);

  const { error } = await supabase.from('fuegoamigo_admin_users').upsert({
    email,
    password_hash: passwordHash,
    is_active: true,
    role: 'admin',
  });

  if (error) {
    console.error('Error creating admin user:', error);
  } else {
    console.log(`Admin user created: ${email}`);
  }
}

async function main() {
  console.log('Starting migration...');

  await migrateProducts();
  await migrateEvents();
  await migratePromos();
  await migrateFAQs();
  await createAdminUser();

  console.log('Migration completed!');
}

main().catch(console.error);
