import { Injectable } from '@angular/core';
import { Mesh } from '../core/Mesh';
import { Triangle } from '../core/Triangle';
import { Vector } from '../core/Vector';
import { ZBuffer } from '../core/ZBuffer';
import { scan } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DrawService {

  constructor() { }

  drawLineHorizontal(ctx: any, v1: Vector, v2: Vector, zBuffer: ZBuffer, t:Triangle) {

    let start = v1.x;
    let end = v2.x;
    if (v1.x > v2.x) {
      start = v2.x;
      end = v1.x;
    }
    start = Math.round(start);
    end = Math.round(end);
    let h = Math.round(v1.y);



    for (let j = start; j < end; j++) {

      //Interpolate Z for current point
      let vec = new Vector(j, v1.y, 0);
      let vecV1 = 1/v1.distance(vec); 
      let vecV2 = 1/v2.distance(vec);
      //let zInterpolation = (v1.z * vecV1 + v2.z * vecV2) / (vecV1 + vecV2);
      let zInterpolation = this.barycentricWeights(t, j, h);
      //Then check zBuffer
      let index = h*zBuffer.height+j
      if(zInterpolation < zBuffer.buffer[index]){
        
          ctx.strokeRect(j, v1.y, 1, 1);
          zBuffer.buffer[index] = zInterpolation;
      }
      
    }
  }

  drawLine(ctx: any, x1: number, y1: number, x2: number, y2: number) {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  drawTriangle(tr: Triangle, ctx: any) {
    ctx.beginPath();
    //First line 
    ctx.moveTo(tr.p[0].x, tr.p[0].y);
    ctx.lineTo(tr.p[1].x, tr.p[1].y);
    ctx.stroke();

    //2nd line 
    ctx.lineTo(tr.p[2].x, tr.p[2].y);
    ctx.stroke();

    //3rd line (goes back to first vertex) (can use closePath also)
    ctx.lineTo(tr.p[0].x, tr.p[0].y);
    ctx.stroke();
    //ctx.closePath();
  }

  fillBottomFlatTriangle(t: Triangle, ctx: any, zBuffer: ZBuffer) {
    let A = t.p[0];
    let B = t.p[1];
    let C = t.p[2];

    let invslope1 = (B.x - A.x) / (B.y - A.y);
    let invslope2 = (C.x - A.x) / (C.y - A.y);

    let curx1 = A.x;
    let curx2 = A.x;

    for (let scanlineY = A.y; scanlineY <= B.y; scanlineY++) {

      //TODO Add Z-interpolation here (Z should not be 0)
      let v1 = new Vector(curx1, scanlineY, 0);
      let v2 = new Vector(curx2, scanlineY, 0);

      this.drawLineHorizontal(ctx, v1, v2, zBuffer, t);

      curx1 += invslope1;
      curx2 += invslope2;
    }
  }

  fillTopFlatTriangle(t: Triangle, ctx: any, zBuffer: ZBuffer) {
    let A = t.p[0];
    let B = t.p[1];
    let C = t.p[2];

    let invslope1 = (C.x - A.x) / (C.y - A.y);
    let invslope2 = (C.x - B.x) / (C.y - B.y);

    let curx1 = C.x;
    let curx2 = C.x;

    for (let scanlineY = C.y; scanlineY >= A.y; scanlineY--) {

      //TODO Add Z-interpolation here (Z should not be 0)
      let v1 = new Vector(curx1, scanlineY, 0);
      let v2 = new Vector(curx2, scanlineY, 0);
      let factor = A.distance(v1) / A.distance(C); 
      let v1_zInterpolation = A.z * factor + C.z * (1 - factor);
      factor = B.distance(v1) / B.distance(C); 
      let v2_zInterpolation = B.z * factor + C.z * (1 - factor);
      v1.z = v1_zInterpolation;
      v2.z = v2_zInterpolation;

      this.drawLineHorizontal(ctx, v1, v2, zBuffer, t);

      curx1 -= invslope1;
      curx2 -= invslope2;
    }
  }

  // http://www.sunshine2k.de/coding/java/TriangleRasterization/TriangleRasterization.html
  fillTriangle(t: Triangle, ctx: any, zBuffer: ZBuffer) {
    ctx.beginPath();

    //console.log("depth", t.p[0].z);

    //First sort vertices by Y 
    t.p.sort((a, b) => a.y - b.y);

    let v1 = t.p[0];
    let v2 = t.p[1];
    let v3 = t.p[2];

    /* here we know that v1.y <= v2.y <= v3.y */
    /* check for trivial case of bottom-flat triangle */
    if (v2.y == v3.y) {
      this.fillBottomFlatTriangle(t, ctx, zBuffer);
    }
    /* check for trivial case of top-flat triangle */
    else if (v1.y == v2.y) {
      this.fillTopFlatTriangle(t, ctx, zBuffer);
    }
    else {
      /* general case - split the triangle in a topflat and bottom-flat one */
      //TODO INTERPOLATE v4 between v1 and v3 HERE TO KEEP VALUE OF Z 

      let v4 = new Vector(v1.x + (v2.y - v1.y) / (v3.y - v1.y) * (v3.x - v1.x), v2.y, 0);
      let segment = v1.distance(v3);
      let factor = v4.distance(v1) / segment;
      let zInterpolation = v1.z * factor + v3.z * (1 - factor);
      v4.z = zInterpolation;

      this.fillTopFlatTriangle(new Triangle(v2, v4, v3, t.color), ctx, zBuffer);
      this.fillBottomFlatTriangle(new Triangle(v1, v2, v4, t.color), ctx, zBuffer);
    }
  }

  // Computes weights and Applies interpolated Z to Point P (vector)
  barycentricWeights(t: Triangle, x: number, y: number) {
    let v1 = t.p[0];
    let v2 = t.p[1];
    let v3 = t.p[2];

    let w1 = ((v2.y - v3.y) * (x - v3.x) + (v3.x - v2.x) * (y - v3.y)) /
      ((v2.y - v3.y) * (v1.x - v3.x) + (v3.x - v2.x) * (v1.y - v3.y));

    let w2 = ((v3.y - v1.y) * (x - v3.x) + (v1.x - v3.x) * (y - v3.y)) /
      ((v2.y - v3.y) * (v1.x - v3.x) + (v3.x - v2.x) * (v1.y - v3.y));

    let w3 = 1 - w1 - w2;

    return (w1 * v1.z + w2 * v2.z + w3 * v3.z) / (w1 + w2 + w3);

  }

  

}
