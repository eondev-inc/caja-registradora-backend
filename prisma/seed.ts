import { PrismaClient } from '@prisma/client';
import e from 'express';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const seedDirectory = path.join(__dirname, 'seeders');

async function main() {
  const seedFiles = fs.readdirSync(seedDirectory);

  for (const file of seedFiles) {
    const filePath = path.join(seedDirectory, file);
    const tableName = path.basename(file, path.extname(file));
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    console.log(`Seeding table: ${tableName}`);

    for (const entry of data) {
      const record = await prisma[tableName].findMany({
        where: entry,
      });

      if (record?.length === 0) {
        await prisma[tableName].create({
          data: entry,
        });
      } else {
        console.log(`Record already exists: ${JSON.stringify(entry)}`);
      }

    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
