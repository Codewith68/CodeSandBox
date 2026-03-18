import { useNavigate } from "react-router-dom";
import { useCreateProject } from "../hooks/apis/mutations/useCreateProject";
import { useState, useEffect, useRef, useCallback } from "react";
import "./CreateProject.css";

// ── Particle Canvas Component ───────────────────────────
const ParticleCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        let animationId;
        let particles = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resize();
        window.addEventListener("resize", resize);

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.speedY = (Math.random() - 0.5) * 0.4;
                this.opacity = Math.random() * 0.5 + 0.1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
                ctx.fill();
            }
        }

        const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const drawLines = () => {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(99, 102, 241, ${0.06 * (1 - dist / 150)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                p.update();
                p.draw();
            });
            drawLines();
            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return <canvas ref={canvasRef} className="particle-canvas" />;
};

// ── Typewriter Hook ─────────────────────────────────────
const useTypewriter = (phrases, typingSpeed = 80, deletingSpeed = 40, pauseTime = 2000) => {
    const [text, setText] = useState("");
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentPhrase = phrases[phraseIndex];
        let timeout;

        if (!isDeleting && text === currentPhrase) {
            timeout = setTimeout(() => setIsDeleting(true), pauseTime);
        } else if (isDeleting && text === "") {
            setIsDeleting(false);
            setPhraseIndex((prev) => (prev + 1) % phrases.length);
        } else {
            timeout = setTimeout(() => {
                setText(currentPhrase.substring(0, text.length + (isDeleting ? -1 : 1)));
            }, isDeleting ? deletingSpeed : typingSpeed);
        }

        return () => clearTimeout(timeout);
    }, [text, isDeleting, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseTime]);

    return text;
};

// ── Main Component ──────────────────────────────────────
export const CreateProject = () => {
    const { createProjectMutation } = useCreateProject();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const typedText = useTypewriter([
        "Write code instantly in the cloud.",
        "No setup. No downloads. Just code.",
        "Spin up a React app in seconds.",
        "Docker-powered sandboxed environments.",
    ]);

    const handleCreateProject = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await createProjectMutation();
            navigate(`/project/${response.data}`);
        } catch (error) {
            console.error("Error creating project:", error);
        } finally {
            setIsLoading(false);
        }
    }, [createProjectMutation, navigate]);

    return (
        <div className="landing-page">
            {/* Animated Background */}
            <ParticleCanvas />
            <div className="gradient-orbs">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />
            </div>

            {/* Navigation */}
            <nav className="landing-nav">
                <div className="nav-brand">
                    <div className="nav-logo">⚡</div>
                    <div className="nav-title">
                        Code<span>Forge</span>
                    </div>
                </div>
                <div className="nav-links">
                    <span className="nav-link">Features</span>
                    <span className="nav-link">Docs</span>
                    <a
                        className="nav-github"
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        ★ GitHub
                    </a>
                </div>
            </nav>

            {/* Hero */}
            <section className="hero-section">
                <div className="hero-badge">
                    <span className="badge-dot" />
                    Cloud IDE — Now in Beta
                </div>

                <h1 className="hero-title">
                    <span className="white-text">Build Faster with</span>
                    <br />
                    <span className="gradient-text">Cloud Development</span>
                </h1>

                <p className="hero-subtitle">
                    <span className="typewriter-line">{typedText}</span>
                    <span className="typewriter-cursor" />
                </p>

                <div className="cta-group">
                    <button
                        className="cta-primary"
                        onClick={handleCreateProject}
                        disabled={isLoading}
                        id="create-playground-btn"
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner" />
                                <span>Starting Environment...</span>
                            </>
                        ) : (
                            <>
                                <span>🚀</span>
                                <span>Create Playground</span>
                            </>
                        )}
                    </button>
                    <a className="cta-secondary" href="#features">
                        Learn More ↓
                    </a>
                </div>

                {/* Code Preview */}
                <div className="code-preview-wrapper">
                    <div className="code-preview">
                        <div className="code-preview-header">
                            <span className="window-dot red" />
                            <span className="window-dot yellow" />
                            <span className="window-dot green" />
                            <span className="code-preview-tab">App.jsx</span>
                        </div>
                        <div className="code-preview-body">
                            <div className="code-line">
                                <span className="line-number">1</span>
                                <span>
                                    <span className="code-keyword">import</span>{" "}
                                    <span className="code-component">React</span>{" "}
                                    <span className="code-keyword">from</span>{" "}
                                    <span className="code-string">'react'</span>
                                </span>
                            </div>
                            <div className="code-line">
                                <span className="line-number">2</span>
                                <span></span>
                            </div>
                            <div className="code-line">
                                <span className="line-number">3</span>
                                <span>
                                    <span className="code-keyword">export default function</span>{" "}
                                    <span className="code-function">App</span>
                                    <span className="code-bracket">() {"{"}</span>
                                </span>
                            </div>
                            <div className="code-line">
                                <span className="line-number">4</span>
                                <span>
                                    {"  "}
                                    <span className="code-keyword">return</span>{" "}
                                    <span className="code-bracket">(</span>
                                </span>
                            </div>
                            <div className="code-line">
                                <span className="line-number">5</span>
                                <span>
                                    {"    "}
                                    <span className="code-component">{"<h1>"}</span>
                                    <span className="code-string">Hello, CodeForge!</span>
                                    <span className="code-component">{"</h1>"}</span>
                                </span>
                            </div>
                            <div className="code-line">
                                <span className="line-number">6</span>
                                <span>
                                    {"  "}
                                    <span className="code-bracket">)</span>
                                </span>
                            </div>
                            <div className="code-line">
                                <span className="line-number">7</span>
                                <span>
                                    <span className="code-bracket">{"}"}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="code-glow" />
                </div>
            </section>

            {/* Features */}
            <section className="features-section" id="features">
                <div className="features-section-title">Why CodeForge?</div>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon-wrapper purple">⚡</div>
                        <div className="feature-card-title">Instant Boot</div>
                        <div className="feature-card-desc">
                            Docker-powered containers spin up in seconds. No local setup, no
                            dependency hell — just open and code.
                        </div>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon-wrapper cyan">🔄</div>
                        <div className="feature-card-title">Real-Time Sync</div>
                        <div className="feature-card-desc">
                            WebSocket-powered live editing with instant file sync. Every change
                            reflects immediately in the browser preview.
                        </div>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon-wrapper pink">🖥️</div>
                        <div className="feature-card-title">Full IDE Experience</div>
                        <div className="feature-card-desc">
                            Monaco editor, integrated terminal, file explorer, and live browser
                            preview — a complete development studio in your browser.
                        </div>
                    </div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="tech-stack-section">
                <div className="tech-stack-title">Built With Modern Technology</div>
                <div className="tech-stack-grid">
                    <div className="tech-item">
                        <div className="tech-icon">⚛️</div>
                        <span className="tech-label">React 19</span>
                    </div>
                    <div className="tech-item">
                        <div className="tech-icon">🟢</div>
                        <span className="tech-label">Node.js</span>
                    </div>
                    <div className="tech-item">
                        <div className="tech-icon">🐳</div>
                        <span className="tech-label">Docker</span>
                    </div>
                    <div className="tech-item">
                        <div className="tech-icon">🔌</div>
                        <span className="tech-label">WebSocket</span>
                    </div>
                    <div className="tech-item">
                        <div className="tech-icon">📝</div>
                        <span className="tech-label">Monaco</span>
                    </div>
                    <div className="tech-item">
                        <div className="tech-icon">⚡</div>
                        <span className="tech-label">Vite</span>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                CodeForge © {new Date().getFullYear()} — Cloud IDE for Modern Developers
            </footer>
        </div>
    );
};
