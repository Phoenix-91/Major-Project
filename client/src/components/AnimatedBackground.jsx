import { useEffect, useRef } from 'react';
import { useTheme } from './ThemeProvider';

export const AnimatedBackground = () => {
    const canvasRef = useRef(null);
    const { theme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];
        let gradientOffset = 0;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        if (theme === 'dark') {
            // Dark mode: Particle animation
            class Particle {
                constructor() {
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                    this.size = Math.random() * 2 + 1;
                    this.speedX = Math.random() * 0.5 - 0.25;
                    this.speedY = Math.random() * 0.5 - 0.25;
                    this.opacity = Math.random() * 0.5 + 0.2;
                }

                update() {
                    this.x += this.speedX;
                    this.y += this.speedY;

                    if (this.x > canvas.width) this.x = 0;
                    if (this.x < 0) this.x = canvas.width;
                    if (this.y > canvas.height) this.y = 0;
                    if (this.y < 0) this.y = canvas.height;
                }

                draw() {
                    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Initialize particles
            const initParticles = () => {
                particles = [];
                const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
                for (let i = 0; i < particleCount; i++) {
                    particles.push(new Particle());
                }
            };
            initParticles();

            // Animation loop for dark mode
            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw gradient background
                const gradient = ctx.createRadialGradient(
                    canvas.width / 2,
                    canvas.height / 2,
                    0,
                    canvas.width / 2,
                    canvas.height / 2,
                    canvas.width / 2
                );
                gradient.addColorStop(0, 'rgba(10, 10, 20, 1)');
                gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Update and draw particles
                particles.forEach(particle => {
                    particle.update();
                    particle.draw();
                });

                // Draw connections
                particles.forEach((p1, i) => {
                    particles.slice(i + 1).forEach(p2 => {
                        const dx = p1.x - p2.x;
                        const dy = p1.y - p2.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < 100) {
                            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 100)})`;
                            ctx.lineWidth = 0.5;
                            ctx.beginPath();
                            ctx.moveTo(p1.x, p1.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.stroke();
                        }
                    });
                });

                animationFrameId = requestAnimationFrame(animate);
            };

            animate();
        } else {
            // Light mode: Animated gradient mesh
            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Create animated gradient mesh
                gradientOffset += 0.001;

                // Background gradient
                const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                bgGradient.addColorStop(0, '#ffffff');
                bgGradient.addColorStop(1, '#f8f9fa');
                ctx.fillStyle = bgGradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Animated gradient blobs
                const drawBlob = (x, y, radius, color1, color2) => {
                    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
                    gradient.addColorStop(0, color1);
                    gradient.addColorStop(1, color2);
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.fill();
                };

                // Blob 1 - Purple
                const blob1X = canvas.width * 0.2 + Math.sin(gradientOffset * 2) * 150;
                const blob1Y = canvas.height * 0.3 + Math.cos(gradientOffset * 1.5) * 150;
                drawBlob(blob1X, blob1Y, 400, 'rgba(168, 85, 247, 0.25)', 'rgba(168, 85, 247, 0)');

                // Blob 2 - Blue
                const blob2X = canvas.width * 0.8 + Math.cos(gradientOffset * 1.8) * 150;
                const blob2Y = canvas.height * 0.6 + Math.sin(gradientOffset * 2.2) * 120;
                drawBlob(blob2X, blob2Y, 450, 'rgba(59, 130, 246, 0.25)', 'rgba(59, 130, 246, 0)');

                // Blob 3 - Pink
                const blob3X = canvas.width * 0.5 + Math.sin(gradientOffset * 1.3) * 130;
                const blob3Y = canvas.height * 0.8 + Math.cos(gradientOffset * 1.7) * 140;
                drawBlob(blob3X, blob3Y, 380, 'rgba(236, 72, 153, 0.20)', 'rgba(236, 72, 153, 0)');

                // Blob 4 - Cyan (extra blob for more color)
                const blob4X = canvas.width * 0.6 + Math.cos(gradientOffset * 2.5) * 100;
                const blob4Y = canvas.height * 0.4 + Math.sin(gradientOffset * 1.8) * 100;
                drawBlob(blob4X, blob4Y, 320, 'rgba(34, 211, 238, 0.18)', 'rgba(34, 211, 238, 0)');

                animationFrameId = requestAnimationFrame(animate);
            };

            animate();
        }

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10"
            style={{ background: theme === 'dark' ? '#000' : '#fff' }}
        />
    );
};
