export class Vector {
    x: number;
    y: number;
    z: number;

    w: number; // Depth buffer 

    constructor(x = 0, y = 0, z = 0, w = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    setX(x: number){
        this.x = x;
    }
    setY(y: number){
        this.y = y;
    }
    setZ(z: number){
        this.z = z;
    }

    scale(s: number): void {
        this.x *= s;
        this.y *= s;
        this.z *= s;
    }

    divide(s: number): void {
        if (s != 0) {
            this.x /= s;
            this.y /= s;
            this.z /= s;
        }
    }

    magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    normalize() {
        let l = this.magnitude();
        this.divide(l);
    }

    // R = A + B 
    addVectors(v: Vector): Vector {
        let res = new Vector();
        res.x = this.x + v.x; res.y = this.y + v.y; res.z = this.z + v.z;
        return res;
    }

    // R = A - B 
    subVectors(v: Vector): Vector {
        let res = new Vector();
        res.x = this.x - v.x; res.y = this.y - v.y; res.z = this.z - v.z;
        return res;
    }

    distance(a: Vector): number {
        return Math.sqrt((this.x - a.x) * (this.x - a.x) +
            (this.y - a.y) * (this.y - a.y) +
            (this.z - a.z) * (this.z - a.z));
    }

    dotProduct(a: Vector): number {
        return a.x * this.x + a.y * this.y + a.z * this.z;
    }

    //Careful for order ! A*B is NOT B*A
    crossProduct(b: Vector): Vector {
        let res = new Vector();
        res.x = this.y * b.z - this.z * b.y;
        res.y = this.z * b.x - this.x * b.z;
        res.z = this.x * b.y - this.y * b.x;
        return res;
    }

    //Round values for use in arrays, ZBuffer, and 2D space overall 
    round(){
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.z = Math.round(this.z);
    }


}