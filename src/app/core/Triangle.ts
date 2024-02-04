import { Vector } from "./Vector";

export class Triangle{
    p: Vector[] = [];
    color!: string;

    constructor(){
         this.p.push(new Vector());
         this.p.push(new Vector());
         this.p.push(new Vector());
         this.color = "#009900";
    }

}