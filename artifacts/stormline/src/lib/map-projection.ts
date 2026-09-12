export type MapPosition = {
  x: number;
  y: number;
};

/**
 * Plate Carrée projection for the equirectangular basemap. Both axes span the
 * complete geographic extent: longitude -180..180 and latitude 90..-90.
 */
export function projectEquirectangular(
  latitude: number,
  longitude: number,
): MapPosition {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new RangeError("Coordinates are outside the geographic extent");
  }

  return {
    x: ((longitude + 180) / 360) * 100,
    y: ((90 - latitude) / 180) * 100,
  };
}