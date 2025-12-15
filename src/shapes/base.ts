import { Modes } from "../types";

export abstract class Shape {
    readonly id: string;
    abstract readonly type: Modes;

    constructor(id: string) {
        this.id = id;
    }

    abstract draw(canvas: HTMLCanvasElement): void;

    abstract hitTest(x: number, y: number, canvas: HTMLCanvasElement): boolean;

    abstract updateShape(x: number, y: number): void;
}
