import { Injectable } from '@angular/core';
import { Triangle } from '../core/Triangle';
import { Mesh } from '../core/Mesh';
import { Matrix } from '../core/Matrix';
import { Vector } from '../core/Vector';

@Injectable({
  providedIn: 'root'
})
export class Functions3dService {

  constructor() { }

  // V = V * S 
  scaleVector(v: Vector, s: number) {
    v.x *= s; v.y *= s; v.z *= s;
  }

  // R = A + B 
  addVectors(a: Vector, b: Vector): Vector {
    let res = new Vector();
    res.x = a.x + b.x; res.y = a.y + b.y; res.z = a.z + b.z;
    return res;
  }

  // R = A - B 
  subVectors(a: Vector, b: Vector): Vector {
    let res = new Vector();
    res.x = a.x - b.x; res.y = a.y - b.y; res.z = a.z - b.z;
    return res;
  }

  magnitude(a:Vector): number{
    return  Math.sqrt(a.x*a.x + a.y*a.y + a.z*a.z);
  }

  crossProduct(a: Vector, b: Vector): Vector{
    let res = new Vector();
    res.x = a.y * b.z - a.z * b.y;
    res.y = a.z * b.x - a.x * b.z;
    res.z = a.x * b.y - a.y * b.x;
    return res;
  }

  dotProduct(a:Vector, b: Vector): number{
    return a.x * b.x  + a.y * b.y + a.z * b.z;
  }

  drawLine(ctx: any, x1: number, y1: number, x2: number, y2: number){
    ctx.beginPath();
    ctx.moveTo(x1, y1); 
    ctx.lineTo(x2,y2); 
    ctx.stroke();
  }

  drawTriangle(tr:Triangle, ctx: any){
    ctx.beginPath(); // Without this, it acts as a fill ! 
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
  }

  sortTriangles(a:Triangle, b:Triangle){
    let resA = 0; 
    let resB = 0;
    //Calculate depth midpoint from 2 triangles
      for (let i = 0; i < 3; i++) {
        resA += a.p[i].z ;
        resB += b.p[i].z ;
      }
      resA /= 3; resB /= 3; 
      return resB - resA;
  }

  // http://www.sunshine2k.de/coding/java/TriangleRasterization/TriangleRasterization.html
  fillBottomFlatTriangle(t: Triangle, ctx: any){
    let A = t.p[0]; 
    let B = t.p[1]; 
    let C = t.p[2]; 

    let invslope1 = (B.x - A.x) / (B.y - A.y); 
    let invslope2 = (C.x - A.x) / (C.y - A.y); 

    let curx1 = A.x;
    let curx2 = A.x;

    for (let scanlineY = A.y;  scanlineY <= B.y; scanlineY++) {

      this.drawLine(ctx, curx1, scanlineY, curx2, scanlineY);

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

      this.drawLine(ctx, curx1, scanlineY, curx2, scanlineY);

      curx1 -= invslope1;
      curx2 -= invslope2;
    }
  }

  fillTriangle(t:Triangle, ctx:any){

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

      this.fillTopFlatTriangle({p:[v2,v4,v3], color: '#000000'}, ctx);
      this.fillBottomFlatTriangle({p:[v1,v2,v4], color: '#000000'}, ctx);
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

  //Applying projection matrix to 3D vector 
  multiplyMatrix(i: Vector, o: Vector, m: Matrix) {
    o.x = i.x * m.m[0][0] + i.y * m.m[1][0] + i.z * m.m[2][0] + m.m[3][0];
    o.y = i.x * m.m[0][1] + i.y * m.m[1][1] + i.z * m.m[2][1] + m.m[3][1];
    o.z = i.x * m.m[0][2] + i.y * m.m[1][2] + i.z * m.m[2][2] + m.m[3][2];

    let w = i.x * m.m[0][3] + i.y * m.m[1][3] + i.z * m.m[2][3] + m.m[3][3];

    if (w != 0) {
      o.x /= w; o.y /= w; o.z /= w;
    }
  }

  // Apply matrix for each point of triangle 
  useMatrixOnTriangle(input: Triangle, out: Triangle, m: Matrix) {
    for (let i = 0; i < 3; i++) {
      this.multiplyMatrix(input.p[i], out.p[i], m);
    }
  }

}
