import { THREE } from "expo-three";
import { cloneTexture, add } from "../utils/three";
import { remap, clamp } from "../utils";

export default async ({ parent, x = 0, y = 0, z = 0, spriteSheet, rows, columns, actions: mappings = {} }) => {
  const texture = cloneTexture(await spriteSheet);
  texture.needsUpdate = true;
  texture.repeat.set(1 / columns, 1 / rows);

  const spriteMaterial = new THREE.SpriteMaterial({ map: texture, color: 0xffffff });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.position.set(x, y, z);

  add(parent, sprite);

  const actions = {};
  const timelines = {};

  Object.entries(mappings).forEach(([key, { start, end = start, loop = true, speed = 0.25, update, scaleX = 1, scaleY = 1, flipX = false, flipY = false }]) => {
    actions[key] = () => {
      if (timelines.action?.key === key) return;

      sprite.scale.set(scaleX, scaleY, 1);

      texture.repeat.set(
        Math.abs(texture.repeat.x) * (flipX ? -1 : 1),
        Math.abs(texture.repeat.y) * (flipY ? -1 : 1)
      );

      let { column: startColumn, row: startRow } = start;
      let { column: endColumn, row: endRow } = end;

      if (flipX) {
        startColumn++;
        endColumn++;
      }

      if (flipY) {
        startRow++;
        endRow++;
      }

      const increment = speed / Math.max(Math.abs(endColumn - startColumn), Math.abs(endRow - startRow), 1);

      if (loop) {
        endColumn++;
        endRow++;
      }

      timelines.action = {
        while: true,
        counter: 0,
        key,
        update: (entity, entities, timeline, args) => {
          const percentage = loop ? timeline.counter % 1 : clamp(timeline.counter, 0, 1);
          const column = Math.trunc(remap(percentage, 0, 1, startColumn, endColumn));
          const row = Math.trunc(remap(percentage, 0, 1, startRow, endRow));

          texture.offset.set(column / columns, row / rows);
          timeline.counter += increment;

          if (update) update(entity, entities, { column, row }, args);
        }
      };
    };
  });

  return {
    model: sprite,
    actions,
    timelines
  };
};
