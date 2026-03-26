class Shape {
    constructor(color) { this.color = color; }
    getArea() { return 0; }
}

class Circle extends Shape {
    constructor(color, radius) {
        super(color);
        this.radius = radius;
    }
    getArea() { return Math.PI * this.radius ** 2; }
}

class Rectangle extends Shape {
    constructor(color, w, h) {
        super(color);
        this.w = w; this.h = h;
    }
    getArea() { return this.w * this.h; }
}