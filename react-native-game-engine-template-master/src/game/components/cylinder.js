import { THREE } from "expo-three";
import { add } from "../utils/three";

export default ({
    parent,
    world,
    dynamic = true,
    x = 0,
    y = 0,
    z = 0,
    radius = 0.5,
    height = 1.1,
    segments = 32,
    scale = 1,
    color = 0x0fe61f,
    opacity = 1,
}) => {
    const cylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, height, segments),
        new THREE.MeshStandardMaterial({ color, transparent: opacity < 1, opacity, flatShading: true })
    );

    cylinder.position.set(x, y, z);
    cylinder.scale.setScalar(scale);

    add(parent, cylinder);

    return {
        model: cylinder,
        bodies: [
            world.add({
                type: "cylinder",
                size: [radius * scale, height * scale],
                pos: [x, y, z],
                rot: [0, 0, 0],
                move: dynamic,
                density: 0.1,
                friction: 0.9,
                restitution: 0.2,
                belongsTo: 1,
                collidesWith: 0xffffffff
            })
        ],
        removable: (frustum, self) => !frustum.intersectsObject(self.model)
    };
};