import { Application, Assets, Graphics } from 'pixi.js';

(async () => {
    // Create and initialize the application
    const app = new Application();
    
    await app.init({ 
        background: '#1a1a1a', 
        resizeTo: window 
    });

    // Add canvas to document body
    document.body.appendChild(app.canvas);

    // Create a simple red square
    const testShape = new Graphics()
        .rect(0, 0, 100, 100)
        .fill({ color: 0xFF0000 });
    
    // Center the shape
    testShape.x = app.screen.width / 2 - 50;
    testShape.y = app.screen.height / 2 - 50;

    // Add to stage
    app.stage.addChild(testShape);

    // Add rotation animation
    app.ticker.add((time) => {
        testShape.rotation += 0.1 * time.deltaTime;
    });
})();