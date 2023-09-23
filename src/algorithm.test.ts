import {absCos, absSin, Geometry, getPlaneDistancesInDirection, getStandingWaves, PlaneDistances} from "./algorithm"

function assertEqualEnough(expected: number, actual: number, diff = 0.01) {
  if(Number.isFinite(expected)) {
    expect(Math.abs(expected - actual) < diff).toBeTruthy()
  } else {
    expect(!Number.isFinite(actual) && Math.sign(actual) === Math.sign(expected)).toBeTruthy()
  }
}

function rounded(num: number): number {
  return Math.round(1000 * num) / 1000
}

function roundedDistances(distances: PlaneDistances): PlaneDistances {
  return {
    left: rounded(distances.left),
    right: rounded(distances.right),
    front: rounded(distances.front),
    back: rounded(distances.back),
    below: rounded(distances.below),
    above: rounded(distances.above),
  }
}

describe('algorithm and math utils', () => {
  describe('absSin', () => {
    test('returns absolute value of sine', () => {
      assertEqualEnough(absSin(0), 0)
      assertEqualEnough(absSin(90), 1)
      assertEqualEnough(absSin(180), 0)
      assertEqualEnough(absSin(-90), 1)
      assertEqualEnough(absSin(30), 0.5)
      assertEqualEnough(absSin(60), 0.866)
      assertEqualEnough(absSin(150), 0.5)
      assertEqualEnough(absSin(210), 0.5)
      assertEqualEnough(absSin(-30), 0.5)
    })
  })

  describe('absCos', () => {
    test('returns absolute value of cosine', () => {
      assertEqualEnough(absCos(0), 1)
      assertEqualEnough(absCos(90), 0)
      assertEqualEnough(absCos(180), 1)
      assertEqualEnough(absCos(-90), 0)
      assertEqualEnough(absCos(30), 0.866)
      assertEqualEnough(absCos(60), 0.5)
      assertEqualEnough(absCos(150), 0.866)
      assertEqualEnough(absCos(210), 0.866)
      assertEqualEnough(absCos(-30), 0.866)
    })
  })

  describe('getPlaneDistancesInDirection', () => {
    test('simple cases', () => {
      const geometry: Geometry = {
        room: {
          width: 5,
          depth: 10,
          height: 4,
        },
        position: {
          left: 2,
          front: 3,
          floor: 1
        }
      }

      // directly to right
      expect(getPlaneDistancesInDirection(geometry, 0, 0)).toEqual<PlaneDistances>({
        left: 2,
        right: 3,
        front: Infinity,
        back: Infinity,
        below: Infinity,
        above: Infinity
      })

      // directly forward
      expect(getPlaneDistancesInDirection(geometry, 90, 0)).toEqual<PlaneDistances>({
        left: Infinity,
        right: Infinity,
        front: 3,
        back: 7,
        below: Infinity,
        above: Infinity
      })

      // directly upward (note: alpha is irrelevant)
      expect(getPlaneDistancesInDirection(geometry, 40, 90)).toEqual<PlaneDistances>({
        left: Infinity,
        right: Infinity,
        front: Infinity,
        back: Infinity,
        below: 1,
        above: 3
      })

      // directly backward
      expect(getPlaneDistancesInDirection(geometry, -90, 0)).toEqual<PlaneDistances>({
        left: Infinity,
        right: Infinity,
        front: 3,
        back: 7,
        below: Infinity,
        above: Infinity
      })

      // directly downward (note: alpha is irrelevant)
      expect(getPlaneDistancesInDirection(geometry, 75, -90)).toEqual<PlaneDistances>({
        left: Infinity,
        right: Infinity,
        front: Infinity,
        back: Infinity,
        below: 1,
        above: 3
      })

      // between right and forward
      expect(roundedDistances(getPlaneDistancesInDirection(geometry, 45, 0))).toEqual<PlaneDistances>({
        left: rounded(Math.sqrt(2) * 2),
        right: rounded(Math.sqrt(2) * 3),
        front: rounded(Math.sqrt(2) * 3),
        back: rounded(Math.sqrt(2) * 7),
        below: Infinity,
        above: Infinity
      })
    })

    test('center of a cube towards a corner', () => {
      const geometry: Geometry = {
        room: {
          width: 10,
          depth: 10,
          height: 10,
        },
        position: {
          left: 5,
          front: 5,
          floor: 5
        }
      }

      // note: beta is NOT 45 degrees when pointing from center to corner
      const beta = Math.atan(1 / Math.sqrt(2)) * 360 / (2 * Math.PI)

      const expectedDistanceToCorner = rounded(Math.sqrt(5 * 5 + 5 * 5 + 5 * 5))
      const expected: PlaneDistances = {
        left: expectedDistanceToCorner,
        right: expectedDistanceToCorner,
        front: expectedDistanceToCorner,
        back: expectedDistanceToCorner,
        below: expectedDistanceToCorner,
        above: expectedDistanceToCorner
      }

      expect(roundedDistances(getPlaneDistancesInDirection(geometry, 45, beta))).toEqual<PlaneDistances>(expected)
      expect(roundedDistances(getPlaneDistancesInDirection(geometry, 45, -beta))).toEqual<PlaneDistances>(expected)
      expect(roundedDistances(getPlaneDistancesInDirection(geometry, -45, beta))).toEqual<PlaneDistances>(expected)
      expect(roundedDistances(getPlaneDistancesInDirection(geometry, -45, -beta))).toEqual<PlaneDistances>(expected)
    })
  })

  describe('getStandingWaves', () => {
    test('results are symmetrical relative to center of room', () => {
      const room = {
        width: 6,
        depth: 10,
        height: 4,
      }
      const geometry1: Geometry = {
        room,
        position: {
          left: room.width / 2 - 1,
          front: room.depth / 2 - 1,
          floor: room.height / 2 - 1
        }
      }
      const geometry2: Geometry = {
        room,
        position: {
          left: room.width / 2 + 1,
          front: room.depth / 2 + 1,
          floor: room.height / 2 + 1
        }
      }
      expect(getStandingWaves({geometry: geometry1})).toEqual(getStandingWaves({geometry: geometry2}))
    })
  })
})
