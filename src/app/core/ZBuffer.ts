export class ZBuffer {
    height!: number;
    width!: number;
    buffer: number[] = [];

    constructor(height: number, width: number) {
        this.height = height; 
        this.width = width; 
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                this.buffer.push(999999999);
            }
        }
    }

    reset(){
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                this.buffer[i*this.height+j] = 999999999;
            }
        }
    }

}