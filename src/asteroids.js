export class AsteroidField {
  constructor(amount, n = 20) {
    this.coords = [];
    for (let i = 0; i < n; i++) {
      let phi = (i * 2 * Math.PI) / n;
      let r = Math.random() * 5 + 30;
      this.coords.push([Math.cos(phi) * r, -Math.sin(phi) * r]);
    };
  }
}
