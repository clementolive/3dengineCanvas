export class Color {

    // 0 to 255 (like canvas functions)
    red!: number;
    green!: number;
    blue!: number;

    //Grey on default 
    constructor(red = 0, green = 0, blue = 16) {
        this.red = red;
        this.green = green;
        this.blue = blue;
    }

    toStrokeStyle() {
        return "rgb(" +
            this.red + "," +
            this.green + "," +
            this.blue + ")";
    }

    setColor(red: number, green: number, blue: number){
        this.red = red;
        this.green = green;
        this.blue = blue;
    }
    
    addColor(red: number, green: number, blue: number){
        this.red *= red;
        this.green *= green;
        this.blue *= blue;
    }


}