import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const cie10Codes = [
  { code: 'M17.0', description: 'GONARTROSIS BILATERAL PRIMARIA', category: 'Enfermedades osteoarticulares' },
  { code: 'M17.1', description: 'OTRAS GONARTROSIS PRIMARIAS', category: 'Enfermedades osteoarticulares' },
  { code: 'M17.2', description: 'GONARTROSIS BILATERAL SECUNDARIA', category: 'Enfermedades osteoarticulares' },
  { code: 'M17.3', description: 'OTRAS GONARTROSIS SECUNDARIAS', category: 'Enfermedades osteoarticulares' },
  { code: 'M17.9', description: 'GONARTROSIS NO ESPECIFICADA', category: 'Enfermedades osteoarticulares' },
  { code: 'M16.0', description: 'COXARTROSIS BILATERAL PRIMARIA', category: 'Enfermedades osteoarticulares' },
  { code: 'M16.1', description: 'OTRAS COXARTROSIS PRIMARIAS', category: 'Enfermedades osteoarticulares' },
  { code: 'M16.9', description: 'COXARTROSIS NO ESPECIFICADA', category: 'Enfermedades osteoarticulares' },
  { code: 'M54.4', description: 'LUMBAGO CON CIATICA', category: 'Trastornos de la columna vertebral' },
  { code: 'M54.5', description: 'DOLOR LUMBAR BAJO', category: 'Trastornos de la columna vertebral' },
  { code: 'M54.3', description: 'CIATICA', category: 'Trastornos de la columna vertebral' },
  { code: 'M54.2', description: 'CERVICALGIA', category: 'Trastornos de la columna vertebral' },
  { code: 'M54.1', description: 'RADICULOPATIA CERVICAL', category: 'Trastornos de la columna vertebral' },
  { code: 'M54.0', description: 'RADICULOPATIA LUMBAR', category: 'Trastornos de la columna vertebral' },
  { code: 'M65.2', description: 'TENDINITIS CALCIFICADA', category: 'Trastornos de los tejidos blandos' },
  { code: 'M75.0', description: 'CAPSULITIS ADHESIVA DEL HOMBRO', category: 'Trastornos de los tejidos blandos' },
  { code: 'M75.1', description: 'SINDROME DEL MANGITO DE LOS ROTADORES', category: 'Trastornos de los tejidos blandos' },
  { code: 'M75.2', description: 'TENDINITIS DEL MANGITO DE LOS ROTADORES', category: 'Trastornos de los tejidos blandos' },
  { code: 'M15.0', description: 'ARTROSIS GENERALIZADA PRIMARIA', category: 'Enfermedades osteoarticulares' },
  { code: 'M19.0', description: 'ARTROSIS PRIMARIA DE OTROS ARTICULACIONES', category: 'Enfermedades osteoarticulares' },
  { code: 'M19.9', description: 'ARTROSIS NO ESPECIFICADA', category: 'Enfermedades osteoarticulares' },
  { code: 'M79.1', description: 'MIALGIA', category: 'Trastornos de los tejidos blandos' },
  { code: 'M79.2', description: 'FIBROMIALGIA', category: 'Trastornos de los tejidos blandos' },
  { code: 'M25.5', description: 'DOLOR ARTICULAR', category: 'Enfermedades osteoarticulares' },
  { code: 'M81.0', description: 'OSTEOPOROSIS POLEMENOPAUSICA', category: 'Enfermedades óseas' },
  { code: 'M81.9', description: 'OSTEOPOROSIS NO ESPECIFICADA', category: 'Enfermedades óseas' },
  { code: 'M05.9', description: 'POLIARTRITIS REUMATOIDEA SEROPOSITIVA', category: 'Enfermedades osteoarticulares' },
  { code: 'M06.9', description: 'POLIARTRITIS REUMATOIDEA NO ESPECIFICADA', category: 'Enfermedades osteoarticulares' },
  { code: 'G56.0', description: 'SINDROME DEL TUNEL CARPIANO', category: 'Enfermedades del sistema nervioso' },
  { code: 'G57.0', description: 'LESION DEL NERVIO CIATICO', category: 'Enfermedades del sistema nervioso' },
  { code: 'S83.2', description: 'ROTURA DE MENISCO MEDIAL', category: 'Lesiones externas' },
  { code: 'S93.4', description: 'ESGUINCE DEL TOBILLO', category: 'Lesiones externas' },
];

async function main() {
  console.log('Seeding CIE-10 codes...');
  for (const code of cie10Codes) {
    await prisma.cie10Code.upsert({
      where: { code: code.code },
      update: {},
      create: { code: code.code, description: code.description, category: code.category },
    });
  }
  console.log(`Seeded ${cie10Codes.length} CIE-10 codes`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
