import { useEffect, useRef, useState, useCallback } from "react";
import { useEditorSocketStore } from "../../../store/editorSocketStore";
import { usePortStore } from "../../../store/portStore";
import "./Browser.css";

export const Browser = ({ projectId }) => {
    const iframeRef = useRef(null);
    const { port } = usePortStore();
    const { editorSocket } = useEditorSocketStore();
    const [url, setUrl] = useState("");
    const [isServerReady, setIsServerReady] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const retryTimerRef = useRef(null);

    // Request port from backend if not yet available
    useEffect(() => {
        let pollInterval;
        
        if (!port && editorSocket) {
            editorSocket.emit("getPort", { containerName: projectId });
            
            pollInterval = setInterval(() => {
                editorSocket.emit("getPort", { containerName: projectId });
            }, 2000);
        }

        if (port) {
            if (!url) {
                setUrl(`http://localhost:${port}`);
            }
            if (pollInterval) clearInterval(pollInterval);
        }

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [port, editorSocket, projectId]);

    // Health-check: ping the Vite server until it responds, then load the iframe
    const checkServerReady = useCallback(async () => {
        if (!port) return;

        const target = `http://localhost:${port}`;
        try {
            await fetch(target, { mode: "no-cors", cache: "no-store" });
            // If fetch doesn't throw, the server is reachable
            setIsServerReady(true);
            setUrl(target);
        } catch {
            // Server not ready yet — retry
            setRetryCount((c) => c + 1);
            retryTimerRef.current = setTimeout(checkServerReady, 1500);
        }
    }, [port]);

    useEffect(() => {
        if (port && !isServerReady) {
            checkServerReady();
        }

        return () => {
            if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
        };
    }, [port, isServerReady, checkServerReady]);

    function handleRefresh() {
        if (iframeRef.current) {
            const currentSrc = iframeRef.current.src;
            iframeRef.current.src = "about:blank";
            setTimeout(() => {
                if (iframeRef.current) iframeRef.current.src = currentSrc;
            }, 50);
        }
    }

    function handleUrlKeyDown(e) {
        if (e.key === "Enter" && iframeRef.current) {
            let newUrl = url;
            if (!newUrl.startsWith("http")) {
                newUrl = "http://" + newUrl;
            }
            iframeRef.current.src = newUrl;
        }
    }

    // State: No port yet (waiting for container)
    if (!port) {
        return (
            <div className="browser-wrapper">
                <div className="browser-toolbar">
                    <div className="browser-controls">
                        <button className="browser-control-btn" disabled>←</button>
                        <button className="browser-control-btn" disabled>→</button>
                        <button className="browser-control-btn" disabled>↻</button>
                    </div>
                    <div className="browser-url-bar">
                        <span className="browser-url-lock">🔒</span>
                        <input
                            className="browser-url-input"
                            placeholder="Waiting for container..."
                            disabled
                        />
                    </div>
                </div>
                <div className="browser-loading">
                    <div className="browser-loading-spinner" />
                    <div className="browser-loading-text">Starting container...</div>
                </div>
            </div>
        );
    }

    // State: Have port but Vite isn't ready yet
    if (!isServerReady) {
        return (
            <div className="browser-wrapper">
                <div className="browser-toolbar">
                    <div className="browser-controls">
                        <button className="browser-control-btn" disabled>←</button>
                        <button className="browser-control-btn" disabled>→</button>
                        <button className="browser-control-btn" disabled>↻</button>
                    </div>
                    <div className="browser-url-bar">
                        <span className="browser-url-lock">🔒</span>
                        <input
                            className="browser-url-input"
                            value={`http://localhost:${port}`}
                            disabled
                        />
                    </div>
                </div>
                <div className="browser-loading">
                    <div className="browser-loading-spinner" />
                    <div className="browser-loading-text">
                        Waiting for dev server to start...
                    </div>
                    <div className="browser-loading-hint">
                        Attempt {retryCount + 1} — auto-retrying
                    </div>
                </div>
            </div>
        );
    }

    // State: Ready — show the iframe
    return (
        <div className="browser-wrapper">
            <div className="browser-toolbar">
                <div className="browser-controls">
                    <button className="browser-control-btn" title="Back">←</button>
                    <button className="browser-control-btn" title="Forward">→</button>
                    <button className="browser-control-btn" title="Refresh" onClick={handleRefresh}>↻</button>
                </div>
                <div className="browser-url-bar">
                    <span className="browser-url-lock">🔒</span>
                    <input
                        className="browser-url-input"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={handleUrlKeyDown}
                    />
                </div>
            </div>
            <div className="browser-iframe-container">
                <iframe
                    ref={iframeRef}
                    src={`http://localhost:${port}`}
                    className="browser-iframe"
                    title="Preview"
                />
            </div>
        </div>
    );
};