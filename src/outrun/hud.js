// OutRun-style HUD drawn with the "Press Start 2P" pixel font.
import { Container, Graphics, Sprite, Text } from 'pixi.js';
import { WIDTH, HEIGHT } from './OutRunRenderer.js';

export const FONT = '"Press Start 2P", monospace';

// text with a 1px drop shadow so it reads over any background
export class Label extends Container {
  constructor(text, { size = 8, color = 0xffffff, anchorX = 0, anchorY = 0 } = {}){
    super();
    const style = { fontFamily: FONT, fontSize: size, fill: color };
    this.shadow = new Text({ text, style: { ...style, fill: 0x000000 }, textureStyle: { scaleMode: 'nearest' } });
    this.main = new Text({ text, style, textureStyle: { scaleMode: 'nearest' } });
    for(const t of [this.shadow, this.main]){
      t.anchor.set(anchorX, anchorY);
      t.resolution = 1;
    }
    this.shadow.position.set(1, 1);
    this.addChild(this.shadow, this.main);
    this.color = color;
  }

  // only touch the Text objects when something changed (each change re-renders a texture)
  set(text, color){
    if(this.main.text !== text){ this.main.text = text; this.shadow.text = text; }
    if(color !== undefined && color !== this.color){ this.color = color; this.main.style.fill = color; }
    return this;
  }
}

export function label(parent, text, x, y, opts){
  const l = new Label(text, opts);
  l.position.set(x, y);
  parent.addChild(l);
  return l;
}

export class Hud {
  constructor(stage){
    this.root = new Container();
    stage.addChild(this.root);
    const r = this.root;

    label(r, 'SCORE', 8, 4, { color: 0xff5ab4 });
    this.score = label(r, '0', 8, 14);
    label(r, 'TIME', WIDTH / 2, 4, { color: 0xffe040, anchorX: 0.5 });
    this.time = label(r, '20', WIDTH / 2, 14, { size: 16, anchorX: 0.5 });
    label(r, 'STAGE', WIDTH - 8, 4, { color: 0x60e0ff, anchorX: 1 });
    this.stage = label(r, '1', WIDTH - 8, 14, { anchorX: 1 });
    this.lives = [];
    this.powerUp = label(r, '', WIDTH / 2, 34, { anchorX: 0.5 });

    this.tacho = new Graphics();
    this.tacho.position.set(8, HEIGHT - 26);
    r.addChild(this.tacho);
    this.speed = label(r, '0km/h', 8, HEIGHT - 16);
    this.gear = label(r, 'LO', 76, HEIGHT - 26, { color: 0xffe040 });
    this.audio = label(r, '', WIDTH - 8, HEIGHT - 12, { anchorX: 1 });

    this.bannerTitle = label(r, '', WIDTH / 2, 62, { size: 16, color: 0xffe040, anchorX: 0.5 });
    this.bannerSub = label(r, '', WIDTH / 2, 84, { color: 0xffffff, anchorX: 0.5 });
    this.bannerTimer = 0;

    this.flash = new Graphics().rect(0, 0, WIDTH, HEIGHT).fill(0xffffff);
    this.flash.alpha = 0;
    r.addChild(this.flash);
  }

  setLifeTexture(texture){
    this.lives.forEach(s => s.destroy());
    this.lives = [0, 1, 2].map(i => {
      const s = new Sprite(texture);
      s.scale.set(0.25);
      s.anchor.set(1, 0);
      s.position.set(WIDTH - 8 - i * 18, 26);
      this.root.addChild(s);
      return s;
    });
  }

  banner(title, sub, seconds = 2){
    this.bannerTitle.set(title);
    this.bannerSub.set(sub);
    this.bannerTimer = seconds;
  }

  update(world, dt, audioState, time){
    const lm = world.levelManager;
    const phase = lm.getCurrentPhase();
    this.score.set(String(Math.floor(world.score)));
    const remaining = Math.max(0, Math.ceil(phase.duration - lm.elapsedInPhase));
    const infinite = phase.duration > 9999;
    this.time.set(infinite ? '--' : String(remaining), !infinite && remaining <= 5 ? 0xff4040 : 0xffffff);
    this.stage.set(String(phase.id));
    this.lives.forEach((s, i) => { s.visible = i < world.lives; });

    if(world.powerUpType){
      const secs = Math.ceil(world.powerUpTimer);
      this.powerUp.set(world.powerUpType === 'invuln' ? `SHIELD ${secs}` : `BOOST x2 ${secs}`,
        world.powerUpType === 'invuln' ? 0x60a0ff : 0xffa030);
    } else {
      this.powerUp.set('');
    }

    // tachometer: 12 blocks, green -> yellow -> red
    const ratio = Math.min(1, world.kmh / 290);
    this.tacho.clear();
    for(let i = 0; i < 12; i++){
      const color = i < 7 ? 0x30e060 : i < 10 ? 0xffe040 : 0xff4040;
      this.tacho.rect(i * 5, 0, 4, 6).fill(i < Math.round(ratio * 12) ? color : 0x303030);
    }
    this.speed.set(`${world.kmh}km/h`);
    this.gear.set(world.kmh < 120 ? 'LO' : 'HI');

    const on = (flag, name) => (flag ? name : name.toLowerCase());
    this.audio.set(audioState ? `${on(audioState.sfx, 'M')} ${on(audioState.engine, 'E')} ${on(audioState.music, 'R')}` : '', 0xc0c0c0);

    // banner blinks while visible
    this.bannerTimer = Math.max(0, this.bannerTimer - dt);
    const showBanner = this.bannerTimer > 0 && Math.floor(time * 6) % 4 !== 0;
    this.bannerTitle.visible = showBanner;
    this.bannerSub.visible = this.bannerTimer > 0;

    this.flash.alpha = Math.max(0, this.flash.alpha - dt * 2);
  }

  hit(){ this.flash.alpha = 0.5; }
}
