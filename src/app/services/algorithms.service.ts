import { Injectable } from '@angular/core';
import { Triangle } from '../core/Triangle';
import { Vector } from '../core/Vector';
import { ZBuffer } from '../core/ZBuffer';

@Injectable({
  providedIn: 'root'
})
export class AlgorithmsService {

  constructor() { }

  isInsideRayCasting(t: Triangle, xp: number, yp: number): boolean {

    let count = 0;

    let x1 = t.p[0].x;
    let y1 = t.p[0].y;
    let x2 = t.p[1].x;
    let y2 = t.p[1].y;
    let x3 = t.p[2].x;
    let y3 = t.p[2].y;

    if ((yp < y1) != (yp < y2)
      && xp < ((yp - y1) / (y2 - y1)) * (x2 - x1)) {
      count++;
    }

    if ((yp < y2) != (yp < y3)
      && xp < ((yp - y2) / (y3 - y2)) * (x3 - x2)) {
      count++;
    }
    if ((yp < y3) != (yp < y1)
      && xp < ((yp - y3) / (y1 - y3)) * (x1 - x3)) {
      count++;
    }
    return count % 2 == 0;

  }

  fillTriangleBarycentric(tri: Triangle, ctx: any, zBuffer: ZBuffer) {

    let v1 = tri.p[0];
    let v2 = tri.p[1];
    let v3 = tri.p[2];

    /* get the bounding box of the triangle */
    let maxX = Math.max(v1.x, Math.max(v2.x, v3.x));
    let minX = Math.min(v1.x, Math.min(v2.x, v3.x));
    let maxY = Math.max(v1.y, Math.max(v2.y, v3.y));
    let minY = Math.min(v1.y, Math.min(v2.y, v3.y));

    /* spanning vectors of edge (v1,v2) and (v1,v3) */
    let vs1 = new Vector(v2.x - v1.x, v2.y - v1.y, 0);
    let vs2 = new Vector(v3.x - v1.x, v3.y - v1.y, 0);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        let q = new Vector(x - v1.x, y - v1.y, 0);

        let s = q.crossProduct(vs2).magnitude() / vs1.crossProduct(vs2).magnitude();
        let t = vs1.crossProduct(q).magnitude() / vs1.crossProduct(vs2).magnitude();

        /* inside triangle */
        if ((s >= 0) && (t >= 0) && (s + t <= 1)) {

          //Check for zBuffer 
          //let newZ = this.barycentricWeights(tri, x, y);
          //if (newZ < zBuffer.buffer[y][x]){
             ctx.strokeRect(x, y, 1, 1);
            // zBuffer.buffer[y][x] = newZ;
          //}
          
        }
      }
    }
  }
}
