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
    'txt': 'text',
}

export const extensionToFileType = (extension) => {
        if(!extension) return undefined;
        return extensionToTypeMap[extension] || 'unknown';
}