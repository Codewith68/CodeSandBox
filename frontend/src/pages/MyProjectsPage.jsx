import { useNavigate, Link } from "react-router-dom";
import { useGetUserProjects } from "../hooks/apis/queries/useGetUserProjects";
import { useOpenProject } from "../hooks/apis/mutations/useOpenProject";
import { useDeleteProject } from "../hooks/apis/mutations/useDeleteProject";
import { useState, useCallback, useEffect } from "react";
import useAuthStore from "../store/authStore";
import { useLogout } from "../hooks/apis/mutations/useLogout";
import "./MyProjectsPage.css";

/* ── Custom SVG Icons ─────────────────────────────────── */
const ReactIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#61dafb" strokeWidth="1.5">
        <circle cx="12" cy="12" r="2.5" fill="#61dafb" stroke="none" />
        <ellipse cx="12" cy="12" rx="10" ry="4" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
    </svg>
);

const CloudIcon = () => (
    <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 14.5h7a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 3.5 9a3.5 3.5 0 0 0 3 5.5z" />
    </svg>
);

const CalendarIcon = () => (
    <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="14" height="14" rx="2" />
        <line x1="3" y1="8" x2="17" y2="8" />
        <line x1="7" y1="2" x2="7" y2="5" />
        <line x1="13" y1="2" x2="13" y2="5" />
    </svg>
);

const PlayIcon = () => (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="6,3 18,10 6,17" fill="currentColor" stroke="none" />
    </svg>
);

const TrashIcon = () => (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5h12M8 5V3h4v2M6 5v11a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V5" />
        <line x1="9" y1="8" x2="9" y2="14" />
        <line x1="11" y1="8" x2="11" y2="14" />
    </svg>
);

const PlusIcon = () => (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="10" y1="4" x2="10" y2="16" />
        <line x1="4" y1="10" x2="16" y2="10" />
    </svg>
);

const EmptyProjectsIllustration = () => (
    <svg viewBox="0 0 200 160" width="200" height="160" fill="none" className="empty-illustration">
        {/* Monitor */}
        <rect x="40" y="20" width="120" height="85" rx="8" stroke="rgba(99,102,241,0.3)" strokeWidth="2" />
        <rect x="48" y="28" width="104" height="65" rx="4" fill="rgba(99,102,241,0.06)" />
        {/* Code lines */}
        <rect x="56" y="38" width="40" height="4" rx="2" fill="rgba(99,102,241,0.25)" />
        <rect x="56" y="48" width="60" height="4" rx="2" fill="rgba(139,92,246,0.2)" />
        <rect x="56" y="58" width="35" height="4" rx="2" fill="rgba(99,102,241,0.15)" />
        <rect x="56" y="68" width="55" height="4" rx="2" fill="rgba(168,85,247,0.2)" />
        <rect x="56" y="78" width="25" height="4" rx="2" fill="rgba(99,102,241,0.15)" />
        {/* Cursor blink */}
        <rect x="81" y="78" width="2" height="6" rx="1" fill="#6366f1" className="cursor-blink" />
        {/* Stand */}
        <rect x="85" y="105" width="30" height="6" rx="1" fill="rgba(99,102,241,0.15)" />
        <rect x="75" y="111" width="50" height="4" rx="2" fill="rgba(99,102,241,0.1)" />
        {/* Plus icon floating */}
        <circle cx="160" cy="40" r="14" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" className="float-anim" />
        <line x1="160" y1="34" x2="160" y2="46" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
        <line x1="154" y1="40" x2="166" y2="40" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/* ── Floating Code Symbols ────────────────────────────── */
const FloatingSymbols = () => {
    const symbols = ['</', '/>', '{ }', '( )', '[ ]', '=>', '&&', '||', '++', '::'];
    return (
        <div className="floating-symbols">
            {symbols.map((sym, i) => (
                <span
                    key={i}
                    className="floating-sym"
                    style={{
                        left: `${8 + (i * 9.5) % 90}%`,
                        animationDelay: `${i * 1.7}s`,
                        animationDuration: `${18 + (i % 4) * 5}s`,
                    }}
                >
                    {sym}
                </span>
            ))}
        </div>
    );
};

export const MyProjectsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { logoutMutation } = useLogout();
    const { projects, isLoading, isError, refetch } = useGetUserProjects();
    const { openProjectMutation } = useOpenProject();
    const { deleteProjectMutation, isPending: isDeleting } = useDeleteProject();
    const [openingProjectId, setOpeningProjectId] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(t);
    }, []);

    const handleOpenProject = useCallback(
        async (project) => {
            setOpeningProjectId(project.projectId);
            try {
                await openProjectMutation({ projectId: project.projectId });
                navigate(`/project/${project.projectId}`, { state: { projectName: project.name } });
            } catch (error) {
                console.error("Failed to open project:", error);
                setOpeningProjectId(null);
            }
        },
        [openProjectMutation, navigate]
    );

    const handleDeleteProject = useCallback(
        async (projectId) => {
            try {
                await deleteProjectMutation({ projectId });
                setDeleteConfirmId(null);
            } catch (error) {
                console.error("Failed to delete project:", error);
            }
        },
        [deleteProjectMutation]
    );

    const handleLogout = useCallback(async () => {
        try {
            await logoutMutation();
            setShowUserMenu(false);
        } catch (error) {
            console.error("Error logging out:", error);
        }
    }, [logoutMutation]);

    const formatDate = (dateStr) => {
        if (!dateStr) return "Never";
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
        });
    };

    return (
        <div className={`my-projects-page ${mounted ? "mounted" : ""}`}>
            {/* Animated Background */}
            <div className="projects-bg">
                <div className="bg-orb bg-orb-1" />
                <div className="bg-orb bg-orb-2" />
                <div className="bg-orb bg-orb-3" />
                <FloatingSymbols />
            </div>

            {/* Nav */}
            <nav className="projects-nav">
                <Link to="/" className="nav-brand">
                    <div className="nav-logo-icon">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#bolt-grad)" stroke="none" />
                            <defs>
                                <linearGradient id="bolt-grad" x1="3" y1="2" x2="22" y2="22">
                                    <stop offset="0%" stopColor="#818cf8" />
                                    <stop offset="100%" stopColor="#c084fc" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div className="nav-title">
                        Code<span>Forge</span>
                    </div>
                </Link>
                <div className="nav-right">
                    <div className="nav-user-area" onMouseLeave={() => setShowUserMenu(false)}>
                        <button className="nav-avatar-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                            <img src={user?.avatar} alt={user?.username} className="nav-avatar-img" />
                            <span className="avatar-ring" />
                        </button>
                        {showUserMenu && (
                            <div className="nav-user-menu">
                                <div className="nav-user-info">
                                    <div className="nav-user-name">{user?.username}</div>
                                    <div className="nav-user-email">{user?.email}</div>
                                </div>
                                <div className="nav-menu-divider" />
                                <button className="nav-logout-btn" onClick={handleLogout}>
                                    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M7 17H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3M14 14l4-4-4-4M8 10h10" />
                                    </svg>
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="projects-main">
                <div className="projects-header">
                    <div className="header-text">
                        <h1 className="projects-title">My Projects</h1>
                        <p className="projects-subtitle">
                            {projects.length > 0
                                ? `${projects.length} project${projects.length !== 1 ? "s" : ""} in your workspace`
                                : "Your workspace is empty — start building something amazing"}
                        </p>
                    </div>
                    <Link to="/" className="new-project-btn">
                        <PlusIcon />
                        <span>New Project</span>
                    </Link>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="projects-loading">
                        <div className="loading-orbit">
                            <div className="orbit-ring" />
                            <div className="orbit-dot" />
                        </div>
                        <span>Loading your workspace...</span>
                    </div>
                )}

                {/* Error State */}
                {isError && (
                    <div className="projects-error">
                        <div className="error-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                        </div>
                        <span>Failed to load projects</span>
                        <button onClick={refetch} className="retry-btn">Retry</button>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && projects.length === 0 && (
                    <div className="projects-empty">
                        <EmptyProjectsIllustration />
                        <h2>No projects yet</h2>
                        <p>Create your first cloud development environment and start coding in seconds</p>
                        <Link to="/" className="empty-cta">
                            <PlusIcon />
                            <span>Create Your First Project</span>
                        </Link>
                    </div>
                )}

                {/* Projects Grid */}
                {!isLoading && projects.length > 0 && (
                    <div className="projects-grid">
                        {projects.map((project, index) => {
                            const isOpening = openingProjectId === project.projectId;
                            const isConfirmingDelete = deleteConfirmId === project.projectId;

                            return (
                                <div
                                    key={project.projectId}
                                    className="project-card"
                                    style={{ animationDelay: `${index * 0.08}s` }}
                                >
                                    {/* Card glow effect */}
                                    <div className="card-glow" />

                                    {/* Decorative code corner */}
                                    <div className="card-code-deco">
                                        <span>{'<'}</span>
                                        <span>{'/'}</span>
                                        <span>{'>'}</span>
                                    </div>

                                    <div className="project-card-header">
                                        <div className="project-template-badge">
                                            <ReactIcon />
                                            <span>{project.template || "React"}</span>
                                        </div>
                                        {project.isActive && (
                                            <div className="project-active-badge">
                                                <span className="active-dot" />
                                                <span>Live</span>
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="project-name">{project.name}</h3>

                                    {project.description && (
                                        <p className="project-description">{project.description}</p>
                                    )}

                                    <div className="project-meta">
                                        <span className="project-meta-item">
                                            <CalendarIcon />
                                            {formatDate(project.createdAt)}
                                        </span>
                                        {project.lastSyncedAt && (
                                            <span className="project-meta-item synced">
                                                <CloudIcon />
                                                {formatDate(project.lastSyncedAt)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="project-actions">
                                        <button
                                            className="project-open-btn"
                                            onClick={() => handleOpenProject(project)}
                                            disabled={isOpening}
                                        >
                                            {isOpening ? (
                                                <>
                                                    <span className="btn-spinner" />
                                                    <span>Restoring...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <PlayIcon />
                                                    <span>Open</span>
                                                </>
                                            )}
                                        </button>

                                        {isConfirmingDelete ? (
                                            <div className="delete-confirm">
                                                <button
                                                    className="delete-confirm-yes"
                                                    onClick={() => handleDeleteProject(project.projectId)}
                                                    disabled={isDeleting}
                                                >
                                                    {isDeleting ? "..." : "Delete"}
                                                </button>
                                                <button
                                                    className="delete-confirm-no"
                                                    onClick={() => setDeleteConfirmId(null)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                className="project-delete-btn"
                                                onClick={() => setDeleteConfirmId(project.projectId)}
                                                title="Delete project"
                                            >
                                                <TrashIcon />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};
