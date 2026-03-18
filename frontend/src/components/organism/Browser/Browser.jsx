import { useEffect, useRef, useState } from "react";
import { useEditorSocketStore } from "../../../store/editorSocketStore";
import { usePortStore } from "../../../store/portStore";
import "./Browser.css";

export const Browser = ({ projectId }) => {
    const iframeRef = useRef(null);
    const { port } = usePortStore();
    const { editorSocket } = useEditorSocketStore();
    const [url, setUrl] = useState(() => port ? `http://localhost:${port}` : "");

    const iframe = iframeRef.current;

    // Request port from backend if not yet available
    useEffect(() => {
        let pollInterval;
        
        if (!port && editorSocket) {
            // Initial request
            editorSocket.emit("getPort", { containerName: projectId });
            
            // Poll every 2 seconds until we get a port
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
            
            // Safety measure: clear timeout
            if (iframe && iframe._refreshTimeout) {
                clearTimeout(iframe._refreshTimeout);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [port, editorSocket, projectId, iframe]);

    function handleRefresh() {
        if (iframeRef.current) {
            const currentSrc = iframeRef.current.src;
            iframeRef.current.src = "about:blank";
            iframeRef.current._refreshTimeout = setTimeout(() => {
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
                            placeholder="Waiting for server..."
                            disabled
                        />
                    </div>
                </div>
                <div className="browser-loading">
                    <div className="browser-loading-spinner" />
                    <div className="browser-loading-text">Starting dev server...</div>
                    <div className="browser-loading-hint">
                        Run `npm run dev` in the terminal to start
                    </div>
                </div>
            </div>
        );
    }

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