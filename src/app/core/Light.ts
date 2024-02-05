import { Vector } from "./Vector";

export class Light {

    // 0 to 255 (like canvas functions)
    red!: number;
    green!: number;
    blue!: number;

    intensity!: number;

    pos!: Vector;

    //White on default, light coming from right 
    constructor(red = 255, green = 255, blue = 255, intensity = 100, pos = new Vector(1,0,0)) {
        this.red = red;
        this.green = green;
        this.blue = blue;
    }

}