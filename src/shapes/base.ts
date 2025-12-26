import { Bounds, Modes, ResizeCtx } from "../types";

export abstract class Shape {
    readonly id: string;
    abstract readonly type: Modes;

    deletionScheduled: boolean = false;

    constructor(id: string) {
        this.id = id;
    }

    abstract draw(canvas: HTMLCanvasElement): void;

    abstract hitTest(x: number, y: number, canvas: HTMLCanvasElement): boolean;

    abstract updateShape(x: number, y: number): void;

    abstract getBounds(): Bounds;

    abstract translate(dx: number, dy: number): void;

    getResizeSnapshot(): any {
        return { bounds: this.getBounds() };
    }

    resizeFromHandle(_: ResizeCtx): void {}
}
