import React, { PureComponent } from 'react';
import { Platform } from 'react-native';
import ExpoGraphics from 'expo-graphics-rnge';
import ExpoTHREE, { THREE } from 'expo-three';
import EffectComposer from './effect-composer';
import RenderPass from './passes/render-pass';
import _ from 'lodash';

THREE.suppressExpoWarnings();

class ThreeView extends PureComponent {
  constructor(props) {
    super(props);
    this.gl = null;
    this.renderer = null;
    this.composer = null;
  }

  onShouldReloadContext = () => {
    return Platform.OS === 'android';
  };

  onContextCreate = async ({ gl, canvas, width, height, scale: pixelRatio }) => {
    const { camera, scene, passes } = this.props;

    // Resizing the camera
    camera.resize(width, height, pixelRatio);

    // Initialize renderer
    this.renderer = new ExpoTHREE.Renderer({ gl, pixelRatio, width, height });
    this.renderer.setClearColor(0x020202, 1.0);

    // Set up post-processing
    this.gl = gl;
    this.composer = new EffectComposer(this.renderer);

    // Disable the render buffer if required (debugging workaround for some issues)
    this.gl.createRenderbuffer = () => {};

    // Create passes (main render pass + custom passes)
    const allPasses = [new RenderPass(scene, camera), ...passes];
    allPasses.forEach(p => this.composer.addPass(p));
    allPasses[allPasses.length - 1].renderToScreen = true;
  };

  onResize = ({ width, height, scale: pixelRatio }) => {
    const { camera } = this.props;

    // Resize the camera and the renderer
    camera.resize(width, height, pixelRatio);
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(pixelRatio);
  };

  render() {
    if (this.composer && this.gl) {
      // Render the scene with post-processing
      this.composer.render();
      this.gl.endFrameEXP();
    }

    return (
      <ExpoGraphics.View
        onContextCreate={this.onContextCreate}
        onResize={this.onResize}
        onShouldReloadContext={this.onShouldReloadContext}
        shouldIgnoreSafeGaurds={true}
        isShadowsEnabled={false}
      />
    );
  }
}

const renderHUD = (entities, screen) => {
  if (!entities.hud) return null;

  const hud = entities.hud;

  if (typeof hud.renderer === 'object') {
    return <hud.renderer.type key="hud" screen={screen} {...hud} />;
  }

  if (typeof hud.renderer === 'function') {
    return <hud.renderer key="hud" screen={screen} {...hud} />;
  }

  return null;
};

const ThreeJSRenderer = (...passes) => (entities, screen) => {
  if (!entities) return null;

  return [
    <ThreeView
      passes={_.flatten(passes)}
      key="three-view"
      scene={entities.scene}
      camera={entities.camera}
    />,
    renderHUD(entities, screen),
  ];
};

export default ThreeJSRenderer;
