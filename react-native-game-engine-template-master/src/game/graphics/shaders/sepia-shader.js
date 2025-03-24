/**
 * Sepia Tone Shader
 * Based on glfx.js sepia shader (https://github.com/evanw/glfx.js)
 * Applies a sepia tone effect to a texture with adjustable intensity.
 * @param {number} amount - The intensity of the sepia effect (0.0 to 1.0).
 * @returns {Object} The sepia shader material.
 */
export default (amount = 1.0) => {
	const sepiaShader = {
	  uniforms: {
		tDiffuse: { value: null },  // The texture to apply the effect to
		amount: { value: amount },  // The intensity of the sepia effect
	  },
  
	  vertexShader: /* glsl */ `
		varying vec2 vUv;
  
		void main() {
		  vUv = uv;
		  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	  `,
  
	  fragmentShader: /* glsl */ `
		uniform float amount;
		uniform sampler2D tDiffuse;
		varying vec2 vUv;
  
		void main() {
		  // Sample the color from the texture
		  vec4 color = texture2D(tDiffuse, vUv);
		  vec3 c = color.rgb;
  
		  // Apply sepia tone transformation
		  color.r = dot(c, vec3(1.0 - 0.607 * amount, 0.769 * amount, 0.189 * amount));
		  color.g = dot(c, vec3(0.349 * amount, 1.0 - 0.314 * amount, 0.168 * amount));
		  color.b = dot(c, vec3(0.272 * amount, 0.534 * amount, 1.0 - 0.869 * amount));
  
		  // Output the final color with a capped value of 1.0 (clipping)
		  gl_FragColor = vec4(min(vec3(1.0), color.rgb), color.a);
		}
	  `,
	};
  
	return sepiaShader;
  };
  