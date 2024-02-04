import { Color } from "./Color";
import { Vector } from "./Vector";

export class Triangle{
    p: Vector[] = [];
    color!: Color;
    
    constructor(a = new Vector(), b = new Vector(), c = new Vector(), color = new Color()){
         this.p.push(a);
         this.p.push(b);
         this.p.push(c);
         this.color = color;
    }

   

}