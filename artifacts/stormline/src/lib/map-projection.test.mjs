import assert from "node:assert/strict";
import test from "node:test";
import { projectEquirectangular } from "./map-projection.ts";

test("projects geographic bounds to the full equirectangular canvas", () => {
  assert.deepEqual(projectEquirectangular(90, -180), { x: 0, y: 0 });
  assert.deepEqual(projectEquirectangular(0, 0), { x: 50, y: 50 });
  assert.deepEqual(projectEquirectangular(-90, 180), { x: 100, y: 100 });
});

test("projects known landmarks consistently across hemispheres", () => {
  const london = projectEquirectangular(51.5074, -0.1278);
  const singapore = projectEquirectangular(1.3521, 103.8198);
  const sydney = projectEquirectangular(-33.8688, 151.2093);

  assert.ok(london.x > 49 && london.x < 51);
  assert.ok(london.y > 21 && london.y < 22);
  assert.ok(singapore.x > 78 && singapore.x < 79);
  assert.ok(singapore.y > 49 && singapore.y < 50);
  assert.ok(sydney.x > 91 && sydney.x < 93);
  assert.ok(sydney.y > 68 && sydney.y < 70);
});

test("rejects coordinates outside the map extent", () => {
  assert.throws(() => projectEquirectangular(91, 0), RangeError);
  assert.throws(() => projectEquirectangular(0, 181), RangeError);
});