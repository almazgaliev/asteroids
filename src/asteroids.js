//@ts-nocheck

export class AsteroidField {
  constructor(amount, n = 20) {
    this.coords = [];
    for (let ix = 0; ix < amount; ix++) {
      this.coords.push([]);
      for (let i = 0; i < n; i++) {
        let phi = (i * 2 * Math.PI) / n;
        let r = Math.random() * 10 + 30;
        this.coords[ix].push([Math.cos(phi) * r, -Math.sin(phi) * r, 1]);
      };
    }
  }
}
