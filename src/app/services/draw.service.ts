import { Injectable } from '@angular/core';
import { Mesh } from '../core/Mesh';
import { Triangle } from '../core/Triangle';
import { Vector } from '../core/Vector';

@Injectable({
  providedIn: 'root'
})
export class DrawService {

  constructor() { }

  drawLineHorizontal(ctx: any, x1: number, y1: number, x2: number, y2: number){
    let start = x1; 
    let end = x2;
    if (x1 > x2){
      start = x2; 
      end = x1; 
    }

    for (let i = start; i < end; i++) {
      ctx.strokeRect(i,y1,1,1);
    }
  }

  drawLine(ctx: any, x1: number, y1: number, x2: number, y2: number){
    ctx.moveTo(x1, y1); 
    ctx.lineTo(x2,y2); 
    ctx.stroke();
  }

  drawTriangle(tr:Triangle, ctx: any){
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



  fillBottomFlatTriangle(t: Triangle, ctx: any){
    let A = t.p[0]; 
    let B = t.p[1]; 
    let C = t.p[2]; 

    let invslope1 = (B.x - A.x) / (B.y - A.y); 
    let invslope2 = (C.x - A.x) / (C.y - A.y); 

    let curx1 = A.x;
    let curx2 = A.x;

    for (let scanlineY = A.y;  scanlineY <= B.y; scanlineY++) {

      this.drawLineHorizontal(ctx, curx1, scanlineY, curx2, scanlineY);

      curx1 += invslope1;
      curx2 += invslope2;
    }
  }

  fillTopFlatTriangle(t: Triangle, ctx: any){
    let A = t.p[0]; 
    let B = t.p[1]; 
    let C = t.p[2]; 

    let invslope1 = (C.x - A.x) / (C.y - A.y); 
    let invslope2 = (C.x - B.x) / (C.y - B.y); 

    let curx1 = C.x;
    let curx2 = C.x;

    for (let scanlineY = C.y;  scanlineY >= A.y; scanlineY--) {

      this.drawLineHorizontal(ctx, curx1, scanlineY, curx2, scanlineY);

      curx1 -= invslope1;
      curx2 -= invslope2;
    }
  }

  // http://www.sunshine2k.de/coding/java/TriangleRasterization/TriangleRasterization.html
  fillTriangle(t:Triangle, ctx:any){
    ctx.beginPath();

    //First sort vertices by Y 
    t.p.sort((a,b) => a.y - b.y);

    let v1 = t.p[0]; 
    let v2 = t.p[1]; 
    let v3 = t.p[2]; 

    /* here we know that v1.y <= v2.y <= v3.y */
    /* check for trivial case of bottom-flat triangle */
    if (v2.y == v3.y)
    {
      this.fillBottomFlatTriangle(t, ctx);
    }
    /* check for trivial case of top-flat triangle */
    else if (v1.y == v2.y)
    {
      this.fillTopFlatTriangle(t, ctx);
    }
    else
    {
      /* general case - split the triangle in a topflat and bottom-flat one */
      let v4 = new Vector(v1.x + (v2.y - v1.y) / (v3.y - v1.y) * (v3.x - v1.x), v2.y,0);
      
      this.fillTopFlatTriangle(new Triangle(v2,v4,v3,t.color), ctx);
      this.fillBottomFlatTriangle(new Triangle(v1,v2,v4,t.color), ctx);
    }
  }

  // Parsing .OBJ file, returns the mesh 
  parsingObj(fileContents: string): Mesh {
    let resultMesh = new Mesh();

    const OBJFile = require('obj-file-parser');

    const objFile = new OBJFile(fileContents);

    let parsedObj = objFile.parse(); // see description below
    //console.log("output:", parsedObj);

    for (let i = 0; i < parsedObj.models[0].faces.length; i++) {
      //Random triangle for storing the actual triangle 
      resultMesh.m.push(new Triangle());

      //For each triangle, we get the vertices from their indexes 
      //We must substract 1 from index because .OBJ starts at 1
      for (let j = 0; j < 3; j++) {
        let vertexIndex = parsedObj.models[0].faces[i].vertices[j].vertexIndex;
        resultMesh.m[i].p[j] = parsedObj.models[0].vertices[vertexIndex - 1];
      }
    }

    return resultMesh;
  }
}
