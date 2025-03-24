import { THREE } from "expo-three";
import { screen } from "../../utils";

/**
 * Pixelation Shader that adds pixelation with adjustable borders and color manipulation
 * @param {Object} options - Shader configuration
 * @param {number} options.pixelSize - Size of each pixel (larger for more pixelation)
 * @param {number} options.borderSize - Size of the border around pixels for effects
 * @param {number} options.lightenFactor - Factor for lightening the border pixels
 * @param {number} options.softenFactor - Factor for softening the left-side border pixels
 * @param {number} options.darkenFactor - Factor for darkening the bottom border pixels
 * @param {THREE.Vector2} options.resolution - Resolution of the screen (width, height)
 * @returns {Object} The shader with uniforms, vertexShader, and fragmentShader
 */
export default ({
  pixelSize = 5,
  borderSize = 1,
  lightenFactor = 1.8,
  softenFactor = 0.75,
  darkenFactor = 0.5,
  resolution = new THREE.Vector2(screen.width, screen.height),
} = {}) => {
  const pixelShader = {
    uniforms: {
      tDiffuse: { value: null },
      pixelSize: { value: pixelSize },
      borderFraction: { value: borderSize / pixelSize },
      lightenFactor: { value: lightenFactor },
      softenFactor: { value: softenFactor },
      darkenFactor: { value: darkenFactor },
      resolution: { value: resolution },
    },

    vertexShader: /* glsl */ `
      varying highp vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,

    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse;
      uniform float pixelSize;
      uniform float borderFraction;
      uniform float lightenFactor;
      uniform float softenFactor;
      uniform float darkenFactor;
      uniform vec2 resolution;

      varying highp vec2 vUv;

      void main() {
        vec2 dxy = pixelSize / resolution;
        vec2 pixel = vUv / dxy;
        vec2 fraction = fract(pixel);
        vec2 coord = dxy * floor(pixel);
        vec3 color = texture2D(tDiffuse, coord).xyz;

        // Border Effects
        if (fraction.y > (1.0 - borderFraction)) {
          color *= lightenFactor; // Lighten the top border
        }

        if (fraction.x < borderFraction) {
          color *= softenFactor; // Soften the left border
        }

        if (fraction.y < borderFraction) {
          color *= darkenFactor; // Darken the bottom border
        }

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  };

  return pixelShader;
};
