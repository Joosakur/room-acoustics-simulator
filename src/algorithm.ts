import {ANGLE_INCREMENT_DEG, MAX_FREQUENCY, MAX_WAVE_ORDINAL, MIN_FREQUENCY, SPEED_OF_SOUND} from "./constants"
import {range} from "lodash"

export interface Geometry {
  room: {
    width: number,
    depth: number,
    height: number,
  }
  position: {
    left: number,
    front: number,
    floor: number
  }
}

type NumberMap = {[key: string]: number}

export interface PlaneDistances extends NumberMap {
  left: number
  right: number
  front: number
  back: number
  below: number
  above: number
}

export interface AlgorithmInput {
  geometry: Geometry
}

export interface FrequencyAmplitude {
  frequency: number
  amplitude: number
}

export interface StandingWave extends FrequencyAmplitude {
  weight: number
}

function inclusiveRange(start: number, end: number, step: number) {
  return [...range(start, end, step), end]
}

const sineMap: Record<number, number> = inclusiveRange(0, 90, ANGLE_INCREMENT_DEG).reduce((acc, angle) => ({
  ...acc,
  [angle]: Math.sin(angle * 2 * Math.PI / 360)
}), {})

/**
 * Fetch precalculated absolute value of sine
 *
 * @param angleDeg angle in degrees, must be divisible by ANGLE_INCREMENT_DEG
 */
export function absSin(angleDeg: number): number {
  if(angleDeg % ANGLE_INCREMENT_DEG !== 0) {
    console.warn(`${angleDeg} not divisible by ${ANGLE_INCREMENT_DEG}, cannot use cache`)
    return Math.abs(Math.sin(angleDeg * 2 * Math.PI / 360))
  }
  let angle = angleDeg
  while (angle < 0) {
    angle += 360
  }
  while (angle > 180) {
    angle -= 180
  }
  const absSin = angle <= 90
    ? sineMap[angle]
    : sineMap[180 - angle]

  if(absSin === undefined)
    throw Error()

  return absSin
}

/**
 * Fetch precalculated absolute value of cosine
 *
 * @param angleDeg angle in degrees, must be divisible by ANGLE_INCREMENT_DEG
 */
export function absCos(angleDeg: number): number {
  return absSin(90 - angleDeg)
}

/**
 * Get absolute distances to different planes in the direction of polar angles [alpha, beta] and its opposite
 * Note: May be infinite when plane is parallel to the direction
 */
export function getPlaneDistancesInDirection(
  { room, position }: Geometry,
  alpha: number,
  beta: number
): PlaneDistances {
  return {
    left: position.left / absCos(alpha) / absCos(beta),
    right: (room.width - position.left) / absCos(alpha) / absCos(beta),
    front: position.front / absSin(alpha) / absCos(beta),
    back: (room.depth - position.front) / absSin(alpha) / absCos(beta),
    below: position.floor / absSin(beta),
    above: (room.height - position.floor) / absSin(beta)
  }
}

function getStandingWavesForDirection(
  geometry: Geometry,
  alpha: number,
  beta: number
): StandingWave[] {
  // the two smallest distances define where the wave collides to a surface in the two opposite directions
  const distances = Object.values(getPlaneDistancesInDirection(geometry, alpha, beta))
  const smallestTwo = distances.sort().slice(0, 2)
  const [d1, d2] = smallestTwo
  const wallToWall = d1 + d2

  const standingWaves: StandingWave[] = []
  for (let n = 1; n <= MAX_WAVE_ORDINAL; n++) {
    // how many full waves fit between the surfaces
    const numOfWaves = n / 2

    const waveLength = wallToWall / numOfWaves
    const frequency = SPEED_OF_SOUND / waveLength

    if (frequency < MIN_FREQUENCY) continue
    if (frequency > MAX_FREQUENCY) break

    // in which phase of the standing wave is the listener
    const phase = 2 * Math.PI * d1 / waveLength
    const amplitude = Math.abs(Math.sin(phase))

    let weight = 1

    // heuristically weight decreases when distance increases as sound diffuses
    // e.g. an infinitely long corridor should not have standing waves in the parallel direction
    weight /= Math.max(1, wallToWall)

    // heuristically weight decreases when angle of attack increases
    // i.e. strongest when bouncing directly between parallel walls
    // absCos(2x) is 1.0 at 0, 90, 180, ... degrees and 0.0 at 45, 135, ... degrees
    // squaring it makes the peaks narrower
    // adding 0.1 retains some weight even in 45 degree
    weight = weight
      * (0.1 + absCos(2 * alpha) * absCos(2 * alpha))
      * (0.1 + absCos(2 * beta) * absCos(2 * beta))

    standingWaves.push({
      frequency,
      amplitude,
      weight
    })
  }

  return standingWaves
}

export function getStandingWaves(
  input: AlgorithmInput
): StandingWave[] {
  const waves: StandingWave[] = []
  inclusiveRange(-90, 90, ANGLE_INCREMENT_DEG).forEach(alpha => {
    inclusiveRange(-90, 90, ANGLE_INCREMENT_DEG).forEach(beta => {
      waves.push(
        ...getStandingWavesForDirection(input.geometry, alpha, beta)
      )
    })
  })
  return waves
}
