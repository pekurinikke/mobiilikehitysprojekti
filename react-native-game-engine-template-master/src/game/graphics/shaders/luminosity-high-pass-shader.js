import { THREE } from "expo-three";

/**
 * Luminosity High-Pass Shader
 * This shader isolates bright areas in an image based on a luminosity threshold.
 * It can be used for effects like bloom.
 * 
 * Reference: http://en.wikipedia.org/wiki/Luminosity
 */

const LuminosityHighPassShader = {

  shaderID: "luminosityHighPass",

  uniforms: {
    "tDiffuse": { value: null },              // Input texture
    "luminosityThreshold": { value: 1.0 },    // Threshold for bright areas
    "smoothWidth": { value: 1.0 },            // Smoothing for the threshold edge
    "defaultColor": { value: new THREE.Color(0x000000) }, // Default color when below threshold
    "defaultOpacity": { value: 0.0 }          // Opacity of the default color
  },

  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec3 defaultColor;
    uniform float defaultOpacity;
    uniform float luminosityThreshold;
    uniform float smoothWidth;

    varying vec2 vUv;

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      
      // Luminosity coefficients for RGB channels
      vec3 luma = vec3(0.299, 0.587, 0.114);
      
      // Calculate the luminosity of the pixel
      float luminosity = dot(texel.xyz, luma);
      
      // Default output color when pixel is below the luminosity threshold
      vec4 outputColor = vec4(defaultColor.rgb, defaultOpacity);

      // Smooth transition for luminosity thresholding
      float alpha = smoothstep(luminosityThreshold, luminosityThreshold + smoothWidth, luminosity);

      // Blend original color with default color based on alpha
      gl_FragColor = mix(outputColor, texel, alpha);
    }
  `
};

export default LuminosityHighPassShader;
