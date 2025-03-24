import { THREE } from 'expo-three';

/**
 * GPUParticleSystem - A modernized, general-purpose GPU particle system.
 * Supports dynamic spawning and automatic cleanup.
 */
class GPUParticleSystem extends THREE.Object3D {
  constructor(options = {}) {
    super();
    // Set default values and destructure passed options
    const {
      maxParticles = 1000000,
      containerCount = 1,
      particleNoiseTex = null,
      particleSpriteTex = null,
    } = options;

    this.PARTICLE_COUNT = maxParticles;
    this.PARTICLE_CONTAINERS = containerCount;
    this.PARTICLE_NOISE_TEXTURE = particleNoiseTex;
    this.PARTICLE_SPRITE_TEXTURE = particleSpriteTex;

    this.PARTICLES_PER_CONTAINER = Math.ceil(this.PARTICLE_COUNT / this.PARTICLE_CONTAINERS);
    this.PARTICLE_CURSOR = 0;
    this.time = 0;
    this.particleContainers = [];
    this.rand = [];

    // Particle shader
    this.particleShaderMat = this.createParticleShader();

    // Preload random values
    for (let i = 1e5; i > 0; i--) {
      this.rand.push(Math.random() - 0.5);
    }

    this.random = () => ++i >= this.rand.length ? this.rand[(i = 1)] : this.rand[i];

    // Texture wrapping
    this.particleNoiseTex.wrapS = this.particleNoiseTex.wrapT = THREE.RepeatWrapping;
    this.particleSpriteTex.wrapS = this.particleSpriteTex.wrapT = THREE.RepeatWrapping;

    this.init();
  }

  createParticleShader() {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0.0 },
        uScale: { value: 1.0 },
        tNoise: { value: this.PARTICLE_NOISE_TEXTURE },
        tSprite: { value: this.PARTICLE_SPRITE_TEXTURE },
      },
      blending: THREE.AdditiveBlending,
      vertexShader: `
        uniform float uTime;
        uniform float uScale;
        uniform sampler2D tNoise;

        attribute vec3 positionStart;
        attribute float startTime;
        attribute vec3 velocity;
        attribute float turbulence;
        attribute vec3 color;
        attribute float size;
        attribute float lifeTime;

        varying vec4 vColor;
        varying float lifeLeft;

        void main() {
          vColor = vec4(color, 1.0);
          float timeElapsed = uTime - startTime;
          lifeLeft = 1.0 - (timeElapsed / lifeTime);
          gl_PointSize = (uScale * size) * lifeLeft;

          vec3 newPosition = positionStart + velocity * timeElapsed;
          vec3 noise = texture2D(tNoise, vec2(newPosition.x * 0.015 + (uTime * 0.05), newPosition.y * 0.02 + (uTime * 0.015))).rgb;
          vec3 noiseVel = (noise.rgb - 0.5) * 30.0;
          newPosition = mix(newPosition, newPosition + noiseVel * (turbulence * 5.0), timeElapsed / lifeTime);

          if (v.y > 0. && v.y < 0.05) lifeLeft = 0.0;
          if (v.x < -1.45) lifeLeft = 0.0;

          if (timeElapsed > 0.0) {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
          } else {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            lifeLeft = 0.0;
            gl_PointSize = 0.0;
          }
        }
      `,
      fragmentShader: `
        float scaleLinear(float value, vec2 valueDomain) {
          return (value - valueDomain.x) / (valueDomain.y - valueDomain.x);
        }

        float scaleLinear(float value, vec2 valueDomain, vec2 valueRange) {
          return mix(valueRange.x, valueRange.y, scaleLinear(value, valueDomain));
        }

        varying vec4 vColor;
        varying float lifeLeft;
        uniform sampler2D tSprite;

        void main() {
          float alpha = lifeLeft > 0.995 ? scaleLinear(lifeLeft, vec2(1.0, 0.995), vec2(0.0, 1.0)) : lifeLeft * 0.75;
          vec4 tex = texture2D(tSprite, gl_PointCoord);
          gl_FragColor = vec4(vColor.rgb * tex.a, alpha * tex.a);
        }
      `,
    });
  }

  init() {
    // Create containers for particles
    for (let i = 0; i < this.PARTICLE_CONTAINERS; i++) {
      const container = new GPUParticleContainer(this.PARTICLES_PER_CONTAINER, this);
      this.particleContainers.push(container);
      this.add(container);
    }
  }

  spawnParticle(options = {}) {
    this.PARTICLE_CURSOR++;
    if (this.PARTICLE_CURSOR >= this.PARTICLE_COUNT) this.PARTICLE_CURSOR = 1;

    const currentContainer = this.particleContainers[Math.floor(this.PARTICLE_CURSOR / this.PARTICLES_PER_CONTAINER)];
    currentContainer.spawnParticle(options);
  }

  update(time) {
    this.particleContainers.forEach(container => container.update(time));
  }

  dispose() {
    this.particleShaderMat.dispose();
    this.PARTICLE_NOISE_TEXTURE.dispose();
    this.PARTICLE_SPRITE_TEXTURE.dispose();

    this.particleContainers.forEach(container => container.dispose());
  }
}

class GPUParticleContainer extends THREE.Object3D {
  constructor(maxParticles, particleSystem) {
    super();
    this.PARTICLE_COUNT = maxParticles;
    this.PARTICLE_CURSOR = 0;
    this.time = 0;
    this.offset = 0;
    this.count = 0;
    this.DPR = window.devicePixelRatio;
    this.GPUParticleSystem = particleSystem;

    this.particleShaderGeo = new THREE.BufferGeometry();
    this.createParticleAttributes();

    this.particleShaderMat = this.GPUParticleSystem.particleShaderMat;
    this.init();
  }

  createParticleAttributes() {
    this.particleShaderGeo.addAttribute('position', new THREE.BufferAttribute(new Float32Array(this.PARTICLE_COUNT * 3), 3).setDynamic(true));
    this.particleShaderGeo.addAttribute('positionStart', new THREE.BufferAttribute(new Float32Array(this.PARTICLE_COUNT * 3), 3).setDynamic(true));
    this.particleShaderGeo.addAttribute('startTime', new THREE.BufferAttribute(new Float32Array(this.PARTICLE_COUNT), 1).setDynamic(true));
    this.particleShaderGeo.addAttribute('velocity', new THREE.BufferAttribute(new Float32Array(this.PARTICLE_COUNT * 3), 3).setDynamic(true));
    this.particleShaderGeo.addAttribute('turbulence', new THREE.BufferAttribute(new Float32Array(this.PARTICLE_COUNT), 1).setDynamic(true));
    this.particleShaderGeo.addAttribute('color', new THREE.BufferAttribute(new Float32Array(this.PARTICLE_COUNT * 3), 3).setDynamic(true));
    this.particleShaderGeo.addAttribute('size', new THREE.BufferAttribute(new Float32Array(this.PARTICLE_COUNT), 1).setDynamic(true));
    this.particleShaderGeo.addAttribute('lifeTime', new THREE.BufferAttribute(new Float32Array(this.PARTICLE_COUNT), 1).setDynamic(true));
  }

  spawnParticle(options = {}) {
    const positionStartAttribute = this.particleShaderGeo.getAttribute('positionStart');
    const startTimeAttribute = this.particleShaderGeo.getAttribute('startTime');
    const velocityAttribute = this.particleShaderGeo.getAttribute('velocity');
    const turbulenceAttribute = this.particleShaderGeo.getAttribute('turbulence');
    const colorAttribute = this.particleShaderGeo.getAttribute('color');
    const sizeAttribute = this.particleShaderGeo.getAttribute('size');
    const lifeTimeAttribute = this.particleShaderGeo.getAttribute('lifeTime');

    // Set default values if not provided in options
    const position = new THREE.Vector3(options.position || [0, 0, 0]);
    const velocity = new THREE.Vector3(options.velocity || [0, 0, 0]);
    const color = new THREE.Color(options.color || 0xffffff);
    const turbulence = options.turbulence || 1;
    const lifetime = options.lifetime || 5;
    const size = options.size || 10;

    const positionRandomness = options.positionRandomness || 0;
    const velocityRandomness = options.velocityRandomness || 0;
    const colorRandomness = options.colorRandomness || 1;
    const sizeRandomness = options.sizeRandomness || 0;

    if (this.DPR) size *= this.DPR;

    const i = this.PARTICLE_CURSOR;
    positionStartAttribute.array.set([position.x, position.y, position.z], i * 3);
    velocityAttribute.array.set([velocity.x, velocity.y, velocity.z], i * 3);
    colorAttribute.array.set([color.r, color.g, color.b], i * 3);

    // Additional attributes like turbulence, size, and lifetime
    turbulenceAttribute.array[i] = turbulence;
    sizeAttribute.array[i] = size + this.GPUParticleSystem.random() * sizeRandomness;
    lifeTimeAttribute.array[i] = lifetime;
    startTimeAttribute.array[i] = this.time + this.GPUParticleSystem.random() * 2e-2;

    this.count++;
    this.PARTICLE_CURSOR = (this.PARTICLE_CURSOR + 1) % this.PARTICLE_COUNT;
  }

  init() {
    this.particleSystem = new THREE.Points(this.particleShaderGeo, this.particleShaderMat);
    this.particleSystem.frustumCulled = false;
    this.add(this.particleSystem);
  }

  update(time) {
    this.time = time;
    this.particleShaderMat.uniforms.uTime.value = time;
    this.geometryUpdate();
  }

  geometryUpdate() {
    if (this.count > 0) {
      const positionStartAttribute = this.particleShaderGeo.getAttribute('positionStart');
      const startTimeAttribute = this.particleShaderGeo.getAttribute('startTime');
      const velocityAttribute = this.particleShaderGeo.getAttribute('velocity');
      const turbulenceAttribute = this.particleShaderGeo.getAttribute('turbulence');
      const colorAttribute = this.particleShaderGeo.getAttribute('color');
      const sizeAttribute = this.particleShaderGeo.getAttribute('size');
      const lifeTimeAttribute = this.particleShaderGeo.getAttribute('lifeTime');

      positionStartAttribute.needsUpdate = true;
      startTimeAttribute.needsUpdate = true;
      velocityAttribute.needsUpdate = true;
      turbulenceAttribute.needsUpdate = true;
      colorAttribute.needsUpdate = true;
      sizeAttribute.needsUpdate = true;
      lifeTimeAttribute.needsUpdate = true;

      this.count = 0;
    }
  }

  dispose() {
    this.particleShaderGeo.dispose();
  }
}

export default GPUParticleSystem;
