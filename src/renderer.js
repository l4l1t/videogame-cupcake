export class Renderer {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  draw(game) {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#5d3a1a';
    ctx.fillRect(0, 628, canvas.width, 92);
    ctx.fillStyle = '#7a5230';
    ctx.fillRect(0, 628, canvas.width, 6);

    ctx.fillStyle = '#6ec6ff';
    ctx.font = 'bold 28px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('SCORE: ' + Math.floor(game.scoring.score), 24, 40);
    ctx.fillText('DIST: ' + Math.floor(game.scoring.distance) + 'm', 24, 72);
    ctx.textAlign = 'right';
    ctx.fillText('BEST: ' + Math.floor(game.scoring.highScore), canvas.width - 24, 40);
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = '#ffcc00';
    ctx.fillText(game.world.getTheme().toUpperCase(), canvas.width / 2, 32);
    ctx.textAlign = 'left';

    if (game.scoring.combo > 1) {
      ctx.font = 'bold 28px monospace';
      ctx.fillStyle = '#ffcc00';
      ctx.fillText('x' + game.scoring.combo + ' COMBO', 24, canvas.height - 24);
    }

    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = '#aaaaaa';
    ctx.textAlign = 'right';
    ctx.fillText('SPD: ' + Math.floor(game.speed), canvas.width - 24, canvas.height - 24);
    ctx.textAlign = 'left';

    const powerups = game.powerups;
    let barY = 90;
    const drawBar = (label, value, max, color) => {
      if (value <= 0) return;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(24, barY, 200, 16);
      ctx.fillStyle = color;
      ctx.fillRect(24, barY, (value / max) * 200, 16);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px monospace';
      ctx.fillText(label, 28, barY + 12);
      barY += 22;
    };
    drawBar('INVINCIBLE', powerups.invincibility, 8, '#ffd700');
    drawBar('SPEED', powerups.speedBoost, 6, '#ff4444');
    drawBar('MAGNET', powerups.coinMagnet, 10, '#4444ff');

    if (game.worldBanner) {
      const alpha = Math.min(1, game.worldBanner.life * 1.5);
      ctx.globalAlpha = alpha;
      ctx.textAlign = 'center';
      ctx.font = 'bold 48px monospace';
      ctx.fillStyle = '#ffcc00';
      ctx.fillText(game.worldBanner.text, canvas.width / 2, 140);
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left';
    }

    game.collectibles.items.forEach((item) => {
      ctx.fillStyle = item.type === 'coin' ? '#ffd700' : item.type === 'invincibility' ? '#fff176' : item.type === 'speed' ? '#ff5252' : '#4d7cff';
      ctx.fillRect(item.x, item.y, item.width, item.height);
    });

    game.obstacles.pool.forEach((obstacle) => {
      ctx.fillStyle = '#7b1e1e';
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    const inv = game.powerups.invincibility;
    if (inv > 0) {
      const flash = Math.floor(Date.now() / 100) % 2 === 0;
      if (flash) {
        ctx.fillStyle = '#ffd700';
      } else {
        ctx.fillStyle = '#ff6b9d';
      }
    } else {
      ctx.fillStyle = '#ff6b9d';
    }
    ctx.fillRect(
      game.player.position.x,
      game.player.position.y,
      game.player.width,
      game.player.height
    );

    if (game.controls.state.dash) {
      for (let i = 1; i <= 4; i++) {
        ctx.globalAlpha = 0.15 * (5 - i);
        ctx.fillStyle = '#ff6b9d';
        ctx.fillRect(
          game.player.position.x - i * 18,
          game.player.position.y + 8,
          game.player.width,
          game.player.height - 16
        );
      }
      ctx.globalAlpha = 1;
    }

    game.particles.pool.forEach((p) => {
      const alpha = p.lifetime / p.maxLifetime;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    });
    ctx.globalAlpha = 1;

    game.popups.forEach((p) => {
      const alpha = p.life / p.maxLife;
      const y = p.y - (1 - alpha) * 40;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p.text, p.x, y);
    });
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';

    if (game.state === 'start') {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = 'center';
      ctx.font = 'bold 72px monospace';
      ctx.fillStyle = '#ff6b9d';
      ctx.fillText('SWEET RUN', canvas.width / 2, canvas.height / 2 - 80);
      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Press SPACE or Tap to Start', canvas.width / 2, canvas.height / 2);
      ctx.font = 'bold 18px monospace';
      ctx.fillStyle = '#ffcc00';
      ctx.fillText('SPACE = Jump   DOWN = Slide   SHIFT = Dash', canvas.width / 2, canvas.height / 2 + 50);
      ctx.font = 'bold 18px monospace';
      ctx.fillStyle = '#aaaaaa';
      ctx.fillText('Best: ' + Math.floor(game.scoring.highScore), canvas.width / 2, canvas.height / 2 + 90);
      ctx.textAlign = 'left';
    }

    if (game.state === 'paused') {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = 'center';
      ctx.font = 'bold 64px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 40);
      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = '#aaaaaa';
      ctx.fillText('Press P or ESC to Resume', canvas.width / 2, canvas.height / 2 + 20);
      ctx.textAlign = 'left';
    }

    if (game.state === 'gameover') {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = 'center';
      ctx.font = 'bold 72px monospace';
      ctx.fillStyle = '#ff4444';
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 100);
      ctx.font = 'bold 32px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Score: ' + Math.floor(game.scoring.score), canvas.width / 2, canvas.height / 2 - 30);
      ctx.fillText('Distance: ' + Math.floor(game.scoring.distance) + 'm', canvas.width / 2, canvas.height / 2 + 20);
      ctx.fillText('Best: ' + Math.floor(game.scoring.highScore), canvas.width / 2, canvas.height / 2 + 70);
      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = '#ffcc00';
      ctx.fillText('Press SPACE or Tap to Restart', canvas.width / 2, canvas.height / 2 + 130);
      ctx.textAlign = 'left';
    }
  }
}
