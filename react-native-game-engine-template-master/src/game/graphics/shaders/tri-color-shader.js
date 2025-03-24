import { THREE } from "expo-three";

/**
 * Tri-Color Shader
 * This shader applies a tri-color effect based on the difference between
 * adjacent texels. It switches colors based on the pixel difference.
 * @param {Object} options - Shader options.
 * @param {number} options.distance - The horizontal offset to sample the neighboring texel.
 * @param {number} options.threshold - The threshold to determine color switching based on the difference.
 * @param {Array} options.colors - An array of three colors to apply based on the texel difference.
 * @returns {Object} The tri-color shader material.
 */
export default ({
  distance = 0.005,
  threshold = 0,
  colors = [
    new THREE.Color(0xFFFFFF), // Color 1 (Default white)
    new THREE.Color(0x362928), // Color 2 (Default dark red-brown)
    new THREE.Color(0xFF3526), // Color 3 (Default bright red)
  ] 
} = {}) => {
  
  const triColorShader = {
    uniforms: {
      tDiffuse: { value: null },  // The texture to apply the effect to
      distance: { value: distance },  // Distance to sample neighboring texel
      threshold: { value: threshold },  // Threshold for color switching
      colors: { 
        value: colors.map(color => new THREE.Vector4(color.r, color.g, color.b, 1))  // Convert colors to Vector4 for use in GLSL
      }
    },

    vertexShader: /* glsl */ `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,

    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse;  // The input texture
      uniform float distance;  // Horizontal offset to sample neighboring texel
      uniform float threshold;  // Threshold for deciding color based on difference
      uniform vec4 colors[3];  // Three colors based on the texel difference

      varying vec2 vUv;

      void main() {
        // Sample the current texel
        vec4 tex = texture2D(tDiffuse, vUv);

        // Sample the neighboring texel with a horizontal offset
        vec4 tex2 = texture2D(tDiffuse, vec2(vUv.x + distance, vUv.y));

        // Calculate the sum of RGB channels (luminance) of the current texel and neighbor
        float test = tex.r + tex.g + tex.b;
        float test2 = tex2.r + tex2.g + tex2.b;

        // Calculate the difference between the neighboring texel and the current texel
        float diff = test2 - test;

        // Select a color based on the difference and the threshold
        if (diff < -threshold) {
          tex = colors[0];  // Use the first color (if the difference is below the negative threshold)
        } else if (diff > threshold) {
          tex = colors[1];  // Use the second color (if the difference is above the positive threshold)
        } else {
          tex = colors[2];  // Use the third color (if the difference is within the threshold range)
        }

        // Output the final color
        gl_FragColor = tex;
      }
    `,
  };

  return triColorShader;
};
