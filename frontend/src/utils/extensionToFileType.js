const extensionToTypeMap={
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'md': 'markdown',
    'txt': 'plaintext',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'sh': 'shell',
    'bash': 'shell',
    'svg': 'xml',
}

export const extensionToFileType = (extension) => {
        if(!extension) return undefined;
        return extensionToTypeMap[extension] || 'unknown';
}