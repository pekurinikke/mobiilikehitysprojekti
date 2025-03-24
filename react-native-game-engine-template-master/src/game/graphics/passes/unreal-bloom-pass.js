import { THREE } from 'expo-three';
const {
  AdditiveBlending,
  Color,
  LinearFilter,
  MeshBasicMaterial,
  RGBAFormat,
  ShaderMaterial,
  UniformsUtils,
  Vector2,
  Vector3,
  WebGLRenderTarget
} = THREE;
import Pass from './pass';
import CopyShader from '../shaders/copy-shader';
import LuminosityHighPassShader from '../shaders/luminosity-high-pass-shader';
import { screen } from '../../utils';

/**
 * UnrealBloomPass class to apply the Unreal Bloom effect on a scene.
 * Inspired by Unreal Engine's bloom effect.
 */
class UnrealBloomPass extends Pass {
  constructor(
    resolution = new Vector2(screen.width, screen.height),
    strength = 2,
    radius = 0.75,
    threshold = 0
  ) {
    super();
    this.strength = strength;
    this.radius = radius;
    this.threshold = threshold;
    this.resolution = resolution || new Vector2(256, 256);

    this.clearColor = new Color(0, 0, 0);
    this.renderTargetsHorizontal = [];
    this.renderTargetsVertical = [];
    this.nMips = 5;

    // Initial resolution size
    let resx = Math.round(this.resolution.x / 2);
    let resy = Math.round(this.resolution.y / 2);

    // Setup render targets
    const pars = { minFilter: LinearFilter, magFilter: LinearFilter, format: RGBAFormat };
    this.renderTargetBright = new WebGLRenderTarget(resx, resy, pars);
    this.renderTargetBright.texture.name = 'UnrealBloomPass.bright';
    this.renderTargetBright.texture.generateMipmaps = false;

    for (let i = 0; i < this.nMips; i++) {
      const renderTargetHorizonal = new WebGLRenderTarget(resx, resy, pars);
      renderTargetHorizonal.texture.name = `UnrealBloomPass.h${i}`;
      renderTargetHorizonal.texture.generateMipmaps = false;
      this.renderTargetsHorizontal.push(renderTargetHorizonal);

      const renderTargetVertical = new WebGLRenderTarget(resx, resy, pars);
      renderTargetVertical.texture.name = `UnrealBloomPass.v${i}`;
      renderTargetVertical.texture.generateMipmaps = false;
      this.renderTargetsVertical.push(renderTargetVertical);

      resx = Math.round(resx / 2);
      resy = Math.round(resy / 2);
    }

    // Set up the high pass filter
    if (!LuminosityHighPassShader) {
      console.error('UnrealBloomPass relies on LuminosityHighPassShader');
    }

    this.highPassUniforms = UniformsUtils.clone(LuminosityHighPassShader.uniforms);
    this.highPassUniforms['luminosityThreshold'].value = threshold;
    this.highPassUniforms['smoothWidth'].value = 0.01;

    this.materialHighPassFilter = new ShaderMaterial({
      uniforms: this.highPassUniforms,
      vertexShader: LuminosityHighPassShader.vertexShader,
      fragmentShader: LuminosityHighPassShader.fragmentShader
    });

    // Separable blur materials
    this.separableBlurMaterials = [];
    const kernelSizeArray = [3, 5, 7, 9, 11];
    resx = Math.round(this.resolution.x / 2);
    resy = Math.round(this.resolution.y / 2);

    for (let i = 0; i < this.nMips; i++) {
      this.separableBlurMaterials.push(this.getSeperableBlurMaterial(kernelSizeArray[i]));
      this.separableBlurMaterials[i].uniforms['texSize'].value = new Vector2(resx, resy);
      resx = Math.round(resx / 2);
      resy = Math.round(resy / 2);
    }

    // Composite material
    this.compositeMaterial = this.getCompositeMaterial(this.nMips);
    this.compositeMaterial.uniforms['blurTexture1'].value = this.renderTargetsVertical[0].texture;
    this.compositeMaterial.uniforms['blurTexture2'].value = this.renderTargetsVertical[1].texture;
    this.compositeMaterial.uniforms['blurTexture3'].value = this.renderTargetsVertical[2].texture;
    this.compositeMaterial.uniforms['blurTexture4'].value = this.renderTargetsVertical[3].texture;
    this.compositeMaterial.uniforms['blurTexture5'].value = this.renderTargetsVertical[4].texture;
    this.compositeMaterial.uniforms['bloomStrength'].value = strength;
    this.compositeMaterial.uniforms['bloomRadius'].value = 0.1;
    this.compositeMaterial.needsUpdate = true;

    const bloomFactors = [1.0, 0.8, 0.6, 0.4, 0.2];
    this.compositeMaterial.uniforms['bloomFactors'].value = bloomFactors;
    this.bloomTintColors = Array(5).fill(new Vector3(1, 1, 1));
    this.compositeMaterial.uniforms['bloomTintColors'].value = this.bloomTintColors;

    // Copy shader
    if (!CopyShader) {
      console.error('UnrealBloomPass relies on CopyShader');
    }

    this.copyUniforms = UniformsUtils.clone(CopyShader.uniforms);
    this.copyUniforms['opacity'].value = 1.0;

    this.materialCopy = new ShaderMaterial({
      uniforms: this.copyUniforms,
      vertexShader: CopyShader.vertexShader,
      fragmentShader: CopyShader.fragmentShader,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true
    });

    // Initialization
    this.enabled = true;
    this.needsSwap = false;
    this.oldClearColor = new Color();
    this.oldClearAlpha = 1;
    this.basic = new MeshBasicMaterial();
    this.fsQuad = new Pass.FullScreenQuad(null);
  }

  dispose() {
    this.renderTargetsHorizontal.forEach(target => target.dispose());
    this.renderTargetsVertical.forEach(target => target.dispose());
    this.renderTargetBright.dispose();
  }

  setSize(width, height) {
    let resx = Math.round(width / 2);
    let resy = Math.round(height / 2);

    this.renderTargetBright.setSize(resx, resy);

    for (let i = 0; i < this.nMips; i++) {
      this.renderTargetsHorizontal[i].setSize(resx, resy);
      this.renderTargetsVertical[i].setSize(resx, resy);
      this.separableBlurMaterials[i].uniforms['texSize'].value = new Vector2(resx, resy);
      resx = Math.round(resx / 2);
      resy = Math.round(resy / 2);
    }
  }

  render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
    this.oldClearColor.copy(renderer.getClearColor());
    this.oldClearAlpha = renderer.getClearAlpha();
    const oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;
    renderer.setClearColor(this.clearColor, 0);

    if (maskActive) renderer.context.disable(renderer.context.STENCIL_TEST);

    // Render input to screen
    if (this.renderToScreen) {
      this.fsQuad.material = this.basic;
      this.basic.map = readBuffer.texture;
      renderer.setRenderTarget(null);
      renderer.clear();
      this.fsQuad.render(renderer);
    }

    // 1. Extract Bright Areas
    this.highPassUniforms['tDiffuse'].value = readBuffer.texture;
    this.highPassUniforms['luminosityThreshold'].value = this.threshold;
    this.fsQuad.material = this.materialHighPassFilter;
    renderer.setRenderTarget(this.renderTargetBright);
    renderer.clear();
    this.fsQuad.render(renderer);

    // 2. Blur All the mips progressively
    let inputRenderTarget = this.renderTargetBright;

    for (let i = 0; i < this.nMips; i++) {
      this.fsQuad.material = this.separableBlurMaterials[i];

      this.separableBlurMaterials[i].uniforms['colorTexture'].value = inputRenderTarget.texture;
      this.separableBlurMaterials[i].uniforms['direction'].value = UnrealBloomPass.BlurDirectionX;
      renderer.setRenderTarget(this.renderTargetsHorizontal[i]);
      renderer.clear();
      this.fsQuad.render(renderer);

      this.separableBlurMaterials[i].uniforms['colorTexture'].value = this.renderTargetsHorizontal[i].texture;
      this.separableBlurMaterials[i].uniforms['direction'].value = UnrealBloomPass.BlurDirectionY;
      renderer.setRenderTarget(this.renderTargetsVertical[i]);
      renderer.clear();
      this.fsQuad.render(renderer);

      inputRenderTarget = this.renderTargetsVertical[i];
    }

    // 3. Composite All the mips
    this.fsQuad.material = this.compositeMaterial;
    this.compositeMaterial.uniforms['bloomStrength'].value = this.strength;
    this.compositeMaterial.uniforms['bloomRadius'].value = this.radius;
    this.compositeMaterial.uniforms['bloomTintColors'].value = this.bloomTintColors;

    renderer.setRenderTarget(this.renderTargetsHorizontal[0]);
    renderer.clear();
    this.fsQuad.render(renderer);

    // Blend it additively over the input texture
    this.fsQuad.material = this.materialCopy;
    this.copyUniforms['tDiffuse'].value = this.renderTargetsHorizontal[0].texture;

    if (maskActive) renderer.context.enable(renderer.context.STENCIL_TEST);

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(readBuffer);
      this.fsQuad.render(renderer);
    }

    // Restore renderer settings
    renderer.setClearColor(this.oldClearColor, this.oldClearAlpha);
    renderer.autoClear = oldAutoClear;
  }

  static BlurDirectionX = new Vector2(1.0, 0.0);
  static BlurDirectionY = new Vector2(0.0, 1.0);

  getSeperableBlurMaterial(kernelSize) {
    // Implement your blur material setup here...
  }

  getCompositeMaterial(nMips) {
    // Implement your composite material setup here...
  }
}

export default UnrealBloomPass;
