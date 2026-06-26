const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const planets = [
  {
    name: 'Mercury', nameIndo: 'Merkurius', radius: 2439.7, distanceFromSun: 57.9,
    orbitalPeriod: 87.97, rotationPeriod: 58.65, mass: 3.301e23, gravity: 3.7,
    temperature: 167, moons: 0, atmosphere: 'Oxygen, Sodium, Hydrogen, Helium',
    facts: JSON.stringify(['Planet terkecil di tata surya', 'Tidak memiliki atmosfer yang signifikan', 'Permukaan penuh kawah seperti Bulan']),
    texture: '/textures/mercury.jpg', color: '#8c7e6d', order: 1
  },
  {
    name: 'Venus', nameIndo: 'Venus', radius: 6051.8, distanceFromSun: 108.2,
    orbitalPeriod: 224.7, rotationPeriod: -243.02, mass: 4.867e24, gravity: 8.87,
    temperature: 464, moons: 0, atmosphere: 'Carbon Dioxide, Nitrogen',
    facts: JSON.stringify(['Planet terpanas di tata surya', 'Berputar berlawanan arah dengan planet lain', 'Sering disebut Bintang Kejora']),
    texture: '/textures/venus.jpg', color: '#e6c229', order: 2
  },
  {
    name: 'Earth', nameIndo: 'Bumi', radius: 6371, distanceFromSun: 149.6,
    orbitalPeriod: 365.25, rotationPeriod: 1, mass: 5.972e24, gravity: 9.81,
    temperature: 15, moons: 1, atmosphere: 'Nitrogen, Oxygen, Argon',
    facts: JSON.stringify(['Satu-satunya planet yang diketahui memiliki kehidupan', '70% permukaan tertutup air', 'Memiliki medan magnet yang kuat']),
    texture: '/textures/earth.jpg', color: '#6b93d6', order: 3
  },
  {
    name: 'Mars', nameIndo: 'Mars', radius: 3389.5, distanceFromSun: 227.9,
    orbitalPeriod: 687, rotationPeriod: 1.03, mass: 6.417e23, gravity: 3.721,
    temperature: -63, moons: 2, atmosphere: 'Carbon Dioxide, Nitrogen, Argon',
    facts: JSON.stringify(['Disebut Planet Merah karena permukaannya', 'Memiliki gunung tertinggi di tata surya (Olympus Mons)', 'Memiliki dua bulan kecil: Phobos dan Deimos']),
    texture: '/textures/mars.jpg', color: '#c1440e', order: 4
  },
  {
    name: 'Jupiter', nameIndo: 'Jupiter', radius: 69911, distanceFromSun: 778.5,
    orbitalPeriod: 4333, rotationPeriod: 0.41, mass: 1.898e27, gravity: 24.79,
    temperature: -110, moons: 95, atmosphere: 'Hydrogen, Helium',
    facts: JSON.stringify(['Planet terbesar di tata surya', 'Memiliki Bintang Merah Besar (Great Red Spot)', 'Memiliki medan magnet terkuat']),
    texture: '/textures/jupiter.jpg', color: '#d8ca9d', order: 5
  },
  {
    name: 'Saturn', nameIndo: 'Saturnus', radius: 58232, distanceFromSun: 1434,
    orbitalPeriod: 10759, rotationPeriod: 0.45, mass: 5.683e26, gravity: 10.44,
    temperature: -140, moons: 146, atmosphere: 'Hydrogen, Helium',
    facts: JSON.stringify(['Terkenal karena cincinnya yang indah', 'Cincin terbuat dari es dan batu', 'Density-nya lebih rendah dari air']),
    texture: '/textures/saturn.jpg', color: '#ead6b8', order: 6
  },
  {
    name: 'Uranus', nameIndo: 'Uranus', radius: 25362, distanceFromSun: 2871,
    orbitalPeriod: 30687, rotationPeriod: -0.72, mass: 8.681e25, gravity: 8.87,
    temperature: -195, moons: 28, atmosphere: 'Hydrogen, Helium, Methane',
    facts: JSON.stringify(['Berputar miring (axis tilt 98 derajat)', 'Warna biru kehijauan karena metan', 'Planet pertama yang ditemukan dengan teleskop']),
    texture: '/textures/uranus.jpg', color: '#d1e7e7', order: 7
  },
  {
    name: 'Neptune', nameIndo: 'Neptunus', radius: 24622, distanceFromSun: 4495,
    orbitalPeriod: 60190, rotationPeriod: 0.67, mass: 1.024e26, gravity: 11.15,
    temperature: -200, moons: 16, atmosphere: 'Hydrogen, Helium, Methane',
    facts: JSON.stringify(['Planet paling jauh dari matahari', 'Memiliki angin terkencang di tata surya', 'Ditemukan melalui perhitungan matematika']),
    texture: '/textures/neptune.jpg', color: '#5b5ddf', order: 8
  }
];

const questions = [
  { question: 'Planet mana yang paling dekat dengan Matahari?', options: JSON.stringify(['Venus', 'Merkurius', 'Mars', 'Bumi']), correctIndex: 1, explanation: 'Merkurius adalah planet terdekat dengan Matahari, dengan jarak rata-rata 57.9 juta km.', type: 'MULTIPLE', difficulty: 'EASY', planetId: 1 },
  { question: 'Planet mana yang memiliki cincin paling terkenal?', options: JSON.stringify(['Jupiter', 'Uranus', 'Saturnus', 'Neptunus']), correctIndex: 2, explanation: 'Saturnus terkenal karena cincinnya yang indah, terbuat dari partikel es dan batu.', type: 'MULTIPLE', difficulty: 'EASY', planetId: 6 },
  { question: 'Bumi memiliki berapa jumlah bulan?', options: JSON.stringify(['0', '1', '2', '3']), correctIndex: 1, explanation: 'Bumi memiliki 1 bulan alami, yaitu Bulan (Luna).', type: 'MULTIPLE', difficulty: 'EASY', planetId: 3 },
  { question: 'Planet mana yang disebut Planet Merah?', options: JSON.stringify(['Venus', 'Jupiter', 'Mars', 'Merkurius']), correctIndex: 2, explanation: 'Mars disebut Planet Merah karena permukaannya yang kaya akan besi oksida.', type: 'MULTIPLE', difficulty: 'EASY', planetId: 4 },
  { question: 'Planet terbesar di tata surya adalah Jupiter.', options: JSON.stringify(['Benar', 'Salah']), correctIndex: 0, explanation: 'Jupiter adalah planet terbesar di tata surya dengan diameter sekitar 142.984 km.', type: 'BOOLEAN', difficulty: 'EASY', planetId: 5 },
  { question: 'Berapa lama Bumi mengelilingi Matahari?', options: JSON.stringify(['365 hari', '30 hari', '100 hari', '1000 hari']), correctIndex: 0, explanation: 'Bumi membutuhkan waktu sekitar 365.25 hari untuk mengelilingi Matahari.', type: 'MULTIPLE', difficulty: 'MEDIUM', planetId: 3 },
  { question: 'Planet mana yang berputar berlawanan arah dengan planet lain?', options: JSON.stringify(['Merkurius', 'Venus', 'Mars', 'Neptunus']), correctIndex: 1, explanation: 'Venus berputar berlawanan arah (retrograde) karena sumbu yang miring.', type: 'MULTIPLE', difficulty: 'MEDIUM', planetId: 2 },
  { question: 'Jupiter memiliki lebih dari 70 bulan.', options: JSON.stringify(['Benar', 'Salah']), correctIndex: 0, explanation: 'Jupiter memiliki 95 bulan yang diketahui, termasuk 4 bulan Galileo.', type: 'BOOLEAN', difficulty: 'MEDIUM', planetId: 5 },
  { question: 'Planet mana yang memiliki suhu paling panas?', options: JSON.stringify(['Merkurius', 'Venus', 'Jupiter', 'Mars']), correctIndex: 1, explanation: 'Venus adalah planet terpanas (464 derajat) karena efek rumah kaca yang ekstrem.', type: 'MULTIPLE', difficulty: 'MEDIUM' },
  { question: 'Gunung tertinggi di tata surya ada di Mars.', options: JSON.stringify(['Benar', 'Salah']), correctIndex: 0, explanation: 'Olympus Mons di Mars memiliki tinggi sekitar 21.9 km, tertinggi di tata surya.', type: 'BOOLEAN', difficulty: 'MEDIUM', planetId: 4 },
  { question: 'Berapa persentase permukaan Bumi yang tertutup air?', options: JSON.stringify(['50%', '60%', '70%', '80%']), correctIndex: 2, explanation: 'Sekitar 70% permukaan Bumi tertutup oleh air.', type: 'MULTIPLE', difficulty: 'HARD', planetId: 3 },
  { question: 'Planet mana yang ditemukan melalui perhitungan matematika?', options: JSON.stringify(['Uranus', 'Neptunus', 'Pluto', 'Ceres']), correctIndex: 1, explanation: 'Neptunus ditemukan tahun 1846 melalui perhitungan gaya gravitasi.', type: 'MULTIPLE', difficulty: 'HARD', planetId: 8 },
  { question: 'Saturnus memiliki density lebih rendah dari air.', options: JSON.stringify(['Benar', 'Salah']), correctIndex: 0, explanation: 'Density Saturnus sekitar 0.687 g/cm3, lebih rendah dari air (1 g/cm3).', type: 'BOOLEAN', difficulty: 'HARD', planetId: 6 },
  { question: 'Berapa jumlah bulan Saturnus yang diketahui?', options: JSON.stringify(['28', '82', '146', '200']), correctIndex: 2, explanation: 'Saturnus memiliki 146 bulan yang diketahui hingga tahun 2023.', type: 'MULTIPLE', difficulty: 'HARD', planetId: 6 },
  { question: 'Uranus berputar miring dengan sumbu 98 derajat.', options: JSON.stringify(['Benar', 'Salah']), correctIndex: 0, explanation: 'Uranus memiliki axis tilt sekitar 98 derajat, hampir berbaring.', type: 'BOOLEAN', difficulty: 'HARD', planetId: 7 }
];

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@solarsystem.com' },
    update: {},
    create: {
      email: 'admin@solarsystem.com',
      password: adminPassword,
      name: 'Admin',
      role: 'ADMIN'
    }
  });

  for (const planet of planets) {
    await prisma.planet.upsert({
      where: { name: planet.name },
      update: planet,
      create: planet
    });
  }
  console.log('Planets seeded!');

  for (const question of questions) {
    await prisma.question.create({ data: question });
  }
  console.log('Questions seeded!');

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
