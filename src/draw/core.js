
export function fillCanvas(ctx, canvas) {
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function fillCircle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
}

export function strokePolygon(ctx, coords) {
  ctx.beginPath();
  ctx.moveTo(coords[0][0], coords[0][1]);
  for (let i = 1; i < coords.length; i++) {
    ctx.lineTo(coords[i][0], coords[i][1]);
  }
  ctx.closePath();
  ctx.stroke();
}
export function fillPolygon(ctx, coords) {
  ctx.beginPath();
  ctx.moveTo(coords[0][0], coords[0][1]);
  for (let i = 1; i < coords.length; i++) {
    ctx.lineTo(coords[i][0], coords[i][1]);
  }
  ctx.closePath();
  ctx.fill();
}