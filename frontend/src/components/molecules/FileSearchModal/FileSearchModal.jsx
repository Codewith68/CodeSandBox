import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSettingsStore } from "../../../store/settingsStore";
import { useTreeStructureStore } from "../../../store/treeStructureStore";
import { useEditorSocketStore } from "../../../store/editorSocketStore";
import { FileIcon } from "../../atoms/fileIcon/FileIcon";
import "./FileSearchModal.css";

/**
 * Recursively flatten a tree structure into a list of files
 */
function flattenTree(node, results = []) {
    if (!node) return results;

    if (node.children) {
        // It's a folder — recurse into children
        for (const child of node.children) {
            flattenTree(child, results);
        }
    } else {
        // It's a file
        results.push({
            name: node.name,
            path: node.path,
            extension: node.name.includes(".") ? node.name.split(".").pop() : "",
        });
    }

    return results;
}

/**
 * Simple fuzzy match — checks if all query chars appear in order in the target
 * Returns matched character indices for highlighting
 */
function fuzzyMatch(query, target) {
    const ql = query.toLowerCase();
    const tl = target.toLowerCase();
    let qi = 0;
    const indices = [];

    for (let ti = 0; ti < tl.length && qi < ql.length; ti++) {
        if (tl[ti] === ql[qi]) {
            indices.push(ti);
            qi++;
        }
    }

    return qi === ql.length ? indices : null;
}

export const FileSearchModal = () => {
    const { fileSearchOpen, closeFileSearch } = useSettingsStore();
    const { treeStructure } = useTreeStructureStore();
    const { editorSocket } = useEditorSocketStore();

    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    // Flatten tree into a list of all files
    const allFiles = useMemo(
        () => flattenTree(treeStructure),
        [treeStructure]
    );

    // Filter and fuzzy-match files
    const filteredFiles = useMemo(() => {
        if (!query.trim()) return allFiles.slice(0, 50); // Show first 50 files when no query

        return allFiles
            .map((file) => {
                const nameMatch = fuzzyMatch(query, file.name);
                const pathMatch = !nameMatch ? fuzzyMatch(query, file.path) : null;
                const matchIndices = nameMatch || pathMatch;
                const matchType = nameMatch ? "name" : pathMatch ? "path" : null;

                return matchIndices
                    ? { ...file, matchIndices, matchType, score: matchIndices.length }
                    : null;
            })
            .filter(Boolean)
            .sort((a, b) => {
                // Prioritize name matches over path matches
                if (a.matchType !== b.matchType) {
                    return a.matchType === "name" ? -1 : 1;
                }
                return a.name.length - b.name.length; // Shorter names first
            })
            .slice(0, 30);
    }, [query, allFiles]);

    // Reset state when modal opens
    useEffect(() => {
        if (fileSearchOpen) {
            setQuery("");
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [fileSearchOpen]);

    // Scroll selected item into view
    useEffect(() => {
        const item = listRef.current?.children[selectedIndex];
        if (item) {
            item.scrollIntoView({ block: "nearest" });
        }
    }, [selectedIndex]);

    const openFile = useCallback(
        (file) => {
            if (editorSocket) {
                editorSocket.emit("readFile", {
                    pathToFileOrFolder: file.path,
                });
            }
            closeFileSearch();
        },
        [editorSocket, closeFileSearch]
    );

    const handleKeyDown = (e) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((i) => Math.min(i + 1, filteredFiles.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (filteredFiles[selectedIndex]) {
                openFile(filteredFiles[selectedIndex]);
            }
        } else if (e.key === "Escape") {
            closeFileSearch();
        }
    };

    if (!fileSearchOpen) return null;

    return (
        <div className="file-search-overlay" onClick={closeFileSearch}>
            <div
                className="file-search-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="file-search-input-wrapper">
                    <span className="file-search-icon">🔍</span>
                    <input
                        ref={inputRef}
                        className="file-search-input"
                        type="text"
                        placeholder="Search files by name..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                    <kbd className="file-search-kbd">ESC</kbd>
                </div>

                {/* Results */}
                <div className="file-search-results" ref={listRef}>
                    {filteredFiles.length === 0 ? (
                        <div className="file-search-empty">
                            No files found matching "{query}"
                        </div>
                    ) : (
                        filteredFiles.map((file, idx) => {
                            const isSelected = idx === selectedIndex;
                            // Get a short display path
                            const displayPath = file.path.replace(/\\/g, "/");
                            const sandboxIdx = displayPath.indexOf("sandbox/");
                            const shortPath =
                                sandboxIdx !== -1
                                    ? displayPath.substring(sandboxIdx + "sandbox/".length)
                                    : displayPath;

                            return (
                                <button
                                    key={file.path}
                                    className={`file-search-item ${isSelected ? "selected" : ""}`}
                                    onClick={() => openFile(file)}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                >
                                    <span className="file-search-item-icon">
                                        <FileIcon extension={file.extension} />
                                    </span>
                                    <span className="file-search-item-name">
                                        <HighlightedText
                                            text={file.name}
                                            indices={file.matchType === "name" ? file.matchIndices : null}
                                        />
                                    </span>
                                    <span className="file-search-item-path">{shortPath}</span>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Renders text with fuzzy-matched characters highlighted
 */
function HighlightedText({ text, indices }) {
    if (!indices || indices.length === 0) {
        return <>{text}</>;
    }

    const indexSet = new Set(indices);
    return (
        <>
            {text.split("").map((char, i) => (
                <span
                    key={i}
                    className={indexSet.has(i) ? "highlight" : ""}
                >
                    {char}
                </span>
            ))}
        </>
    );
}
