import { useNavigate, Link } from "react-router-dom";
import { useCreateProject } from "../hooks/apis/mutations/useCreateProject";
import { useState, useEffect, useRef, useCallback } from "react";
import useAuthStore from "../store/authStore";
import { useLogout } from "../hooks/apis/mutations/useLogout";
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
    const { isAuthenticated, user } = useAuthStore();
    const { logoutMutation } = useLogout();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const typedText = useTypewriter([
        "Write code instantly in the cloud.",
        "No setup. No downloads. Just code.",
        "Spin up a React app in seconds.",
        "Docker-powered sandboxed environments.",
    ]);

    const handleCreateProject = useCallback(async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setIsLoading(true);
        try {
            const response = await createProjectMutation();
            navigate(`/project/${response.data}`);
        } catch (error) {
            console.error("Error creating project:", error);
        } finally {
            setIsLoading(false);
        }
    }, [createProjectMutation, navigate, isAuthenticated]);

    const handleLogout = useCallback(async () => {
        try {
            await logoutMutation();
            setShowUserMenu(false);
        } catch (error) {
            console.error("Error logging out:", error);
        }
    }, [logoutMutation]);

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
                    <a className="nav-link" href="#features">Features</a>
                    <span className="nav-link">Docs</span>
                    {isAuthenticated ? (
                        <div
                            className="nav-user-area"
                            style={{ position: 'relative' }}
                            onMouseLeave={() => setShowUserMenu(false)}
                        >
                            <button
                                className="nav-avatar-btn"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                style={{
                                    background: 'none',
                                    border: '2px solid rgba(99, 102, 241, 0.4)',
                                    borderRadius: '50%',
                                    padding: '2px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <img
                                    src={user?.avatar}
                                    alt={user?.username}
                                    style={{
                                        width: '34px',
                                        height: '34px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        pointerEvents: 'none',
                                    }}
                                />
                            </button>
                            {showUserMenu && (
                                <div
                                    className="nav-user-menu"
                                    style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 8px)',
                                        right: 0,
                                        minWidth: '200px',
                                        background: 'rgba(15, 17, 23, 0.95)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        padding: '0.5rem',
                                        backdropFilter: 'blur(20px)',
                                        boxShadow: '0 15px 40px rgba(0,0,0,0.5)',
                                        animation: 'fadeIn 0.2s ease-out',
                                        zIndex: 100,
                                    }}
                                >
                                    <div style={{
                                        padding: '0.75rem 1rem',
                                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                                        marginBottom: '0.35rem',
                                    }}>
                                        <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>
                                            {user?.username}
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
                                            {user?.email}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            width: '100%',
                                            padding: '0.6rem 1rem',
                                            background: 'none',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#ef4444',
                                            fontSize: '0.88rem',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'background 0.2s',
                                            fontFamily: 'inherit',
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = 'rgba(239,68,68,0.08)'}
                                        onMouseLeave={(e) => e.target.style.background = 'none'}
                                    >
                                        🚪 Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Sign In</Link>
                            <Link to="/register" className="nav-github">Get Started</Link>
                        </>
                    )}
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
