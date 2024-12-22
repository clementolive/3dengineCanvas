import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Matrix } from 'src/app/core/Matrix';
import { Mesh } from 'src/app/core/Mesh';
import { Triangle } from 'src/app/core/Triangle';
import { Vector } from 'src/app/core/Vector';
import { ZBuffer } from 'src/app/core/ZBuffer';
import { AlgorithmsService } from 'src/app/services/algorithms.service';
import { DrawService } from 'src/app/services/draw.service';
import { Functions3dService } from 'src/app/services/functions3d.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  canvas!: HTMLCanvasElement | null;
  ctx!: any;

  objData!: string;
  parsedObj!: any;
  fileText!: string;

  near!: number;
  far!: number;
  aspectRatio!: number;
  fov!: number; // field of view 
  fovRad!: number;
  theta!: number; //rotation angle 
  framerate!: number;
  elapsedTime!: number;
  c_width!: number;
  c_height!: number;

  matProj: Matrix = new Matrix();
  matRotX: Matrix = new Matrix();
  matRotZ: Matrix = new Matrix();
  rotSpeedX!: number;
  rotSpeedZ!: number;
  resultMesh: Mesh = new Mesh();
  vCamera = new Vector();

  zBuffer!: ZBuffer;

  constructor(private httpClient: HttpClient,
    private Fun: Functions3dService, 
    private Draw: DrawService, 
    private Algo: AlgorithmsService) { }

  ngOnInit(): void {
    this.canvas = document.querySelector("canvas");
    this.ctx = this.canvas?.getContext("2d");
    this.c_height = this.canvas!.height;
    this.c_width = this.canvas!.width;
    this.framerate = 60;
    this.elapsedTime = 0;

    if (!this.ctx) {
      alert("Can't load context. Try another browser.");
      return;
    }

    //Init zBuffer
    this.zBuffer = new ZBuffer(this.c_height, this.c_width);

    //Projection matrix
    this.near = 100;
    this.far = 1000;
    this.aspectRatio = this.c_height / this.c_width;
    this.fov = 30; // acts as zoom 
    this.fovRad = 1 / Math.tan(this.fov * 0.5 / 180 * 3.14159); //acts as zoom 
    this.matProj.initProj(this.aspectRatio, this.fovRad, this.far, this.near);

    //Rotation angle 
    this.theta = 0;
    this.rotSpeedX = 0.1;
    this.rotSpeedZ = 1;

    //Loading .OBJ file and parsing it, then we get data in our Mesh 
    this.httpClient.get('assets/teapot.obj', { responseType: 'text' })
      .subscribe(data => {
        this.resultMesh = this.Fun.parsingObj(data);
      });

    //Starting animation
    window.requestAnimationFrame(this.onUserUpdate.bind(this));
  }

  //On every frame or user movement 
  onUserUpdate(time: any) {

    //Clear screen
    this.ctx.clearRect(0, 0, this.c_width, this.c_height);

    //Adds background, setup colors 
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.c_width, this.c_height);

    //Angle changes with time 
    this.theta += 0.01;

    //Setup rotation matrixes
    this.matRotX.initRotX(this.rotSpeedX, this.theta);
    this.matRotZ.initRotZ(this.rotSpeedZ, this.theta);

    //Accumulate triangles to sort them and display them by depth 
    let trianglesToRaster: Triangle[] = [];

    //Drawing each triangle of the mesh 
    for (let index = 0; index < this.resultMesh.m.length; index++) {
      //triangle to be projected
      //Triangle will soon contain true color information here. For now it's black by default (constructor)
      let tri = this.resultMesh.m[index];

      //for storing result of each step 
      let triRotatedZ = new Triangle();
      let triRotatedZX = new Triangle();
      let triTranslated = new Triangle();
      let triProjected = new Triangle();

      //Rotate Z-axis and X-axis
      this.Fun.useMatrixOnTriangle(tri, triRotatedZ, this.matRotZ);
      this.Fun.useMatrixOnTriangle(triRotatedZ, triRotatedZX, this.matRotX);

      // we translate away from screen to see it, then project 
      for (let i = 0; i < 3; i++) {
        triTranslated.p[i].x = triRotatedZX.p[i].x;
        triTranslated.p[i].y = triRotatedZX.p[i].y;
      }
      let offset = 10;
      triTranslated.p[0].z = triRotatedZX.p[0].z + offset;
      triTranslated.p[1].z = triRotatedZX.p[1].z + offset;
      triTranslated.p[2].z = triRotatedZX.p[2].z + offset;

      //Handling normals (used to hide faces that we shouldn't see)
      //Normal is the cross product of two line (right hand rule)
      let line1 = new Vector();
      let line2 = new Vector();
      let normal = new Vector();

      //We get two vectors from current triangle
      line1 = triTranslated.p[1].subVectors(triTranslated.p[0]);
      line2 = triTranslated.p[2].subVectors(triTranslated.p[0]);

      //We can now calculate normal with cross-product
      normal = line1.crossProduct(line2);

      //Just to normalize:
      normal.normalize();

      //If we're supposed to see the triangle, we calculate it.
      //We compare the similarity between normal and camera-triangle axis. 
      //This is done by using Dot product. 
      let cameraAxis = triTranslated.p[0].subVectors(this.vCamera);
      let resNormal = normal.dotProduct(cameraAxis);

      // DRAW STARTS HERE 
      if (resNormal < 0.0) {
        //Lighting
        let lightDirection = new Vector(1, 0, 0);
        
        let lightDistance = lightDirection.distance(triTranslated.p[0]);

        //Preparing for dot product 
        lightDirection.normalize();
        
        //Choosing color according to light - object angle 
        let dp = normal.dotProduct(lightDirection);

        //Distance to light matters too (intensity proportional to distance squared)
        dp /= Math.pow(lightDistance, 2);
        let lightStrength = 1500;
        //triTranslated.color = tri.color;
        triTranslated.color.addColor(dp * lightStrength, dp * lightStrength, dp * lightStrength);

        //Project:
        this.Fun.useMatrixOnTriangle(triTranslated, triProjected, this.matProj);
        triProjected.color = triTranslated.color;

        //From now on, Z component is useless.
        //Translate into view
        let sc = 1;
        triProjected.p[0].x += sc; triProjected.p[0].y += sc;
        triProjected.p[1].x += sc; triProjected.p[1].y += sc;
        triProjected.p[2].x += sc; triProjected.p[2].y += sc;
        let scaleFactor = 0.5;
        triProjected.p[0].x *= scaleFactor * this.c_width;
        triProjected.p[0].y *= scaleFactor * this.c_height;
        triProjected.p[1].x *= scaleFactor * this.c_width;
        triProjected.p[1].y *= scaleFactor * this.c_height;
        triProjected.p[2].x *= scaleFactor * this.c_width;
        triProjected.p[2].y *= scaleFactor * this.c_height;
        
        triProjected.p[0].round();
        triProjected.p[1].round();
        triProjected.p[2].round();
        //From now on, triangles coords are positioned in 2d canvas 

        //Store triangles to sort and display per depth 
        trianglesToRaster.push(triProjected);
      }
    }

    //Sort triangles from back to front
    //trianglesToRaster.sort(this.Fun.sortTrianglesByDepth);

    //Reset zBuffer
    this.zBuffer.reset();

    //Draw triangles here 
    for (let i = 0; i < trianglesToRaster.length; i++) {

      //Using lighting (color)
      this.ctx.strokeStyle = trianglesToRaster[i].color.toStrokeStyle();
      
      //Or this for debug (no lighting)
      //this.ctx.strokeStyle = "blue";

      //this.Draw.fillTriangle(trianglesToRaster[i], this.ctx, this.zBuffer);
      this.Algo.fillTriangleBarycentric(trianglesToRaster[i], this.ctx, this.zBuffer);

      this.ctx.strokeStyle = "red";
      //this.Draw.drawTriangle(trianglesToRaster[i], this.ctx);
    }

    //setTimeout(() => {
      window.requestAnimationFrame(this.onUserUpdate.bind(this));
    //}, 1000 / this.framerate);
  }

}
