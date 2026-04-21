import { useEffect, useRef } from 'react';

interface FloatingLinesProps {
  className?: string;
  lineColor?: string;
  lineWidth?: number;
  lineCount?: number;
  speed?: number;
}

export const FloatingLines = ({
  className = '',
  lineColor = 'rgba(59, 130, 246, 0.3)',
  lineWidth = 1,
  lineCount = 50,
  speed = 0.5,
}: FloatingLinesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Line class
    class Line {
      x: number;
      y: number;
      length: number;
      angle: number;
      speed: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.length = Math.random() * 100 + 50;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = (Math.random() * 0.5 + 0.2) * speed;
        this.opacity = Math.random() * 0.5 + 0.3;
      }

      update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        // Wrap around screen
        if (this.x < -this.length) this.x = canvas.width + this.length;
        if (this.x > canvas.width + this.length) this.x = -this.length;
        if (this.y < -this.length) this.y = canvas.height + this.length;
        if (this.y > canvas.height + this.length) this.y = -this.length;
      }

      draw() {
        if (!ctx) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        ctx.strokeStyle = lineColor.replace('0.3', String(this.opacity));
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.length, 0);
        ctx.stroke();
        
        ctx.restore();
      }
    }

    // Create lines
    const lines: Line[] = [];
    for (let i = 0; i < lineCount; i++) {
      lines.push(new Line());
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      lines.forEach(line => {
        line.update();
        line.draw();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [lineColor, lineWidth, lineCount, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};

export default FloatingLines;
