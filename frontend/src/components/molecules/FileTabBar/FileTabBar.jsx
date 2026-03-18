import { useActiveFileTabStore } from "../../../store/activeFileTabStore";
import { FileIcon } from "../../atoms/fileIcon/FileIcon";
import "./FileTabBar.css";

export const FileTabBar = () => {
    const { activeFileTab, openTabs, closeTab } = useActiveFileTabStore();

    if (!openTabs || openTabs.length === 0) {
        return <div className="file-tab-bar"><div className="file-tab-empty" /></div>;
    }

    return (
        <div className="file-tab-bar">
            {openTabs.map((tab) => {
                const fileName = tab.path?.split(/[/\\]/).pop() || "untitled";
                const isActive = activeFileTab?.path === tab.path;

                return (
                    <button
                        key={tab.path}
                        className={`file-tab ${isActive ? "active" : ""}`}
                        onClick={() => {
                            const { setActiveFileTab } = useActiveFileTabStore.getState();
                            setActiveFileTab(tab.path, tab.value, tab.extension);
                        }}
                    >
                        <span className="file-tab-icon">
                            <FileIcon extension={tab.extension} />
                        </span>
                        <span className="file-tab-name">{fileName}</span>
                        <span
                            className="file-tab-close"
                            onClick={(e) => {
                                e.stopPropagation();
                                closeTab(tab.path);
                            }}
                        >
                            ✕
                        </span>
                    </button>
                );
            })}
            <div className="file-tab-empty" />
        </div>
    );
};
