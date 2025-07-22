export interface TouchPoint {
  x: number;
  y: number;
  id: number;
}

export class InputManager {
  private canvas: HTMLCanvasElement;
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private isMouseDown: boolean = false;
  private touchPoints: TouchPoint[] = [];
  private callbacks: {
    onPointerDown: ((x: number, y: number) => void)[];
    onPointerMove: ((x: number, y: number) => void)[];
    onPointerUp: ((x: number, y: number) => void)[];
    onGesture: ((gesture: string, data: any) => void)[];
    onMouseInteraction: ((x: number, y: number, isActive: boolean) => void)[];
  } = {
    onPointerDown: [],
    onPointerMove: [],
    onPointerUp: [],
    onGesture: [],
    onMouseInteraction: []
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));

    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.canvas.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });

    // Prevent context menu
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private getCanvasPosition(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  private handleMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.isMouseDown = true;
    const pos = this.getCanvasPosition(event.clientX, event.clientY);
    this.mousePosition = pos;
    
    this.callbacks.onPointerDown.forEach(callback => callback(pos.x, pos.y));
  }

  private handleMouseMove(event: MouseEvent): void {
    const pos = this.getCanvasPosition(event.clientX, event.clientY);
    this.mousePosition = pos;

    this.callbacks.onPointerMove.forEach(callback => callback(pos.x, pos.y));
    this.callbacks.onMouseInteraction.forEach(callback => callback(pos.x, pos.y, this.isMouseDown));
  }

  private handleMouseUp(event: MouseEvent): void {
    if (this.isMouseDown) {
      this.isMouseDown = false;
      const pos = this.getCanvasPosition(event.clientX, event.clientY);

      this.callbacks.onPointerUp.forEach(callback => callback(pos.x, pos.y));
      this.callbacks.onMouseInteraction.forEach(callback => callback(pos.x, pos.y, false));
    }
  }

  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const pos = this.getCanvasPosition(touch.clientX, touch.clientY);
      
      this.touchPoints.push({
        x: pos.x,
        y: pos.y,
        id: touch.identifier
      });
      
      this.callbacks.onPointerDown.forEach(callback => callback(pos.x, pos.y));
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const pos = this.getCanvasPosition(touch.clientX, touch.clientY);
      
      // Update existing touch point
      const touchPoint = this.touchPoints.find(tp => tp.id === touch.identifier);
      if (touchPoint) {
        touchPoint.x = pos.x;
        touchPoint.y = pos.y;
      }
      
      this.callbacks.onPointerMove.forEach(callback => callback(pos.x, pos.y));
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const pos = this.getCanvasPosition(touch.clientX, touch.clientY);
      
      // Remove touch point
      this.touchPoints = this.touchPoints.filter(tp => tp.id !== touch.identifier);
      
      this.callbacks.onPointerUp.forEach(callback => callback(pos.x, pos.y));
    }
  }

  public onPointerDown(callback: (x: number, y: number) => void): void {
    this.callbacks.onPointerDown.push(callback);
  }

  public onPointerMove(callback: (x: number, y: number) => void): void {
    this.callbacks.onPointerMove.push(callback);
  }

  public onPointerUp(callback: (x: number, y: number) => void): void {
    this.callbacks.onPointerUp.push(callback);
  }

  public onGesture(callback: (gesture: string, data: any) => void): void {
    this.callbacks.onGesture.push(callback);
  }

  public onMouseInteraction(callback: (x: number, y: number, isActive: boolean) => void): void {
    this.callbacks.onMouseInteraction.push(callback);
  }

  public getMousePosition(): { x: number; y: number } {
    return this.mousePosition;
  }

  public isPointerDown(): boolean {
    return this.isMouseDown || this.touchPoints.length > 0;
  }

  public getTouchPoints(): TouchPoint[] {
    return [...this.touchPoints];
  }

  public getActivePointers(): { x: number; y: number }[] {
    const pointers: { x: number; y: number }[] = [];
    
    if (this.isMouseDown) {
      pointers.push(this.mousePosition);
    }
    
    pointers.push(...this.touchPoints.map(tp => ({ x: tp.x, y: tp.y })));
    
    return pointers;
  }
}
