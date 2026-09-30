// OutRun course: a looping road plus one visual theme per LevelManager phase.
import { Road } from './road.js';

// Themes are indexed by phase id (see src/levelManager.js)
export const THEMES = {
  1: { // Country Roads -> sunny coast with palm trees
    name: 'COCONUT COAST',
    sky: [0x2a7fff, 0x4f9dff, 0x78b8ff, 0xa8d4ff, 0xd8ecff],
    sun: 0xfff6c0,
    far: 0x6f8fcf, near: 0x2f8f4f,
    grass: [0x10a040, 0x0c9038], rumble: [0xffffff, 0xe02020],
    road: [0x6b6b6b, 0x646464], lane: 0xffffff,
    scenery: ['palm', 'palm', 'sign']
  },
  2: { // Mountain Pass -> late afternoon, rocky mountains
    name: 'MOUNTAIN PASS',
    sky: [0x3a2a6a, 0x6a3a7a, 0xb0508a, 0xf07a6a, 0xffb070],
    sun: 0xffd070,
    far: 0x4a3a6a, near: 0x5a4a4a,
    grass: [0x3a7a2a, 0x347026], rumble: [0xffffff, 0x303030],
    road: [0x5a5550, 0x54504b], lane: 0xffffff,
    scenery: ['rock', 'pine', 'rock']
  },
  3: { // Desert Highway -> hot sand, cactus and mesas
    name: 'DESERT HIGHWAY',
    sky: [0x1a6ad0, 0x3a8ae0, 0x70b0e8, 0xb0d8f0, 0xffe8b0],
    sun: 0xffffff,
    far: 0xc06a3a, near: 0xd89a5a,
    grass: [0xe8c070, 0xe0b664], rumble: [0xffffff, 0xd06020],
    road: [0x8a7a6a, 0x827364], lane: 0xfff0c0,
    scenery: ['cactus', 'rock', 'cactus']
  },
  4: { // Night City Sprint -> neon skyline
    name: 'NIGHT CITY',
    sky: [0x05020f, 0x120530, 0x2a0a50, 0x5a1070, 0xb02a8a],
    sun: 0xff3d9a,
    far: 0x1a0a3a, near: 0x0a0520,
    grass: [0x10102a, 0x0c0c22], rumble: [0x00e5ff, 0xff2d95],
    road: [0x1c1c2c, 0x181826], lane: 0x00e5ff,
    scenery: ['building', 'lamp', 'building']
  }
};

export function getTheme(phaseId){
  return THEMES[phaseId] || THEMES[1];
}

// Build the looping course. Sprites are "slots" (side offset + kind index);
// the renderer picks the actual texture from the current theme's scenery list.
export function buildTrack(){
  const road = new Road();
  road.addStraight(25);
  road.addCurve(30, 3);
  road.addHill(25, 30);
  road.addCurve(40, -4, 20);
  road.addStraight(20);
  road.addCurve(30, 6, -30);
  road.addHill(30, 40);
  road.addCurve(25, -3);
  road.addCurve(25, 5, -20);
  road.addStraight(30);
  road.addCurve(35, -6, 30);
  road.addHill(20, -25);
  road.addCurve(30, 4);
  road.addDownhillToEnd(60);

  // roadside scenery every few segments, alternating sides with some variation
  for(let i = 10, k = 0; i < road.segments.length; i += 6, k++){
    const side = k % 2 === 0 ? -1 : 1;
    const kind = (k * 7) % 3;
    const offset = side * (1.4 + ((k * 13) % 10) / 10); // beyond the rumble strip
    road.segments[i].sprites.push({ kind, offset });
  }
  return road;
}
