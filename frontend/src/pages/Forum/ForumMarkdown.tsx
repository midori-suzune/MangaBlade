import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {Fragment, type ReactNode} from "react";

import {getCommentEmojiByKey} from "../../components/CommentEmojiPicker/commentEmojiAssets.ts";
import type {ForumAttachmentResponse} from "../../types/forum.ts";
import styles from "./ForumPage.module.css";

const commentEmojiPattern = /:?emoji:([^:\s]+):/g;

function resolveAttachmentSource(src: string | undefined, attachments: ForumAttachmentResponse[]) {
    if (!src?.startsWith("attachment:")) {
        return src ?? "";
    }

    const attachmentId = Number(src.replace("attachment:", ""));
    if (!Number.isFinite(attachmentId)) {
        return "";
    }

    return attachments.find((attachment) => attachment.id === attachmentId)?.url ?? "";
}

function renderEmojiText(text: string) {
    const parts: ReactNode[] = [];
    let lastIndex = 0;

    for (const match of text.matchAll(commentEmojiPattern)) {
        const matchIndex = match.index ?? 0;
        if (matchIndex > lastIndex) {
            parts.push(text.slice(lastIndex, matchIndex));
        }

        const emoji = getCommentEmojiByKey(match[1]);
        parts.push(
            emoji ? (
                <img
                    className={styles.markdownEmoji}
                    src={emoji.src}
                    alt={emoji.name}
                    key={`${match[1]}-${matchIndex}`}
                />
            ) : (
                <Fragment key={`${match[0]}-${matchIndex}`}>{match[0]}</Fragment>
            )
        );
        lastIndex = matchIndex + match[0].length;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
}

function renderEmojiChildren(children: ReactNode): ReactNode {
    if (typeof children === "string") {
        return renderEmojiText(children);
    }

    if (Array.isArray(children)) {
        return children.map((child, index) => (
            <Fragment key={index}>{renderEmojiChildren(child)}</Fragment>
        ));
    }

    return children;
}

export function ForumMarkdown({
    attachments = [],
    content
}: {
    attachments?: ForumAttachmentResponse[];
    content: string;
}) {
    return (
        <div className={styles.markdownContent}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                urlTransform={(url) => {
                    if (url.startsWith("attachment:")) {
                        return url;
                    }
                    if (/^https?:\/\//i.test(url) || url.startsWith("/") || url.startsWith("#")) {
                        return url;
                    }
                    return "";
                }}
                components={{
                    a: ({children, href}) => (
                        <a href={href} target="_blank" rel="noreferrer">
                            {renderEmojiChildren(children)}
                        </a>
                    ),
                    h1: ({children}) => <h1>{renderEmojiChildren(children)}</h1>,
                    h2: ({children}) => <h2>{renderEmojiChildren(children)}</h2>,
                    h3: ({children}) => <h3>{renderEmojiChildren(children)}</h3>,
                    img: ({alt, src}) => (
                        <img alt={alt ?? ""} src={resolveAttachmentSource(src, attachments)} />
                    ),
                    li: ({children}) => <li>{renderEmojiChildren(children)}</li>,
                    p: ({children}) => <p>{renderEmojiChildren(children)}</p>,
                    blockquote: ({children}) => <blockquote>{renderEmojiChildren(children)}</blockquote>
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
