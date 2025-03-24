import { THREE } from "expo-three";

/**
 * Creates a scanline shader with customizable thickness and color.
 * @param {number} thickness - The height of each scanline.
 * @param {THREE.Vector4} color - The color of the scanline, typically black or transparent.
 * @returns {Object} The scanline shader material.
 */
export default (thickness = 5.0, color = new THREE.Vector4(0, 0, 0, 1)) => {
  const scanlineShader = {
    uniforms: {
      tDiffuse: { value: null },
      thickness: { value: thickness },
      color: { value: color },
    },

    vertexShader: /* glsl */ `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,

    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse;
      uniform float thickness;
      uniform vec4 color;

      varying vec2 vUv;

      void main() {
        // Create scanline effect based on fragment coordinates
        float scanline = floor(mod(gl_FragCoord.y, thickness));

        // If it's a scanline, replace the texture color with the scanline color
        gl_FragColor = scanline == 0.0 ? texture2D(tDiffuse, vUv) : color;
      }
    `,
  };

  return scanlineShader;
};
