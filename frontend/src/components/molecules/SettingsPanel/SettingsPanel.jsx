import { useSettingsStore, AVAILABLE_THEMES } from "../../../store/settingsStore";
import "./SettingsPanel.css";

export const SettingsPanel = () => {
    const {
        settingsPanelOpen,
        toggleSettingsPanel,
        fontSize,
        wordWrap,
        minimap,
        fontLigatures,
        lineNumbers,
        tabSize,
        autoSave,
        autoSaveDelay,
        theme,
        updateSetting,
        setTheme,
        resetSettings,
    } = useSettingsStore();

    if (!settingsPanelOpen) return null;

    return (
        <div className="settings-overlay" onClick={toggleSettingsPanel}>
            <div
                className="settings-panel"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="settings-header">
                    <div className="settings-header-left">
                        <span className="settings-header-icon">⚙️</span>
                        <h2 className="settings-title">Settings</h2>
                    </div>
                    <button
                        className="settings-close-btn"
                        onClick={toggleSettingsPanel}
                        title="Close (Escape)"
                    >
                        ✕
                    </button>
                </div>

                <div className="settings-body">
                    {/* ── Theme Section ──────────────────────── */}
                    <section className="settings-section">
                        <h3 className="settings-section-title">🎨 Theme</h3>
                        <div className="theme-grid">
                            {AVAILABLE_THEMES.map((t) => (
                                <button
                                    key={t.key}
                                    className={`theme-card ${theme === t.key ? "active" : ""}`}
                                    onClick={() => setTheme(t.key, t.file)}
                                >
                                    <div
                                        className="theme-preview"
                                        style={{ background: t.preview.bg }}
                                    >
                                        <div
                                            className="theme-preview-accent"
                                            style={{ background: t.preview.accent }}
                                        />
                                        <div
                                            className="theme-preview-line"
                                            style={{ background: t.preview.text, opacity: 0.6 }}
                                        />
                                        <div
                                            className="theme-preview-line short"
                                            style={{ background: t.preview.accent, opacity: 0.8 }}
                                        />
                                        <div
                                            className="theme-preview-line"
                                            style={{ background: t.preview.text, opacity: 0.4 }}
                                        />
                                    </div>
                                    <span className="theme-label">{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* ── Editor Section ─────────────────────── */}
                    <section className="settings-section">
                        <h3 className="settings-section-title">✏️ Editor</h3>

                        {/* Font Size */}
                        <div className="setting-row">
                            <div className="setting-info">
                                <span className="setting-label">Font Size</span>
                                <span className="setting-description">Controls the editor font size in pixels</span>
                            </div>
                            <div className="setting-control slider-control">
                                <input
                                    type="range"
                                    className="setting-slider"
                                    min="10"
                                    max="24"
                                    value={fontSize}
                                    onChange={(e) => updateSetting("fontSize", parseInt(e.target.value))}
                                />
                                <span className="setting-value">{fontSize}px</span>
                            </div>
                        </div>

                        {/* Tab Size */}
                        <div className="setting-row">
                            <div className="setting-info">
                                <span className="setting-label">Tab Size</span>
                                <span className="setting-description">Number of spaces per tab</span>
                            </div>
                            <select
                                className="setting-select"
                                value={tabSize}
                                onChange={(e) => updateSetting("tabSize", parseInt(e.target.value))}
                            >
                                <option value={2}>2 spaces</option>
                                <option value={4}>4 spaces</option>
                            </select>
                        </div>

                        {/* Word Wrap */}
                        <div className="setting-row">
                            <div className="setting-info">
                                <span className="setting-label">Word Wrap</span>
                                <span className="setting-description">Wrap long lines at viewport width</span>
                            </div>
                            <label className="setting-toggle">
                                <input
                                    type="checkbox"
                                    checked={wordWrap === "on"}
                                    onChange={(e) => updateSetting("wordWrap", e.target.checked ? "on" : "off")}
                                />
                                <span className="toggle-slider" />
                            </label>
                        </div>

                        {/* Minimap */}
                        <div className="setting-row">
                            <div className="setting-info">
                                <span className="setting-label">Minimap</span>
                                <span className="setting-description">Show code overview on the right side</span>
                            </div>
                            <label className="setting-toggle">
                                <input
                                    type="checkbox"
                                    checked={minimap}
                                    onChange={(e) => updateSetting("minimap", e.target.checked)}
                                />
                                <span className="toggle-slider" />
                            </label>
                        </div>

                        {/* Font Ligatures */}
                        <div className="setting-row">
                            <div className="setting-info">
                                <span className="setting-label">Font Ligatures</span>
                                <span className="setting-description">Enable ligatures like =&gt; and !==</span>
                            </div>
                            <label className="setting-toggle">
                                <input
                                    type="checkbox"
                                    checked={fontLigatures}
                                    onChange={(e) => updateSetting("fontLigatures", e.target.checked)}
                                />
                                <span className="toggle-slider" />
                            </label>
                        </div>

                        {/* Line Numbers */}
                        <div className="setting-row">
                            <div className="setting-info">
                                <span className="setting-label">Line Numbers</span>
                                <span className="setting-description">Show line numbers in the gutter</span>
                            </div>
                            <label className="setting-toggle">
                                <input
                                    type="checkbox"
                                    checked={lineNumbers === "on"}
                                    onChange={(e) => updateSetting("lineNumbers", e.target.checked ? "on" : "off")}
                                />
                                <span className="toggle-slider" />
                            </label>
                        </div>
                    </section>

                    {/* ── Auto-Save Section ──────────────────── */}
                    <section className="settings-section">
                        <h3 className="settings-section-title">💾 Auto-Save</h3>

                        <div className="setting-row">
                            <div className="setting-info">
                                <span className="setting-label">Auto-Save</span>
                                <span className="setting-description">Automatically save files after changes</span>
                            </div>
                            <label className="setting-toggle">
                                <input
                                    type="checkbox"
                                    checked={autoSave}
                                    onChange={(e) => updateSetting("autoSave", e.target.checked)}
                                />
                                <span className="toggle-slider" />
                            </label>
                        </div>

                        {autoSave && (
                            <div className="setting-row">
                                <div className="setting-info">
                                    <span className="setting-label">Save Delay</span>
                                    <span className="setting-description">
                                        Delay before auto-saving after typing stops
                                    </span>
                                </div>
                                <div className="setting-control slider-control">
                                    <input
                                        type="range"
                                        className="setting-slider"
                                        min="300"
                                        max="5000"
                                        step="100"
                                        value={autoSaveDelay}
                                        onChange={(e) => updateSetting("autoSaveDelay", parseInt(e.target.value))}
                                    />
                                    <span className="setting-value">{(autoSaveDelay / 1000).toFixed(1)}s</span>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* ── Keyboard Shortcuts ─────────────────── */}
                    <section className="settings-section">
                        <h3 className="settings-section-title">⌨️ Keyboard Shortcuts</h3>
                        <div className="shortcuts-list">
                            <ShortcutRow keys="Ctrl + S" action="Save file" />
                            <ShortcutRow keys="Ctrl + P" action="Quick open file" />
                            <ShortcutRow keys="Ctrl + ," action="Open settings" />
                            <ShortcutRow keys="Ctrl + W" action="Close tab" />
                            <ShortcutRow keys="Ctrl + Tab" action="Next tab" />
                            <ShortcutRow keys="Ctrl + Shift + Tab" action="Previous tab" />
                            <ShortcutRow keys="Escape" action="Close modal / panel" />
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="settings-footer">
                    <button className="settings-reset-btn" onClick={resetSettings}>
                        ↻ Reset to Defaults
                    </button>
                </div>
            </div>
        </div>
    );
};

function ShortcutRow({ keys, action }) {
    return (
        <div className="shortcut-row">
            <span className="shortcut-action">{action}</span>
            <div className="shortcut-keys">
                {keys.split(" + ").map((key, i) => (
                    <span key={i}>
                        <kbd className="shortcut-kbd">{key}</kbd>
                        {i < keys.split(" + ").length - 1 && (
                            <span className="shortcut-separator">+</span>
                        )}
                    </span>
                ))}
            </div>
        </div>
    );
}
