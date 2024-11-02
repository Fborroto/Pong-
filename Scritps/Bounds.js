import * as THREE from 'three';

export default class Bounds {
    constructor(xMin, xMax, yMin, yMax) {
      this.xMin = xMin; // Limite sinistro sul piano X
      this.xMax = xMax; // Limite destro sul piano X
      this.yMin = yMin; // Limite inferiore sul piano Y
      this.yMax = yMax; // Limite superiore sul piano Y
    }
  }
  