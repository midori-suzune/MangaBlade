import type {ForumThreadCategory} from "../../types/forum.ts";

export const threadCategories: Array<{label: string; value: ForumThreadCategory}> = [
    {label: "Thông báo", value: "ANNOUNCEMENT"},
    {label: "Thảo luận", value: "DISCUSSION"},
    {label: "Tìm truyện", value: "FIND_MANGA"},
    {label: "Góp ý", value: "FEEDBACK"}
];

export const THREAD_TITLE_MAX_LENGTH = 150;

export type CategoryFilter = "ALL" | ForumThreadCategory;

export const categoryLabels = threadCategories.reduce<Record<ForumThreadCategory, string>>((acc, category) => {
    acc[category.value] = category.label;
    return acc;
}, {} as Record<ForumThreadCategory, string>);
