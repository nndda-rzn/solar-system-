import api from './api';

const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';

export const nasaService = {
  // Get Astronomy Picture of the Day
  getApod: async () => {
    const response = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`
    );
    return response.json();
  },

  // Search NASA images
  searchImages: async (query, page = 1) => {
    const response = await fetch(
      `https://images-api.nasa.gov/search?q=${query}&media_type=image&page=${page}`
    );
    return response.json();
  },

  // Get planet image from NASA
  getPlanetImage: async (planetName) => {
    const data = await nasaService.searchImages(planetName);
    if (data.collection?.items?.length > 0) {
      return data.collection.items[0].links[0].href;
    }
    return null;
  },

  // Get Mars Rover photos
  getMarsRoverPhotos: async (sol = 1000) => {
    const response = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=${sol}&api_key=${NASA_API_KEY}`
    );
    return response.json();
  },

  // Planet texture URLs from Wikimedia/NASA public sources
  getPlanetTextures: () => ({
    sun: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg/1280px-The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg',
    mercury: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mercury_in_true_color.jpg/1024px-Mercury_in_true_color.jpg',
    venus: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Venus_from_Mariner_10.jpg/1024px-Venus_from_Mariner_10.jpg',
    earth: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/The_Blue_Marble_%28remastered%29.jpg/1024px-The_Blue_Marble_%28remastered%29.jpg',
    mars: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Mars_-_August_30_2021_-_Flipped.jpg/1024px-Mars_-_August_30_2021_-_Flipped.jpg',
    jupiter: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Jupiter_New_Horizons.jpg/1024px-Jupiter_New_Horizons.jpg',
    saturn: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Saturn_during_Equinox.jpg/1024px-Saturn_during_Equinox.jpg',
    saturnRing: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Saturn_ring_EA.png/1024px-Saturn_ring_EA.png',
    uranus: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Uranus_as_seen_by_NASA%27s_Voyager_2_%28remastered%29_-_JPEG_converted.jpg/1024px-Uranus_as_seen_by_NASA%27s_Voyager_2_%28remastered%29_-_JPEG_converted.jpg',
    neptune: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg/1024px-Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg',
    moon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/1024px-FullMoon2010.jpg'
  })
};
