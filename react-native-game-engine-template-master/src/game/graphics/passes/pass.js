import { THREE } from 'expo-three';

/**
 * Pass class - base class for all post-processing passes.
 */
class Pass {
  constructor() {
    this.enabled = true; // If true, the pass is processed by the composer
    this.needsSwap = true; // If true, swap read and write buffer after rendering
    this.clear = false; // If true, clear buffer before rendering
    this.renderToScreen = false; // If true, the result of the pass is rendered to screen
  }

  setSize(width, height) {
    // Method to be implemented in derived passes (if needed)
  }

  render(renderer, writeBuffer, readBuffer, delta, maskActive) {
    console.error('THREE.Pass: .render() must be implemented in derived pass.');
  }
}

THREE.Pass = Pass; // Assign to the global THREE namespace

/**
 * FullScreenQuad class - renders a fullscreen quad with a given material.
 */
class FullScreenQuad {
  constructor(material) {
    const geometry = new THREE.PlaneBufferGeometry(2, 2);
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this._mesh = new THREE.Mesh(geometry, material);
  }

  get material() {
    return this._mesh.material;
  }

  set material(value) {
    this._mesh.material = value;
  }

  render(renderer) {
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    renderer.render(this._mesh, camera);
  }
}

THREE.Pass.FullScreenQuad = FullScreenQuad; // Assign to the global THREE namespace

export default Pass; // Export the Pass class
