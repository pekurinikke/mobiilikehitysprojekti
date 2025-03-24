import { THREE } from 'expo-three';
import Pass from './pass';

/**
 * @author alteredq / http://alteredqualia.com/
 */

class ClearMaskPass extends Pass {
  constructor() {
    super();
    this.needsSwap = false;
  }

  render(renderer, writeBuffer, readBuffer, delta, maskActive) {
    // Disable stencil test to clear the mask
    renderer.state.buffers.stencil.setTest(false);
  }
}

export default ClearMaskPass;
