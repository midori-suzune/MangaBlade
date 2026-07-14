export type CommentEmoji = {
    key: string;
    name: string;
    src: string;
};

export type CommentEmojiFolder = {
    name: string;
    label: string;
    representative: CommentEmoji;
    emojis: CommentEmoji[];
};

const emojiModules = import.meta.glob("../../assets/*/*.{gif,jpeg,jpg,png,webp}", {
    eager: true,
    import: "default",
}) as Record<string, string>;

function formatFolderLabel(folderName: string) {
    return folderName
        .split(/[-_]/)
        .filter(Boolean)
        .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
        .join(" ");
}

function formatEmojiName(fileName: string) {
    return fileName
        .replace(/\.[^.]+$/, "")
        .replace(/^\d+[-_]?/, "")
        .replace(/[-_]+/g, " ")
        .trim();
}

const folderMap = new Map<string, CommentEmoji[]>();

Object.entries(emojiModules).forEach(([path, src]) => {
    const match = path.match(/assets\/([^/]+)\/([^/]+)$/);
    if (!match) return;

    const [, folderName, fileName] = match;
    const emoji: CommentEmoji = {
        key: `${folderName}/${fileName}`,
        name: formatEmojiName(fileName) || fileName,
        src,
    };

    const currentEmojis = folderMap.get(folderName) ?? [];
    currentEmojis.push(emoji);
    folderMap.set(folderName, currentEmojis);
});

export const commentEmojiFolders: CommentEmojiFolder[] = Array.from(folderMap.entries())
    .map(([name, emojis]) => {
        const sortedEmojis = [...emojis].sort((firstEmoji, secondEmoji) => firstEmoji.key.localeCompare(secondEmoji.key));

        return {
            name,
            label: formatFolderLabel(name),
            representative: sortedEmojis[0],
            emojis: sortedEmojis,
        };
    })
    .filter((folder): folder is CommentEmojiFolder => Boolean(folder.representative))
    .sort((firstFolder, secondFolder) => firstFolder.label.localeCompare(secondFolder.label));

export function getCommentEmojiToken(emoji: CommentEmoji) {
    return `:emoji:${emoji.key}:`;
}

export function getCommentEmojiByKey(key: string) {
    for (const folder of commentEmojiFolders) {
        const emoji = folder.emojis.find((currentEmoji) => currentEmoji.key === key);
        if (emoji) return emoji;
    }

    return undefined;
}
