// Menu screens for the OutRun mode: car color, radio (music) select and game over ranking.
import { Container, Graphics, Sprite } from 'pixi.js';
import { WIDTH, HEIGHT } from './OutRunRenderer.js';
import { label } from './hud.js';
import { makePlayerCar } from './sprites.js';
import { loadRanking, saveScore as saveRankingScore } from '../ranking.js';

export const COLORS = ['blue', 'purple', 'red', 'white', 'green'];
const RANKING_KEY = 'enduro_outrun_ranking';

export const PAUSE_OPTIONS = ['CONTINUE', 'RESTART', 'ABOUT', 'MENU'];
export const GAME_OVER_OPTIONS = ['RETRY', 'CAR'];

// button rectangles (also used for touch hit-testing): game over side by side, pause stacked
export function menuBounds(options){
  if(options === GAME_OVER_OPTIONS){
    return options.map((_, i) => ({ x: (i === 0 ? WIDTH / 4 + 10 : WIDTH * 3 / 4 - 10) - 60, y: 164, w: 120, h: 22 }));
  }
  return options.map((_, i) => ({ x: WIDTH / 2 - 60, y: 96 + i * 28, w: 120, h: 22 }));
}

// store the score in the local top 5; returns its rank (0-based) or -1
export function saveScore(score, stage){
  return saveRankingScore(RANKING_KEY, score, stage);
}

export class Screens {
  constructor(stage){
    this.root = new Container();
    stage.addChild(this.root);
    this.cars = COLORS.map(c => makePlayerCar(c)['0']);
  }

  clear(){
    this.root.removeChildren().forEach(c => c.destroy({ children: true }));
  }

  panel(y, h, alpha = 0.7){
    const g = new Graphics().rect(0, y, WIDTH, h).fill({ color: 0x000000, alpha });
    this.root.addChild(g);
    return g;
  }

  showColor(index, time){
    this.clear();
    this.panel(40, 130);
    label(this.root, 'CHOOSE YOUR CAR', WIDTH / 2, 52, { color: 0xffe040, anchorX: 0.5 });
    const slot = 60, startX = WIDTH / 2 - slot * 2;
    this.cars.forEach((tex, i) => {
      const s = new Sprite(tex);
      s.anchor.set(0.5);
      const selected = i === index;
      s.scale.set(selected ? 0.9 : 0.7);
      s.position.set(startX + i * slot, 100 - (selected && Math.floor(time * 4) % 2 ? 1 : 0));
      s.alpha = selected ? 1 : 0.6;
      this.root.addChild(s);
    });
    const box = new Graphics().rect(startX + index * slot - 30, 80, 60, 40).stroke({ color: 0xff5ab4, width: 2 });
    this.root.addChild(box);
    label(this.root, COLORS[index].toUpperCase(), WIDTH / 2, 132, { anchorX: 0.5 });
    label(this.root, '< >  ENTER', WIDTH / 2, 152, { color: 0xc0c0c0, anchorX: 0.5 });
  }

  // radio faceplate: the dial sweeps 88.1-107.9 FM across the stations; shows name, genre and a dot per station
  showRadio(tracks, index, time){
    this.clear();
    this.panel(40, 140);
    label(this.root, 'SELECT MUSIC', WIDTH / 2, 50, { color: 0xffe040, anchorX: 0.5 });
    const last = Math.max(1, tracks.length - 1);
    const radio = new Graphics()
      .roundRect(40, 66, 240, 40, 4).fill(0x2a2a2a).stroke({ color: 0x888888, width: 2 })
      .rect(50, 74, 220, 12).fill(0x0a1a10);
    for(let i = 0; i <= 20; i++) radio.rect(52 + i * 10.8, 80 + (i % 5 ? 3 : 0), 1, i % 5 ? 3 : 6).fill(0x40ff80);
    radio.rect(54 + index * (212 / last), 72, 2, 16).fill(0xff3030);
    this.root.addChild(radio);
    label(this.root, `FM ${(88.1 + index * (19.8 / last)).toFixed(1)}`, WIDTH / 2, 92, { color: 0x40ff80, anchorX: 0.5 });

    const blink = Math.floor(time * 3) % 2 === 0;
    const track = tracks[index];
    label(this.root, `< ${track.name} >`, WIDTH / 2, 116, { color: blink ? 0xffffff : 0xff5ab4, anchorX: 0.5 });
    label(this.root, track.genre, WIDTH / 2, 130, { color: 0x60e0ff, anchorX: 0.5 });
    const dots = new Graphics();
    const dotsX = WIDTH / 2 - (tracks.length * 10) / 2;
    tracks.forEach((_, i) => dots.rect(dotsX + i * 10 + 2, 146, 6, 6).fill(i === index ? 0xff5ab4 : 0x555566));
    this.root.addChild(dots);
    label(this.root, '< >  ENTER TO RACE', WIDTH / 2, 164, { color: 0xc0c0c0, anchorX: 0.5 });
  }

  // selected option is lit, the others are dimmed grey
  menu(options, index){
    menuBounds(options).forEach((b, i) => {
      const selected = i === index;
      this.root.addChild(new Graphics().rect(b.x, b.y, b.w, b.h)
        .fill(selected ? 0xff5ab4 : 0x000000)
        .stroke({ color: selected ? 0xfff3a0 : 0x555566, width: 2 }));
      label(this.root, (selected ? '> ' : '') + options[i], b.x + b.w / 2, b.y + 7, { color: selected ? 0x1a0033 : 0x808080, anchorX: 0.5 });
    });
  }

  showGameOver(score, rank, index){
    this.clear();
    this.panel(30, 170, 0.75);
    label(this.root, 'GAME OVER', WIDTH / 2, 40, { size: 16, color: 0xff4040, anchorX: 0.5 });
    label(this.root, `SCORE ${Math.floor(score)}`, WIDTH / 2, 64, { anchorX: 0.5 });
    label(this.root, 'BEST SCORES', WIDTH / 2, 84, { color: 0x60e0ff, anchorX: 0.5 });
    loadRanking(RANKING_KEY).forEach((r, i) => {
      const color = i === rank ? 0xffe040 : 0xffffff;
      label(this.root, `${i + 1}. ${String(r.score).padStart(6, ' ')}  ST${r.stage}`, WIDTH / 2, 98 + i * 12, { color, anchorX: 0.5 });
    });
    this.menu(GAME_OVER_OPTIONS, index);
    label(this.root, 'ESC MENU', WIDTH / 2, 192, { color: 0x909090, anchorX: 0.5 });
  }

  showPause(index){
    this.clear();
    this.panel(0, HEIGHT, 0.5);
    label(this.root, 'PAUSE', WIDTH / 2, 64, { size: 16, anchorX: 0.5 });
    this.menu(PAUSE_OPTIONS, index);
  }
}
