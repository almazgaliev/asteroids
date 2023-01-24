//@ts-nocheck

export class AsteroidField {
  constructor(amount) {
    this.coords = [];
    for (let ix = 0; ix < amount; ix++) {
      this.coords.push([]);
      for (let i = 0; i < 16; i++) {
        let phi = (i * 2 * Math.PI) / 16;
        let r = Math.random() * 10 + 30;
        this.coords[ix].push([Math.cos(phi) * r, -Math.sin(phi) * r, 1]);
      };
    }

    // this.slices
  }
}
