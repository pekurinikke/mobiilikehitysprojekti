import ExpoTHREE, { THREE } from "expo-three";
import Particles from "./particles";
import ParticleFile from "../../assets/textures/particle.png";

export default async ({
    parent,
    x = 0,
    y = 0,
    z = 0,
    height = 0.5,
    radius = 0.5,
    verticalSpeed = 0.01,
    horizontalSpeed = 0.3,
    color = 0xffffff
}) => {
    // Load texture only when necessary
    const particleTexture = await ExpoTHREE.loadAsync(ParticleFile);

    // Initialize swirling particles
    const swirl = await Particles({
        parent,
        particleTexture,
        maxParticles: 250,
        options: {
            position: new THREE.Vector3(x, y, z),
            velocity: new THREE.Vector3(),
            color,
            lifetime: 12,
            size: 10,
            verticalSpeed,
            theta: 0 // Encapsulated to prevent external mutation
        },
        spawnOptions: {
            spawnRate: 20,
            timeScale: 1
        },
        beforeSpawn(self, entities, { options }) {
            // Update angle for circular motion
            self.theta = (self.theta || 0) + horizontalSpeed;

            // Update particle position
            Object.assign(options.position, {
                x: x + Math.cos(self.theta) * radius,
                y: options.position.y + verticalSpeed,
                z: z + Math.sin(self.theta) * radius
            });

            // Reverse vertical speed if height threshold is reached
            if (Math.abs(options.position.y - y) > height) {
                options.verticalSpeed *= -1;
            }
        }
    });

    return {
        model: swirl.emitter,
        particles: { swirl }
    };
};
