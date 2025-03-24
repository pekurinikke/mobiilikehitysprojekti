import ExpoTHREE from "expo-three";
import GPUParticleSystem from "../graphics/gpu-particle-system";
import { add } from "../utils/three";
import NoiseFile from "../../assets/textures/perlin.png";

export default async ({
    maxParticles = 250,
    noiseTexture,
    particleTexture,
    parent,
    options = {},
    spawnOptions = {},
    beforeSpawn = () => {}
}) => {
    // Load noise texture only if not provided
    const defaultNoiseTexture = noiseTexture || ExpoTHREE.loadAsync(NoiseFile);
    const loadedNoiseTexture = await defaultNoiseTexture;
    const loadedParticleTexture = particleTexture ? await particleTexture : null;

    // Create GPU Particle System
    const emitter = new GPUParticleSystem({
        maxParticles,
        particleNoiseTex: loadedNoiseTexture,
        particleSpriteTex: loadedParticleTexture
    });

    // Add emitter to scene
    add(parent, emitter);

    return {
        emitter,
        options,
        spawnOptions,
        beforeSpawn,
        tick: 0
    };
};
