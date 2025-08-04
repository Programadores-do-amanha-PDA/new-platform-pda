import React, { useEffect, useRef } from 'react';

interface BinaryRainBackgroundProps {
  className?: string;
  speed?: number;
  density?: number;
  opacity?: number;
  color?: string;
  background?: string;
  trailLength?: number;
}

const BinaryRainBackground: React.FC<BinaryRainBackgroundProps> = ({
  className = '',
  speed = 50,
  density = 0.8,
  opacity = 0.6,
  color = '#00ff00',
  background = 'bg-transparent',
  trailLength = 15
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const columnsRef = useRef<{
    y: number;
    targetHeight: number;
    isComplete: boolean;
    completionProgress: number;
    characters: string[];
  }[]>([]);
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fontSize = 14;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Função de inicialização das colunas
    const initColumns = () => {
      const columnCount = Math.floor(canvas.width / fontSize);
      
      columnsRef.current = Array(columnCount).fill(0).map(() => {
        const targetHeight = canvas.height * (0.4 + Math.random() * 0.4);
        const totalChars = Math.ceil(canvas.height / fontSize);
        
        return {
          y: Math.random() * -fontSize * 3,
          targetHeight,
          isComplete: false,
          completionProgress: 0,
          characters: Array(totalChars).fill(0).map(() => Math.random() > 0.5 ? '1' : '0')
        };
      });
    };

    // Função de redimensionamento com debounce
    const resizeCanvas = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = setTimeout(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initColumns();
        
        // Reinicia a animação
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        animate();
      }, 100);
    };

    // Configuração inicial
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initColumns();
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = 'top';

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < columnsRef.current.length; i++) {
        const column = columnsRef.current[i];
        const x = i * fontSize;

        if (!column.isComplete) {
          column.y += 3;
          if (column.y >= column.targetHeight) {
            column.isComplete = true;
          }

          // Desenha trilha fixa
          const maxDrawnY = Math.min(column.y, column.targetHeight);
          const maxLines = Math.floor(maxDrawnY / fontSize);
          
          for (let lineIndex = 0; lineIndex < maxLines; lineIndex++) {
            const y = lineIndex * fontSize;
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            const char = column.characters[lineIndex % column.characters.length];
            ctx.fillText(char, x, y);
          }

          // Desenha trilha móvel
          for (let j = 0; j < trailLength; j++) {
            const y = column.y - j * fontSize;
            if (y < 0 || y > canvas.height) continue;

            let trailOpacity = opacity * (1 - j / trailLength);
            if (j === 0) trailOpacity = Math.min(1, trailOpacity + 0.6);

            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${trailOpacity})`;
            const char = Math.random() > 0.5 ? '1' : '0';
            ctx.fillText(char, x, y);
          }
        } else {
          // Desenha coluna completa
          const maxLines = Math.floor(column.targetHeight / fontSize);
          for (let lineIndex = 0; lineIndex < maxLines; lineIndex++) {
            const y = lineIndex * fontSize;
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            const char = column.characters[lineIndex % column.characters.length];
            ctx.fillText(char, x, y);
          }
        }
      }
    };

    const animate = () => {
      draw();
      animationRef.current = requestAnimationFrame(() => {
        setTimeout(animate, 1000 / speed);
      });
    };

    animate();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [speed, density, opacity, color, trailLength]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${background} ${className}`}
    />
  );
};

export default BinaryRainBackground;