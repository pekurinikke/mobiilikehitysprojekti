import { THREE } from 'expo-three';

/**
 * Full-screen textured quad shader for copying an image to the screen.
 * This shader allows applying a texture to a full-screen quad with adjustable opacity.
 */

const CopyShader = {
  uniforms: {
    "tDiffuse": { value: null },  // Input texture
    "opacity": { value: 1.0 },    // Opacity for blending
  },

  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform float opacity;
    uniform sampler2D tDiffuse;
    varying vec2 vUv;

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      gl_FragColor = opacity * texel;
    }
  `,
};

export default CopyShader;
