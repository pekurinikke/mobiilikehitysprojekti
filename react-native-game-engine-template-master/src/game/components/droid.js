import ExpoTHREE from "expo-three";
import AnimatedModel from "./animated-model";
import DroidFile from "../../assets/models/droid.fbx";

const meshPromise = ExpoTHREE.loadAsync(DroidFile);

export default async ({ parent, x = 0, y = 0, z = 0 }) => {
    const mesh = await meshPromise;
    return AnimatedModel({ parent, x, y, z, mesh, scale: 0.0035 });
};