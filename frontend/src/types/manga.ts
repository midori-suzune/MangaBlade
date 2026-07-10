export type MangaResponse = {
    title: string,
    thumbUrl: string,
    updatedAt: string,
    latestChapter: {
        chapterNumber: string
    }
}

export interface ChapterResponse {
    chapterNumber: string,
    chapterUrl: string,
}

interface AuthorResponse {
    id: number,
    name: string,
}

export type MangaDetailResponse = {
    title: string,
    description: string,
    sourceType : string ,
    status : string,
    thumbUrl: string,
    updatedAt: string,
    authors: AuthorResponse[],
    chapters : ChapterResponse[]
}

export type ChapterPageRequest = {
    slugManga: string,
    chapterNumber: string,
}
export type ChapterPageResponse = {
    chapterNumber: string,
    imageUrl: string,
    mangaTitle: string,
}



















