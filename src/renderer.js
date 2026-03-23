export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.ctx.imageSmoothingEnabled = false;
  }

  draw(game) {
    if (!game || !this.ctx) return;

    const { ctx, canvas } = this;
    const cameraX = game.camera?.x ?? 0;
    const cameraY = game.camera?.y ?? 0;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const theme = game.world?.getTheme?.();
    const layers = game.world?.backgroundLayers;
    const parallax = game.world?.parallax;
    if (layers && parallax?.length) {
      for (let i = 1; i <= 3; i += 1) {
        const path = `assets/backgrounds/${theme}/layer_${i}.png`;
        const image = layers.get(path);
        if (!image) continue;

        const width = image.width || canvas.width;
        const height = image.height || canvas.height;
        const scroll = ((parallax[i - 1] ?? 0) - cameraX * (0.2 + (i - 1) * 0.15)) % width;
        const drawX = -scroll;
        const drawY = -cameraY;

        ctx.drawImage(image, drawX, drawY, width, height);
        ctx.drawImage(image, drawX + width, drawY, width, height);
      }
    }

    const obstacles = game.obstacles?.pool;
    if (Array.isArray(obstacles) && obstacles.length) {
      for (const obstacle of obstacles) {
        const spritePath = obstacle.theme && obstacle.type
          ? `assets/obstacles/${obstacle.theme}/obstacle_${obstacle.type}.png`
          : null;
        const sprite = spritePath ? game.obstacles?.sprites?.get(spritePath) : null;
        const x = obstacle.x - cameraX;
        const y = obstacle.y - cameraY;

        if (sprite) {
          ctx.drawImage(sprite, x, y, obstacle.width, obstacle.height);
        } else {
          ctx.fillStyle = '#ff6b6b';
          ctx.fillRect(x, y, obstacle.width, obstacle.height);
        }
      }
    }

    const collectibles = game.collectibles?.items;
    if (Array.isArray(collectibles) && collectibles.length) {
      for (const item of collectibles) {
        const x = item.x - cameraX;
        const y = item.y - cameraY;
        const sprite = item.type === 'coin' ? game.collectibles?.coinSheet : null;

        if (sprite) {
          ctx.drawImage(sprite, x, y, item.width, item.height);
        } else {
          ctx.fillStyle = '#ffd93d';
          ctx.beginPath();
          ctx.arc(x + item.width / 2, y + item.height / 2, Math.min(item.width, item.height) / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    const player = game.player;
    if (player?.position) {
      const sprite = player.sprite ?? null;
      const width = player.width ?? 64;
      const height = player.height ?? 64;
      const x = player.position.x - cameraX;
      const y = player.position.y - cameraY;

      if (sprite) {
        ctx.drawImage(sprite, x, y, width, height);
      } else {
        ctx.fillStyle = '#6bcB77';
        ctx.fillRect(x, y, width, height);
      }
    }

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${game.scoring?.score ?? 0}`, 24, 24);

    ctx.textAlign = 'right';
    ctx.fillText(`High: ${game.scoring?.highScore ?? 0}`, canvas.width - 24, 24);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`Combo: x${game.scoring?.combo ?? 1}`, 24, canvas.height - 24);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (game.state === 'start') {
      ctx.fillText('Tap to Start', canvas.width / 2, canvas.height / 2);
    } else if (game.state === 'paused') {
      ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
    } else if (game.state === 'gameover') {
      ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 40);
      ctx.fillText(`Score: ${game.scoring?.score ?? 0}`, canvas.width / 2, canvas.height / 2 + 8);
      ctx.fillText('Tap to Restart', canvas.width / 2, canvas.height / 2 + 56);
    }
  }
}
