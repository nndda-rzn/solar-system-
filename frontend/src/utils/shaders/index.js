// Sun Glow Shader - Sphere-based glow instead of sprite
export const sunGlowVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const sunGlowFragmentShader = `
  uniform vec3 glowColor;
  uniform float intensity;
  uniform float power;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vec3 viewDirection = normalize(-vPosition);
    float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), power);
    vec3 color = glowColor * fresnel * intensity;
    float alpha = fresnel * intensity;
    gl_FragColor = vec4(color, alpha);
  }
`;

// Atmosphere Shader
export const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const atmosphereFragmentShader = `
  uniform vec3 atmosphereColor;
  uniform float atmosphereIntensity;
  uniform float atmospherePower;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vec3 viewDirection = normalize(-vPosition);
    float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), atmospherePower);
    vec3 color = atmosphereColor * fresnel * atmosphereIntensity;
    float alpha = fresnel * atmosphereIntensity * 0.6;
    gl_FragColor = vec4(color, alpha);
  }
`;
