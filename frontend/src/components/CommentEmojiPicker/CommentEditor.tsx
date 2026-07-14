import {useEffect, useId, useRef} from "react";

import {getCommentEmojiByKey} from "./commentEmojiAssets.ts";
import styles from "./CommentEditor.module.css";

type CommentEditorProps = {
    value: string;
    placeholder: string;
    minRows?: number;
    onChange: (value: string) => void;
};

const COMMENT_EMOJI_PATTERN = /:?emoji:([^:\s]+):/g;
const COMMENT_EMOJI_TOKEN_PATTERN = /:?emoji:([^:\s]+):/;
const INSERT_COMMENT_EMOJI_EVENT = "insert-comment-emoji";
let activeCommentEditorId: string | null = null;

type InsertCommentEmojiEventDetail = {
    token: string;
    src?: string;
    name?: string;
};

function appendTextNode(fragment: DocumentFragment, text: string) {
    if (text) {
        fragment.append(document.createTextNode(text));
    }
}

function buildEditorContent(documentRef: Document, value: string) {
    const fragment = documentRef.createDocumentFragment();
    let lastIndex = 0;

    for (const match of value.matchAll(COMMENT_EMOJI_PATTERN)) {
        appendTextNode(fragment, value.slice(lastIndex, match.index));

        const emoji = getCommentEmojiByKey(match[1]);
        if (emoji) {
            const image = documentRef.createElement("img");
            image.src = emoji.src;
            image.alt = emoji.name;
            image.dataset.emojiToken = `:emoji:${emoji.key}:`;
            image.contentEditable = "false";
            fragment.append(image);
        } else {
            appendTextNode(fragment, match[0]);
        }

        lastIndex = match.index + match[0].length;
    }

    appendTextNode(fragment, value.slice(lastIndex));
    return fragment;
}

function buildEmojiNode(documentRef: Document, detail: InsertCommentEmojiEventDetail) {
    const {token, src, name} = detail;
    const match = token.match(COMMENT_EMOJI_TOKEN_PATTERN);
    const emoji = match ? getCommentEmojiByKey(match[1]) : undefined;
    const imageSrc = src ?? emoji?.src;

    if (!imageSrc) {
        return documentRef.createTextNode(token);
    }

    const image = documentRef.createElement("img");
    image.src = imageSrc;
    image.alt = name ?? emoji?.name ?? "emoji";
    image.dataset.emojiToken = emoji ? `:emoji:${emoji.key}:` : token;
    image.contentEditable = "false";

    return image;
}

function readEditorContent(element: HTMLElement) {
    function readNode(node: ChildNode): string {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent ?? "";
        }

        if (node instanceof HTMLBRElement) {
            return "\n";
        }

        if (node instanceof HTMLImageElement && node.dataset.emojiToken) {
            return node.dataset.emojiToken;
        }

        if (node instanceof HTMLElement) {
            const childContent = Array.from(node.childNodes).map(readNode).join("");
            if (node.tagName === "DIV" || node.tagName === "P") {
                return `${childContent}\n`;
            }

            return childContent;
        }

        return node.textContent ?? "";
    }

    return Array.from(element.childNodes)
        .map(readNode)
        .join("")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/\n$/, "");
}

function moveCaretToEnd(element: HTMLElement) {
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
}

function insertTextAtSelection(text: string) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);
}

export function CommentEditor({value, placeholder, minRows = 3, onChange}: CommentEditorProps) {
    const editorId = useId();
    const editorRef = useRef<HTMLDivElement>(null);
    const isComposingRef = useRef(false);
    const savedRangeRef = useRef<Range | null>(null);

    function saveSelection() {
        const editor = editorRef.current;
        const selection = window.getSelection();
        if (!editor || !selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        if (editor.contains(range.commonAncestorContainer)) {
            savedRangeRef.current = range.cloneRange();
            activeCommentEditorId = editorId;
        }
    }

    useEffect(() => {
        function handleInsertEmoji(event: Event) {
            if (activeCommentEditorId !== editorId) return;

            const editor = editorRef.current;
            const detail = (event as CustomEvent<InsertCommentEmojiEventDetail>).detail;
            const emojiToken = detail?.token;
            if (!editor || !emojiToken) return;

            editor.focus();

            const selection = window.getSelection();
            const range = savedRangeRef.current ?? document.createRange();
            if (!savedRangeRef.current) {
                range.selectNodeContents(editor);
                range.collapse(false);
            }

            selection?.removeAllRanges();
            selection?.addRange(range);

            range.deleteContents();
            const emojiNode = buildEmojiNode(document, detail);
            const spacer = document.createTextNode(" ");
            range.insertNode(spacer);
            range.insertNode(emojiNode);
            range.setStartAfter(spacer);
            range.collapse(true);

            selection?.removeAllRanges();
            selection?.addRange(range);
            savedRangeRef.current = range.cloneRange();
            onChange(readEditorContent(editor));
        }

        document.addEventListener(INSERT_COMMENT_EMOJI_EVENT, handleInsertEmoji);
        return () => document.removeEventListener(INSERT_COMMENT_EMOJI_EVENT, handleInsertEmoji);
    }, [editorId, onChange]);

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const isFocused = document.activeElement === editor;
        if (isFocused && (isComposingRef.current || readEditorContent(editor) === value)) {
            return;
        }

        editor.replaceChildren(buildEditorContent(document, value));

        if (isFocused) {
            moveCaretToEnd(editor);
        }
    }, [value]);

    return (
        <div
            className={styles.commentEditor}
            contentEditable
            data-comment-editor
            data-placeholder={placeholder}
            ref={editorRef}
            role="textbox"
            aria-label={placeholder}
            style={{minHeight: `${minRows * 30 + 2}px`}}
            suppressContentEditableWarning
            onFocus={() => {
                activeCommentEditorId = editorId;
                saveSelection();
            }}
            onKeyDown={(event) => {
                if (event.key !== "Enter") return;

                event.preventDefault();
                insertTextAtSelection("\n");
                saveSelection();
                onChange(readEditorContent(event.currentTarget));
            }}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            onCompositionStart={() => {
                isComposingRef.current = true;
            }}
            onCompositionEnd={(event) => {
                isComposingRef.current = false;
                onChange(readEditorContent(event.currentTarget));
            }}
            onInput={(event) => {
                if (!isComposingRef.current) {
                    saveSelection();
                    onChange(readEditorContent(event.currentTarget));
                }
            }}
            onBlur={(event) => onChange(readEditorContent(event.currentTarget).trim())}
        />
    );
}
