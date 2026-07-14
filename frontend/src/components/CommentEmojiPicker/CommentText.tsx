import {Fragment} from "react";

import {getCommentEmojiByKey} from "./commentEmojiAssets.ts";
import styles from "./CommentText.module.css";

type CommentTextProps = {
    content: string;
};

const COMMENT_EMOJI_PATTERN = /:?emoji:([^:\s]+):/g;

export function CommentText({content}: CommentTextProps) {
    const parts: Array<string | {key: string; token: string}> = [];
    let lastIndex = 0;

    for (const match of content.matchAll(COMMENT_EMOJI_PATTERN)) {
        if (match.index > lastIndex) {
            parts.push(content.slice(lastIndex, match.index));
        }

        parts.push({key: match[1], token: match[0]});
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
        parts.push(content.slice(lastIndex));
    }

    return (
        <>
            {parts.map((part, index) => {
                if (typeof part === "string") {
                    return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
                }

                const emoji = getCommentEmojiByKey(part.key);
                if (!emoji) {
                    return <Fragment key={`${part.token}-${index}`}>{part.token}</Fragment>;
                }

                return (
                    <img
                        className={styles.commentEmoji}
                        src={emoji.src}
                        alt={emoji.name}
                        key={`${part.key}-${index}`}
                    />
                );
            })}
        </>
    );
}
