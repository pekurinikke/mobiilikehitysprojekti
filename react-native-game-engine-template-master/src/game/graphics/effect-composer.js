import { THREE } from 'expo-three';
import CopyShader from './shaders/copy-shader';
import ShaderPass from './passes/shader-pass';
import MaskPass from './passes/mask-pass';
import ClearMaskPass from './passes/clear-mask-pass';

/**
 * EffectComposer is a utility for performing post-processing effects
 * on a rendered scene using a sequence of passes.
 * @param {THREE.WebGLRenderer} renderer - The WebGL renderer.
 * @param {THREE.WebGLRenderTarget} renderTarget - Optional target for rendering.
 */
class EffectComposer {
  constructor(renderer, renderTarget) {
    this.renderer = renderer;

    // Default render target if not provided
    if (!renderTarget) {
      const params = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: false,
      };

      const size = new THREE.Vector2();
      renderer.getDrawingBufferSize(size);

      renderTarget = new THREE.WebGLRenderTarget(size.width, size.height, params);
      renderTarget.texture.name = 'EffectComposer.rt1';
    }

    // Initialize render targets
    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();
    this.renderTarget2.texture.name = 'EffectComposer.rt2';

    // Set initial read/write buffers
    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;

    // Initialize the list of passes and add a default copy pass
    this.passes = [];
    this.copyPass = new ShaderPass(CopyShader);
  }

  // Method to swap the read and write buffers
  swapBuffers() {
    [this.readBuffer, this.writeBuffer] = [this.writeBuffer, this.readBuffer];
  }

  // Method to add a pass to the effect composer pipeline
  addPass(pass) {
    this.passes.push(pass);
    const size = new THREE.Vector2();
    this.renderer.getDrawingBufferSize(size);
    pass.setSize(size.width, size.height);
  }

  // Method to insert a pass at a specific index
  insertPass(pass, index) {
    this.passes.splice(index, 0, pass);
  }

  // Method to render all passes
  render(delta) {
    let maskActive = false;

    for (const pass of this.passes) {
      if (!pass.enabled) continue;

      pass.render(this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive);

      if (pass.needsSwap) {
        if (maskActive) {
          const context = this.renderer.context;
          context.stencilFunc(context.NOTEQUAL, 1, 0xffffffff);
          this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, delta);
          context.stencilFunc(context.EQUAL, 1, 0xffffffff);
        }

        this.swapBuffers();
      }

      // Handle mask passes
      if (THREE.MaskPass !== undefined) {
        if (pass instanceof THREE.MaskPass) {
          maskActive = true;
        } else if (pass instanceof THREE.ClearMaskPass) {
          maskActive = false;
        }
      }
    }
  }

  // Reset render targets
  reset(renderTarget) {
    if (!renderTarget) {
      const size = new THREE.Vector2();
      this.renderer.getDrawingBufferSize(size);
      renderTarget = this.renderTarget1.clone();
      renderTarget.setSize(size.width, size.height);
    }

    this.renderTarget1.dispose();
    this.renderTarget2.dispose();

    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();

    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;
  }

  // Set the size of the render targets and passes
  setSize(width, height) {
    this.renderTarget1.setSize(width, height);
    this.renderTarget2.setSize(width, height);

    for (const pass of this.passes) {
      pass.setSize(width, height);
    }
  }
}

export default EffectComposer;
