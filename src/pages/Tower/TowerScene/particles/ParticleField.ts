import { Container, Particle, ParticleContainer, type Texture } from 'pixi.js';

export interface Bounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Sim {
  p: Particle;
  vx: number;
  vy: number;
  ay: number;
  spin: number;
  life: number;
  maxLife: number;
  t: number;
  baseScale: number;
  grow: number;
  baseAlpha: number;
  wobbleAmp: number;
  wobbleFreq: number;
  pulse: number;
}

export interface SpawnContext {
  bounds: Bounds;
  texture: Texture;
}

export interface SpawnConfig {
  spawnPerSecond: number;
  maxParticles: number;
  /** Populate a fresh Sim. Set p.x/p.y/tint/scale and the motion fields. */
  init: (sim: Sim, ctx: SpawnContext) => void;
}

export function randRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Fades in over the first 15% of life, holds, fades out over the last 35%. */
function envelope(life: number, maxLife: number): number {
  const t = 1 - life / maxLife;
  if (t < 0.15) return t / 0.15;
  if (t > 0.65) return Math.max(0, (1 - t) / 0.35);
  return 1;
}

export type { Sim };

export class ParticleField {
  readonly container: ParticleContainer;
  bounds: Bounds = { x: 0, y: 0, w: 0, h: 0 };

  private texture: Texture;
  private config: SpawnConfig;
  private sims: Sim[] = [];
  private accumulator = 0;

  constructor(texture: Texture, config: SpawnConfig) {
    this.texture = texture;
    this.config = config;
    this.container = new ParticleContainer({
      dynamicProperties: { position: true, rotation: true, vertex: true, color: true },
    });
  }

  /** Swap behavior without clearing existing particles — they finish their lives. */
  setConfig(config: SpawnConfig): void {
    this.config = config;
  }

  addTo(parent: Container, zIndex: number): void {
    this.container.zIndex = zIndex;
    parent.addChild(this.container);
  }

  private spawn(): void {
    if (this.sims.length >= this.config.maxParticles) return;
    if (this.bounds.w <= 0 || this.bounds.h <= 0) return;

    const p = new Particle({ texture: this.texture, anchorX: 0.5, anchorY: 0.5 });
    const sim: Sim = {
      p,
      vx: 0,
      vy: 0,
      ay: 0,
      spin: 0,
      life: 1,
      maxLife: 1,
      t: 0,
      baseScale: 1,
      grow: 0,
      baseAlpha: 1,
      wobbleAmp: 0,
      wobbleFreq: 0,
      pulse: 0,
    };
    this.config.init(sim, { bounds: this.bounds, texture: this.texture });
    sim.life = sim.maxLife;
    p.scaleX = p.scaleY = sim.baseScale;
    this.sims.push(sim);
    this.container.addParticle(p);
  }

  update(dt: number): void {
    this.accumulator += dt * this.config.spawnPerSecond;
    while (this.accumulator >= 1) {
      this.accumulator -= 1;
      this.spawn();
    }

    for (let i = this.sims.length - 1; i >= 0; i--) {
      const s = this.sims[i];
      s.t += dt;
      s.life -= dt;
      if (s.life <= 0) {
        this.container.removeParticle(s.p);
        this.sims.splice(i, 1);
        continue;
      }
      s.vy += s.ay * dt;
      const drift = s.vx + Math.sin(s.t * s.wobbleFreq) * s.wobbleAmp;
      s.p.x += drift * dt;
      s.p.y += s.vy * dt;
      s.p.rotation += s.spin * dt;

      const scale = s.baseScale + s.grow * (s.maxLife - s.life);
      s.p.scaleX = s.p.scaleY = scale;

      let alpha = envelope(s.life, s.maxLife) * s.baseAlpha;
      if (s.pulse > 0) {
        alpha *= 0.55 + 0.45 * Math.sin(s.t * s.pulse);
      }
      s.p.alpha = alpha;
    }
  }

  destroy(): void {
    this.container.destroy();
    this.sims = [];
  }
}
