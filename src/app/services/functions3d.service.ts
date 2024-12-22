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

  //This is a hack and should be replaced 
  sortTrianglesByDepth(a:Triangle, b:Triangle){
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


  // Parsing .OBJ file, returns the mesh 
  parsingObj(fileContents: string): Mesh {
    let resultMesh = new Mesh();

    const OBJFile = require('obj-file-parser');

    const objFile = new OBJFile(fileContents);

    let parsedObj = objFile.parse(); // see description below

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
