import { add, cloneMesh } from "../utils/three";
import { clamp } from "../utils";

export default async ({ parent, x = 0, y = 0, z = 0, scale = 1, mesh, morphTargets = {} }) => {
    const model = cloneMesh(await Promise.resolve(mesh));

    Object.assign(model.position, { x, y, z });
    model.scale.set(scale, scale, scale);

    add(parent, model);

    const poses = Object.fromEntries(
        Object.entries(morphTargets).map(([key, index]) => [
            key,
            (weight) => weight == null 
                ? model.morphTargetInfluences?.[index] 
                : (model.morphTargetInfluences[index] = clamp(weight, 0, 1))
        ])
    );

    return { model, poses };
};
