import {
    FaCss3, FaFile, FaHtml5, FaJs, FaPython, FaDocker,
    FaFolder, FaFolderOpen, FaGitAlt, FaNpm, FaMarkdown,
    FaImage
} from "react-icons/fa";
import { GrReactjs } from "react-icons/gr";
import {
    SiGitignoredotio, SiTypescript, SiJson, SiYaml,
    SiDotenv, SiEslint, SiPrettier, SiVite
} from "react-icons/si";
import { ImSvg } from "react-icons/im";
import { VscTerminalBash, VscSettingsGear, VscLock } from "react-icons/vsc";

const iconStyle = {
    height: "18px",
    width: "18px",
};

const iconMapper = {
    // JavaScript
    "js": <FaJs color="#f0db4f" style={iconStyle} />,
    "mjs": <FaJs color="#f0db4f" style={iconStyle} />,
    "cjs": <FaJs color="#f0db4f" style={iconStyle} />,

    // React
    "jsx": <GrReactjs color="#61dbfa" style={iconStyle} />,
    "tsx": <GrReactjs color="#61dbfa" style={iconStyle} />,

    // TypeScript
    "ts": <SiTypescript color="#3178c6" style={iconStyle} />,

    // Markup
    "html": <FaHtml5 color="#e34f26" style={iconStyle} />,
    "htm": <FaHtml5 color="#e34f26" style={iconStyle} />,

    // Styles
    "css": <FaCss3 color="#3c99dc" style={iconStyle} />,
    "scss": <FaCss3 color="#cd6799" style={iconStyle} />,
    "sass": <FaCss3 color="#cd6799" style={iconStyle} />,
    "less": <FaCss3 color="#1d365d" style={iconStyle} />,

    // Data
    "json": <SiJson color="#cbcb41" style={iconStyle} />,
    "yaml": <SiYaml color="#cb171e" style={iconStyle} />,
    "yml": <SiYaml color="#cb171e" style={iconStyle} />,

    // Markdown
    "md": <FaMarkdown color="#ffffff" style={iconStyle} />,
    "mdx": <FaMarkdown color="#f9ac00" style={iconStyle} />,

    // Images
    "svg": <ImSvg color="#f06674" style={iconStyle} />,
    "png": <FaImage color="#a074c4" style={iconStyle} />,
    "jpg": <FaImage color="#a074c4" style={iconStyle} />,
    "jpeg": <FaImage color="#a074c4" style={iconStyle} />,
    "gif": <FaImage color="#a074c4" style={iconStyle} />,
    "webp": <FaImage color="#a074c4" style={iconStyle} />,
    "ico": <FaImage color="#a074c4" style={iconStyle} />,

    // Shell / Config
    "sh": <VscTerminalBash color="#4eaa25" style={iconStyle} />,
    "bash": <VscTerminalBash color="#4eaa25" style={iconStyle} />,
    "env": <SiDotenv color="#ecd53f" style={iconStyle} />,

    // Python
    "py": <FaPython color="#3776ab" style={iconStyle} />,

    // Git
    "gitignore": <SiGitignoredotio color="#f0c674" style={iconStyle} />,

    // Lock files
    "lock": <VscLock color="#64748b" style={iconStyle} />,

    // Default
    "default": <FaFile color="#564fdc" style={iconStyle} />,
};

/**
 * Special filename-based icons (takes priority over extension)
 */
const filenameMapper = {
    "dockerfile": <FaDocker color="#2496ED" style={iconStyle} />,
    "docker-compose.yml": <FaDocker color="#2496ED" style={iconStyle} />,
    "docker-compose.yaml": <FaDocker color="#2496ED" style={iconStyle} />,
    ".gitignore": <FaGitAlt color="#f05032" style={iconStyle} />,
    ".npmrc": <FaNpm color="#cb3837" style={iconStyle} />,
    ".eslintrc.js": <SiEslint color="#4b32c3" style={iconStyle} />,
    ".eslintrc.json": <SiEslint color="#4b32c3" style={iconStyle} />,
    ".prettierrc": <SiPrettier color="#f7b93e" style={iconStyle} />,
    "vite.config.js": <SiVite color="#646cff" style={iconStyle} />,
    "vite.config.ts": <SiVite color="#646cff" style={iconStyle} />,
    "package.json": <FaNpm color="#cb3837" style={iconStyle} />,
    "package-lock.json": <FaNpm color="#8b8b8b" style={iconStyle} />,
};

/**
 * File icon component — resolves by filename first, then extension
 */
export const FileIcon = ({ extension, filename }) => {
    // Check filename-specific icons first
    if (filename) {
        const lowerFilename = filename.toLowerCase();
        if (filenameMapper[lowerFilename]) {
            return filenameMapper[lowerFilename];
        }
    }

    return iconMapper[extension] || iconMapper["default"];
};

/**
 * Folder icon — open/closed states
 */
export const FolderIcon = ({ isOpen }) => {
    return isOpen ? (
        <FaFolderOpen color="#e8a87c" style={iconStyle} />
    ) : (
        <FaFolder color="#e8a87c" style={iconStyle} />
    );
};