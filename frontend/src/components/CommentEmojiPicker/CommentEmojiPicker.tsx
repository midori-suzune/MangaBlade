import {useEffect, useRef, useState} from "react";

import {commentEmojiFolders, getCommentEmojiToken, type CommentEmojiFolder} from "./commentEmojiAssets.ts";
import styles from "./CommentEmojiPicker.module.css";

type CommentEmojiPickerProps = {
    onSelect?: (emojiToken: string) => void;
};

const INSERT_COMMENT_EMOJI_EVENT = "insert-comment-emoji";

export function CommentEmojiPicker({onSelect}: CommentEmojiPickerProps) {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [activeFolderName, setActiveFolderName] = useState(commentEmojiFolders[0]?.name ?? "");
    const pickerRef = useRef<HTMLDivElement>(null);

    const activeFolder = commentEmojiFolders.find((folder) => folder.name === activeFolderName) ?? commentEmojiFolders[0];

    useEffect(() => {
        if (!isPanelOpen) return;

        function handlePointerDown(event: PointerEvent) {
            if (!pickerRef.current?.contains(event.target as Node)) {
                setIsPanelOpen(false);
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);
        return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, [isPanelOpen]);

    if (!activeFolder) {
        return null;
    }

    function handleSelectFolder(folder: CommentEmojiFolder) {
        setActiveFolderName(folder.name);
        setIsPanelOpen((currentValue) => folder.name !== activeFolderName || !currentValue);
    }

    return (
        <div
            className={styles.emojiPicker}
            data-comment-emoji-picker
            ref={pickerRef}
        >
            <div className={styles.folderBar} aria-label="Nhóm emoji">
                {commentEmojiFolders.map((folder) => (
                    <button
                        className={`${styles.folderButton} ${folder.name === activeFolder.name ? styles.folderButtonActive : ""}`}
                        type="button"
                        key={folder.name}
                        title={folder.label}
                        aria-label={folder.label}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleSelectFolder(folder)}
                    >
                        <img src={folder.representative.src} alt="" />
                    </button>
                ))}
            </div>

            {isPanelOpen && (
                <div className={styles.emojiPanel} role="dialog" aria-label="Bảng chọn emoji">
                    <div className={styles.emojiGridWrap}>
                        <div className={styles.emojiPanelHeader}>{activeFolder.label}</div>
                        <div className={styles.emojiGrid}>
                            {activeFolder.emojis.map((emoji) => (
                                <button
                                    className={styles.emojiButton}
                                    type="button"
                                    key={emoji.key}
                                    title={emoji.name}
                                    aria-label={emoji.name}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => {
                                        const emojiToken = getCommentEmojiToken(emoji);
                                        document.dispatchEvent(new CustomEvent(INSERT_COMMENT_EMOJI_EVENT, {
                                            detail: {
                                                token: emojiToken,
                                                src: emoji.src,
                                                name: emoji.name,
                                            },
                                        }));
                                        onSelect?.(emojiToken);
                                        setIsPanelOpen(false);
                                    }}
                                >
                                    <img src={emoji.src} alt="" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
