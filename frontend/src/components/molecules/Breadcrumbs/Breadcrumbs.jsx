import { useActiveFileTabStore } from "../../../store/activeFileTabStore";
import { FileIcon } from "../../atoms/fileIcon/FileIcon";
import "./Breadcrumbs.css";

export const Breadcrumbs = () => {
    const { activeFileTab } = useActiveFileTabStore();

    if (!activeFileTab?.path) {
        return (
            <div className="breadcrumbs">
                <span className="breadcrumb-segment muted">No file open</span>
            </div>
        );
    }

    // Parse the path - strip leading project path, keep from project root
    const fullPath = activeFileTab.path.replace(/\\/g, "/");

    // Find "sandbox/" in path and take everything after it for cleaner breadcrumbs
    const sandboxIndex = fullPath.indexOf("sandbox/");
    const displayPath =
        sandboxIndex !== -1
            ? fullPath.substring(sandboxIndex + "sandbox/".length)
            : fullPath;

    const segments = displayPath.split("/").filter(Boolean);

    return (
        <div className="breadcrumbs">
            {segments.map((segment, i) => {
                const isLast = i === segments.length - 1;
                const extension = isLast && segment.includes(".")
                    ? segment.split(".").pop()
                    : null;

                return (
                    <span key={i} className="breadcrumb-item">
                        {isLast && extension && (
                            <span className="breadcrumb-icon">
                                <FileIcon extension={extension} />
                            </span>
                        )}
                        <span className={`breadcrumb-segment ${isLast ? "active" : ""}`}>
                            {segment}
                        </span>
                        {!isLast && <span className="breadcrumb-separator">›</span>}
                    </span>
                );
            })}
        </div>
    );
};
