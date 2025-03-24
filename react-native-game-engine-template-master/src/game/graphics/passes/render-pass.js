import { THREE } from 'expo-three';
import Pass from './pass';

/**
 * @author alteredq / http://alteredqualia.com/
 */

class RenderPass extends Pass {
  constructor(scene, camera, overrideMaterial, clearColor, clearAlpha) {
    super();

    this.scene = scene;
    this.camera = camera;
    this.overrideMaterial = overrideMaterial;
    this.clearColor = clearColor;
    this.clearAlpha = clearAlpha !== undefined ? clearAlpha : 0;

    this.clear = true;
    this.clearDepth = false;
    this.needsSwap = false;
  }

  render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
    const oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;

    this.scene.overrideMaterial = this.overrideMaterial;

    let oldClearColor, oldClearAlpha;

    if (this.clearColor) {
      oldClearColor = renderer.getClearColor().getHex();
      oldClearAlpha = renderer.getClearAlpha();
      renderer.setClearColor(this.clearColor, this.clearAlpha);
    }

    if (this.clearDepth) {
      renderer.clearDepth();
    }

    renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);

    // Clear buffers if needed
    if (this.clear) renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil);

    // Render the scene with the camera
    renderer.render(this.scene, this.camera);

    if (this.clearColor) {
      renderer.setClearColor(oldClearColor, oldClearAlpha);
    }

    this.scene.overrideMaterial = null;
    renderer.autoClear = oldAutoClear;
  }
}

THREE.RenderPass = RenderPass;

export default RenderPass;
