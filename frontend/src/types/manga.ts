export type MangaResponse = {
    slug: string,
    title: string,
    thumbUrl: string,
    updatedAt: string,
    lastSeenChapterNumber?: string | null,
    hasNewChapter?: boolean,
    latestChapter?: {
        chapterNumber?: string | null
    } | null
}

export type MangaWithLatestChapter = MangaResponse & {
    latestChapter: {
        chapterNumber: string
    }
}

export type MangaRankingResponse = {
    slug: string,
    title: string,
    thumbUrl: string,
    followCount: number,
    viewCount: number,
}

export type MangaSearchResponse = {
    title: string,
    slug: string,
    thumbUrl: string,
    latestChapterNumber: string | null,
    updatedAt: string,
    authors: string[],
    categorySlugs?: string[],
    categoryNames?: string[],
}

export type ReadingHistoryResponse = {
    mangaSlug: string,
    mangaTitle: string,
    thumbUrl: string,
    chapterNumber: string,
    lastReadAt: string,
}

export type RecentCommentResponse = {
    id: number,
    content: string,
    createdAt: string,
    userId: number,
    username: string,
    mangaSlug: string,
    mangaTitle: string,
    chapterNumber?: string | null,
    activeTitle?: string | null,
    activeTitleColor?: string | null,
}

export interface ChapterResponse {
    chapterNumber: string,
    chapterUrl: string,
}

interface AuthorResponse {
    id: number,
    name: string,
}

export interface CategoryResponse {
    id: number,
    name: string,
    slug: string,
}

export type MangaDetailResponse = {
    title: string,
    description: string,
    sourceType : string ,
    status : string,
    thumbUrl: string,
    updatedAt: string,
    followed: boolean,
    authors: AuthorResponse[],
    categories: CategoryResponse[],
    chapters : ChapterResponse[]
}

export type MangaInteractionResponse = {
    followed: boolean,
}

export type MangaCommentResponse = {
    id: number,
    content: string,
    createdAt: string,
    isAuthor?: boolean | null,
    user: {
        id: number,
        username: string,
        activeTitle?: string | null,
        activeTitleColor?: string | null,
        isAuthor?: boolean | null,
    },
    replies: MangaCommentResponse[],
}

export type CreateCommentRequest = {
    content: string,
    parentId?: number,
}

export type ChapterPageRequest = {
    slugManga: string,
    chapterNumber: string,
}
export type ChapterPageResponse = {
    chapterNumber: string,
    imageUrl: string,
    mangaTitle: string,
    latestChapterNumber: string,
    previousChapterNumber?: string,
    nextChapterNumber?: string,
}


