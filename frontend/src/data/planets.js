export const PLANETS = [
  {
    name: 'Mercury',
    nameIndo: 'Merkurius',
    radius: 0.3,
    distance: 8,
    orbitalPeriod: 87.97,
    rotationPeriod: 58.65,
    color: '#8c7e6d',
    texture: 'mercury',
    moons: []
  },
  {
    name: 'Venus',
    nameIndo: 'Venus',
    radius: 0.45,
    distance: 15,
    orbitalPeriod: 224.7,
    rotationPeriod: -243.02,
    color: '#e6c229',
    texture: 'venus',
    moons: []
  },
  {
    name: 'Earth',
    nameIndo: 'Bumi',
    radius: 0.5,
    distance: 22,
    orbitalPeriod: 365.25,
    rotationPeriod: 1,
    color: '#6b93d6',
    texture: 'earth',
    moons: [{ name: 'Moon', radius: 0.14, distance: 0.5 }]
  },
  {
    name: 'Mars',
    nameIndo: 'Mars',
    radius: 0.4,
    distance: 30,
    orbitalPeriod: 687,
    rotationPeriod: 1.03,
    color: '#c1440e',
    texture: 'mars',
    moons: [
      { name: 'Phobos', radius: 0.025, distance: 0.3 },
      { name: 'Deimos', radius: 0.015, distance: 0.5 }
    ]
  },
  {
    name: 'Jupiter',
    nameIndo: 'Jupiter',
    radius: 1.5,
    distance: 45,
    orbitalPeriod: 4333,
    rotationPeriod: 0.41,
    color: '#d8ca9d',
    texture: 'jupiter',
    moons: []
  },
  {
    name: 'Saturn',
    nameIndo: 'Saturnus',
    radius: 1.2,
    distance: 65,
    orbitalPeriod: 10759,
    rotationPeriod: 0.45,
    color: '#ead6b8',
    texture: 'saturn',
    hasRing: true,
    moons: []
  },
  {
    name: 'Uranus',
    nameIndo: 'Uranus',
    radius: 0.8,
    distance: 100,
    orbitalPeriod: 30687,
    rotationPeriod: -0.72,
    color: '#d1e7e7',
    texture: 'uranus',
    moons: []
  },
  {
    name: 'Neptune',
    nameIndo: 'Neptunus',
    radius: 0.75,
    distance: 140,
    orbitalPeriod: 60190,
    rotationPeriod: 0.67,
    color: '#5b5ddf',
    texture: 'neptune',
    moons: []
  }
];

export const SUN_TEXTURE = 'sun';
