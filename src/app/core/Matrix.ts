export class Matrix{
    m: number[][] = [[0,0,0,0],
                    [0,0,0,0],
                    [0,0,0,0],
                    [0,0,0,0]];

    constructor(){
    }

    initProj(aspectRatio: number, fovRad: number, far: number, near: number){
        this.m[0][0] = aspectRatio * fovRad;
        this.m[1][1] = fovRad;
        this.m[2][2] = far / (far - near);
        this.m[3][2] = (-far * near) / (far - near);
        this.m[2][3] = 1.0;
        this.m[3][3] = 0.0;
    }

    initRotZ(rotSpeedZ: number, angle: number){
        this.m[0][0] = Math.cos(rotSpeedZ*angle);
        this.m[0][1] = Math.sin(rotSpeedZ*angle);
        this.m[1][0] = -Math.sin(rotSpeedZ*angle);
        this.m[1][1] = Math.cos(rotSpeedZ*angle);
        this.m[2][2] = 1;
        this.m[3][3] = 1;
    }

    initRotX(rotSpeedX: number, angle: number){
        this.m[0][0] = 1;
        this.m[1][1] = Math.cos(rotSpeedX*angle);
        this.m[1][2] = Math.sin(rotSpeedX*angle);
        this.m[2][1] = -Math.sin(rotSpeedX*angle);
        this.m[2][2] = Math.cos(rotSpeedX*angle);
        this.m[3][3] = 1;
    }

}