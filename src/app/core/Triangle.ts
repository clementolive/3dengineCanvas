export class Vector{
    x: number;
    y: number;
    z: number;

    constructor(x=0, y=0, z=0){
        this.x = x; 
        this.y = y;
        this.z = z; 
    }

    scale(s:number){
        this.x *= s;
        this.y *= s;
        this.z *= s;
    }
}