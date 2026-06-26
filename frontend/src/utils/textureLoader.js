import * as THREE from 'three';
import { generatePlanetTexture } from './planetTextures';

const textureFiles = {
  earth: '/textures/earth.jpg',
  moon: '/textures/moon.jpg'
};

const textureCache = {};

export const loadPlanetTexture = (planetName) => {
  const key = planetName.toLowerCase();

  if (textureCache[key]) {
    return textureCache[key];
  }

  if (textureFiles[key]) {
    const texture = new THREE.TextureLoader().load(textureFiles[key]);
    textureCache[key] = texture;
    return texture;
  }

  const canvas = generatePlanetTexture(key);
  const texture = new THREE.CanvasTexture(canvas);
  textureCache[key] = texture;
  return texture;
};

export const loadSunTexture = () => {
  if (textureCache.sun) return textureCache.sun;
  const canvas = generatePlanetTexture('sun');
  const texture = new THREE.CanvasTexture(canvas);
  textureCache.sun = texture;
  return texture;
};
