import { randRange, type SpawnConfig } from './ParticleField';
import type { TimeOfDay } from '../timeOfDay';

export type RoomKey = 'kitchen' | 'carpentry' | 'blacksmith';

/** Ambient mood particles drifting across the whole scene, tuned per phase. */
export function ambientConfig(phase: TimeOfDay): SpawnConfig {
  switch (phase) {
    case 'morning':
      // Warm golden glints rising softly.
      return {
        spawnPerSecond: 6,
        maxParticles: 70,
        init: (s, { bounds }) => {
          s.p.x = randRange(bounds.x, bounds.x + bounds.w);
          s.p.y = randRange(bounds.y, bounds.y + bounds.h);
          s.p.tint = 0xffe6b0;
          s.vx = randRange(-6, 6);
          s.vy = randRange(-14, -4);
          s.maxLife = randRange(6, 11);
          s.baseScale = randRange(0.08, 0.22);
          s.baseAlpha = randRange(0.35, 0.7);
          s.wobbleAmp = randRange(4, 12);
          s.wobbleFreq = randRange(0.4, 1.1);
        },
      };
    case 'day':
      // Bright pollen drifting laterally.
      return {
        spawnPerSecond: 7,
        maxParticles: 80,
        init: (s, { bounds }) => {
          s.p.x = randRange(bounds.x, bounds.x + bounds.w);
          s.p.y = randRange(bounds.y, bounds.y + bounds.h);
          s.p.tint = 0xfff4d6;
          s.vx = randRange(-18, 18);
          s.vy = randRange(-6, 6);
          s.maxLife = randRange(7, 12);
          s.baseScale = randRange(0.06, 0.16);
          s.baseAlpha = randRange(0.3, 0.6);
          s.wobbleAmp = randRange(6, 16);
          s.wobbleFreq = randRange(0.3, 0.9);
        },
      };
    case 'evening':
      // Falling, slowly spinning leaves.
      return {
        spawnPerSecond: 5,
        maxParticles: 60,
        init: (s, { bounds }) => {
          s.p.x = randRange(bounds.x, bounds.x + bounds.w);
          s.p.y = bounds.y - randRange(0, bounds.h * 0.2);
          s.p.tint = 0xffb172;
          s.vx = randRange(-12, 12);
          s.vy = randRange(10, 26);
          s.spin = randRange(-1.4, 1.4);
          s.maxLife = randRange(7, 12);
          s.baseScale = randRange(0.12, 0.26);
          s.baseAlpha = randRange(0.4, 0.75);
          s.wobbleAmp = randRange(10, 22);
          s.wobbleFreq = randRange(0.5, 1.2);
        },
      };
    case 'night':
    default:
      // Wandering, pulsing fireflies.
      return {
        spawnPerSecond: 4,
        maxParticles: 50,
        init: (s, { bounds }) => {
          s.p.x = randRange(bounds.x, bounds.x + bounds.w);
          s.p.y = randRange(bounds.y, bounds.y + bounds.h);
          s.p.tint = 0xc8ff9a;
          s.vx = randRange(-10, 10);
          s.vy = randRange(-8, 8);
          s.maxLife = randRange(5, 10);
          s.baseScale = randRange(0.08, 0.18);
          s.baseAlpha = randRange(0.5, 0.9);
          s.wobbleAmp = randRange(14, 30);
          s.wobbleFreq = randRange(0.8, 1.8);
          s.pulse = randRange(3, 6);
        },
      };
  }
}

/** Faint settling dust shown in a room while it is idle or switched off. */
export function roomDustConfig(): SpawnConfig {
  return {
    spawnPerSecond: 3,
    maxParticles: 18,
    init: (s, { bounds }) => {
      s.p.x = randRange(bounds.x, bounds.x + bounds.w);
      s.p.y = randRange(bounds.y, bounds.y + bounds.h);
      s.p.tint = 0xcfc4a8;
      s.vx = randRange(-4, 4);
      s.vy = randRange(4, 12);
      s.maxLife = randRange(4, 8);
      s.baseScale = randRange(0.04, 0.1);
      s.baseAlpha = randRange(0.12, 0.3);
      s.wobbleAmp = randRange(3, 8);
      s.wobbleFreq = randRange(0.4, 1);
    },
  };
}

/** Active work effect tuned per profession while a room is busy crafting. */
export function roomWorkConfig(room: RoomKey): SpawnConfig {
  switch (room) {
    case 'kitchen':
      // Rising steam that swells as it climbs.
      return {
        spawnPerSecond: 10,
        maxParticles: 40,
        init: (s, { bounds }) => {
          s.p.x = randRange(bounds.x + bounds.w * 0.3, bounds.x + bounds.w * 0.7);
          s.p.y = bounds.y + bounds.h * randRange(0.55, 0.8);
          s.p.tint = 0xffffff;
          s.vx = randRange(-5, 5);
          s.vy = randRange(-26, -14);
          s.maxLife = randRange(1.8, 3);
          s.baseScale = randRange(0.1, 0.18);
          s.grow = randRange(0.06, 0.12);
          s.baseAlpha = randRange(0.2, 0.4);
          s.wobbleAmp = randRange(6, 14);
          s.wobbleFreq = randRange(0.8, 1.6);
        },
      };
    case 'blacksmith':
      // Hot sparks flung up then pulled down, flickering.
      return {
        spawnPerSecond: 18,
        maxParticles: 50,
        init: (s, { bounds }) => {
          s.p.x = randRange(bounds.x + bounds.w * 0.35, bounds.x + bounds.w * 0.65);
          s.p.y = bounds.y + bounds.h * randRange(0.5, 0.65);
          s.p.tint = Math.random() < 0.5 ? 0xffd24a : 0xff7a1a;
          s.vx = randRange(-40, 40);
          s.vy = randRange(-60, -20);
          s.ay = 120;
          s.maxLife = randRange(0.5, 1.1);
          s.baseScale = randRange(0.03, 0.08);
          s.baseAlpha = randRange(0.6, 1);
          s.pulse = randRange(8, 16);
        },
      };
    case 'carpentry':
    default:
      // Sawdust spraying out and settling, slowly spinning.
      return {
        spawnPerSecond: 14,
        maxParticles: 45,
        init: (s, { bounds }) => {
          s.p.x = randRange(bounds.x + bounds.w * 0.35, bounds.x + bounds.w * 0.65);
          s.p.y = bounds.y + bounds.h * randRange(0.5, 0.7);
          s.p.tint = 0xd8b271;
          s.vx = randRange(-30, 30);
          s.vy = randRange(-20, 4);
          s.ay = 40;
          s.spin = randRange(-2, 2);
          s.maxLife = randRange(0.8, 1.6);
          s.baseScale = randRange(0.03, 0.07);
          s.baseAlpha = randRange(0.4, 0.75);
        },
      };
  }
}
