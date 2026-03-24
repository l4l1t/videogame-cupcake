export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.ctx.imageSmoothingEnabled = false;
  }

  draw(game) {
    const { ctx, canvas } = this;
    const W = canvas.width;
    const H = canvas.height;

    // --- CLEAR ---
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, W, H);

    // --- BACKGROUND LAYERS ---
    const theme = game.world.getTheme();
    const fallbackColors = [
      { strawberry: '#ffb3c6', castle: '#2d1b4e', candy: '#87ceeb', snow: '#c8e6f5' },
      { strawberry: '#ff6b8a', castle: '#4a2870', candy: '#ffa0c8', snow: '#a0c8e0' },
      { strawberry: '#cc3355', castle: '#6b3d9e', candy: '#ff69b4', snow: '#7ab0d0' },
    ];
    for (let i = 0; i < 3; i++) {
      const path = `assets/backgrounds/${theme}/layer_${i + 1}.png`;
      const img = game.world.backgroundLayers.get(path);
      const offset = game.world.parallax[i] % W;
      if (img) {
        ctx.drawImage(img, -offset, 0, W, H);
        if (offset > 0) ctx.drawImage(img, W - offset, 0, W, H);
      } else {
        ctx.fillStyle = fallbackColors[i][theme] ?? '#111133';
        ctx.fillRect(0, 0, W, H);
      }
    }

    // --- GROUND ---
    ctx.fillStyle = '#4a2d0a';
    ctx.fillRect(0, 600, W, 120);
    ctx.fillStyle = '#6b4010';
    ctx.fillRect(0, 600, W, 8);
    // Ground detail lines
    ctx.fillStyle = '#3a2008';
    for (let x = 0; x < W; x += 80) {
      ctx.fillRect(x, 608, 40, 3);
    }

    // --- OBSTACLES ---
    const obstacleColors = {
      strawberry: '#cc2244',
      castle: '#6655aa',
      candy: '#ff44aa',
      snow: '#88bbdd',
    };
    game.obstacles.pool.forEach((o) => {
      const col = obstacleColors[o.theme] ?? '#cc3333';
      ctx.fillStyle = col;
      ctx.fillRect(o.x, o.y, o.width, o.height);
      // Highlight top
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(o.x, o.y, o.width, 6);
      // Shadow side
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(o.x + o.width - 6, o.y, 6, o.height);
    });

    // --- COLLECTIBLES ---
    game.collectibles.items.forEach((item) => {
      if (item.type === 'coin') {
        // Coin body
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(item.x + 16, item.y + 16, 14, 0, Math.PI * 2);
        ctx.fill();
        // Coin shine
        ctx.fillStyle = '#fff5aa';
        ctx.beginPath();
        ctx.arc(item.x + 10, item.y + 10, 5, 0, Math.PI * 2);
        ctx.fill();
        // Coin inner ring
        ctx.strokeStyle = '#cc9900';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(item.x + 16, item.y + 16, 10, 0, Math.PI * 2);
        ctx.stroke();
      } else if (item.type === 'invincibility') {
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(item.x, item.y, item.width, item.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('★', item.x + 24, item.y + 34);
        ctx.textAlign = 'left';
      } else if (item.type === 'speed') {
        ctx.fillStyle = '#ff4422';
        ctx.fillRect(item.x, item.y, item.width, item.height);
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚡', item.x + 24, item.y + 34);
        ctx.textAlign = 'left';
      } else if (item.type === 'magnet') {
        ctx.fillStyle = '#2244ff';
        ctx.fillRect(item.x, item.y, item.width, item.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('M', item.x + 24, item.y + 34);
        ctx.textAlign = 'left';
      }
    });

    // --- PLAYER ---
    const inv = game.powerups.invincibility;
    const isFlashing = inv > 0 && Math.floor(Date.now() / 100) % 2 === 0;
    const px = game.player.position.x;
    const py = game.player.position.y;
    const pw = game.player.width;
    const ph = game.player.height;

    // Dash trail
    if (game.controls.state.dash) {
      for (let i = 1; i <= 5; i++) {
        ctx.globalAlpha = 0.12 * (6 - i);
        ctx.fillStyle = '#ff6b9d';
        ctx.fillRect(px - i * 20, py + 10, pw, ph - 20);
      }
      ctx.globalAlpha = 1;
    }

    // Player body
    ctx.fillStyle = isFlashing ? '#ffd700' : '#ff6b9d';
    ctx.fillRect(px, py, pw, ph);

    // Player highlight
    ctx.fillStyle = isFlashing ? '#ffffaa' : '#ffaacc';
    ctx.fillRect(px + 4, py + 4, pw - 8, 10);

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px + 12, py + 20, 18, 14);
    ctx.fillRect(px + 44, py + 20, 18, 14);
    ctx.fillStyle = '#222222';
    ctx.fillRect(px + 17, py + 24, 8, 8);
    ctx.fillRect(px + 49, py + 24, 8, 8);
    // Eye shine
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px + 19, py + 25, 3, 3);
    ctx.fillRect(px + 51, py + 25, 3, 3);

    // Smile
    ctx.fillStyle = '#cc3366';
    ctx.fillRect(px + 18, py + 44, 4, 4);
    ctx.fillRect(px + 22, py + 48, 16, 4);
    ctx.fillRect(px + 38, py + 44, 4, 4);

    // Frosting hat (cupcake style)
    ctx.fillStyle = isFlashing ? '#ffeeaa' : '#ff99cc';
    ctx.beginPath();
    ctx.moveTo(px + 5, py);
    ctx.lineTo(px + pw / 2, py - 28);
    ctx.lineTo(px + pw - 5, py);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px + 20, py - 8, 8, 8);
    ctx.fillRect(px + 36, py - 12, 6, 10);

    // Slide squish visual
    if (game.player.state === 'sliding') {
      ctx.fillStyle = 'rgba(255,150,200,0.4)';
      ctx.fillRect(px - 10, py + ph - 10, pw + 20, 10);
    }

    // --- PARTICLES ---
    game.particles.pool.forEach((p) => {
      const alpha = Math.max(0, p.lifetime / p.maxLifetime);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    });
    ctx.globalAlpha = 1;

    // --- SCORE POPUPS ---
    game.popups.forEach((p) => {
      const alpha = Math.max(0, p.life / p.maxLife);
      const floatY = p.y - (1 - alpha) * 50;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p.text, p.x, floatY);
    });
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';

    // --- HUD ---
    ctx.font = 'bold 28px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText('SCORE: ' + Math.floor(game.scoring.score), 24, 44);
    ctx.font = 'bold 20px monospace';
    ctx.fillText('DIST: ' + Math.floor(game.scoring.distance) + 'm', 24, 70);

    ctx.textAlign = 'right';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('BEST: ' + Math.floor(game.scoring.highScore), W - 24, 44);

    ctx.textAlign = 'center';
    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = '#ffcc00';
    ctx.fillText(theme.toUpperCase(), W / 2, 36);

    ctx.textAlign = 'right';
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText('SPD: ' + Math.floor(game.speed), W - 24, H - 24);

    ctx.textAlign = 'left';
    ctx.shadowBlur = 0;

    if (game.scoring.combo > 1) {
      ctx.font = 'bold 28px monospace';
      ctx.fillStyle = '#ffcc00';
      ctx.shadowColor = '#ff8800';
      ctx.shadowBlur = 6;
      ctx.fillText('x' + game.scoring.combo + ' COMBO', 24, H - 24);
      ctx.shadowBlur = 0;
    }

    // --- POWERUP BARS ---
    const drawBar = (label, value, max, color, barY) => {
      if (value <= 0) return;
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(20, barY, 210, 18);
      ctx.fillStyle = color;
      ctx.fillRect(20, barY, (value / max) * 210, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px monospace';
      ctx.fillText(label, 24, barY + 13);
    };
    drawBar('INVINCIBLE', game.powerups.invincibility, 8, '#ffd700', 84);
    drawBar('SPEED BOOST', game.powerups.speedBoost, 6, '#ff4422', 106);
    drawBar('COIN MAGNET', game.powerups.coinMagnet, 10, '#4466ff', 128);

    // --- WORLD BANNER ---
    if (game.worldBanner) {
      const alpha = Math.min(1, game.worldBanner.life * 1.2);
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.textAlign = 'center';
      ctx.font = 'bold 52px monospace';
      ctx.fillStyle = '#ffcc00';
      ctx.shadowColor = '#ff8800';
      ctx.shadowBlur = 12;
      ctx.fillText(game.worldBanner.text, W / 2, 160);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left';
    }

    // --- STATE OVERLAYS ---

    // Start screen
    if (game.state === 'start') {
      ctx.fillStyle = 'rgba(0,0,0,0.72)';
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';

      ctx.font = 'bold 80px monospace';
      ctx.fillStyle = '#ff6b9d';
      ctx.shadowColor = '#cc0055';
      ctx.shadowBlur = 16;
      ctx.fillText('SWEET RUN', W / 2, H / 2 - 90);
      ctx.shadowBlur = 0;

      ctx.font = 'bold 26px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Press SPACE or Tap to Start', W / 2, H / 2 + 10);

      ctx.font = 'bold 19px monospace';
      ctx.fillStyle = '#ffcc00';
      ctx.fillText('SPACE = Jump   DOWN = Slide   SHIFT = Dash', W / 2, H / 2 + 60);

      ctx.font = 'bold 19px monospace';
      ctx.fillStyle = '#aaaaaa';
      ctx.fillText('Best: ' + Math.floor(game.scoring.highScore), W / 2, H / 2 + 100);

      ctx.textAlign = 'left';
    }

    // Paused screen
    if (game.state === 'paused') {
      ctx.fillStyle = 'rgba(0,0,0,0.62)';
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';

      ctx.font = 'bold 72px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('PAUSED', W / 2, H / 2 - 40);

      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = '#aaaaaa';
      ctx.fillText('Press P or ESC to Resume', W / 2, H / 2 + 20);

      ctx.textAlign = 'left';
    }

    // Game over screen
    if (game.state === 'gameover') {
      ctx.fillStyle = 'rgba(0,0,0,0.78)';
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';

      ctx.font = 'bold 76px monospace';
      ctx.fillStyle = '#ff4444';
      ctx.shadowColor = '#880000';
      ctx.shadowBlur = 14;
      ctx.fillText('GAME OVER', W / 2, H / 2 - 110);
      ctx.shadowBlur = 0;

      ctx.font = 'bold 32px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Score: ' + Math.floor(game.scoring.score), W / 2, H / 2 - 30);
      ctx.fillText('Distance: ' + Math.floor(game.scoring.distance) + 'm', W / 2, H / 2 + 20);

      ctx.fillStyle = '#ffd700';
      ctx.fillText('Best: ' + Math.floor(game.scoring.highScore), W / 2, H / 2 + 72);

      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = '#ffcc00';
      ctx.fillText('Press SPACE or Tap to Restart', W / 2, H / 2 + 136);

      ctx.textAlign = 'left';
    }
  }
}
