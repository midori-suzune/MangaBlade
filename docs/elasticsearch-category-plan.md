# Plan: Elasticsearch Functions For Category Page

## Summary

Build category page data from Elasticsearch instead of frontend mock data. V1 supports real filtering by category, status, author, sorting by updated date, newest, chapter count, follow count, comment count, pagination, and optional keyword search.

View-count sorting is out of scope for V1 because the backend currently has no view count field or table.

## Key Changes

- Add `spring-boot-starter-data-elasticsearch`.
- Configure `spring.elasticsearch.uris=${ELASTICSEARCH_URIS:http://localhost:9200}`.
- Keep MySQL as the source of truth.
- Use Elasticsearch only as the search/read index.
- Add `MangaSearchDocument` index, for example `manga_search`.
- Add `GET /api/v1/manga/search`.
- Add frontend API function `searchManga(params)`.
- Replace category page mock filtering with API-backed state.

## Manga Search Document

Fields:

- `id`
- `slug`
- `title`
- `originName`
- `description`
- `thumbUrl`
- `status`
- `categorySlugs`
- `categoryNames`
- `authorNames`
- `latestChapterNumber`
- `chapterCount`
- `updatedAt`
- `createdAt`
- `likeCount`
- `followCount`
- `commentCount`

## Backend API

Endpoint:

```http
GET /api/v1/manga/search
```

Query params:

- `q`
- `category`
- `status`
- `author`
- `sort`
- `page`
- `size`

Response:

```java
ApiResponse<PageResponse<MangaSearchResponse>>
```

`MangaSearchResponse` fields:

- `slug`
- `title`
- `thumbUrl`
- `status`
- `latestChapterNumber`
- `updatedAt`
- `categoryNames`
- `authorNames`
- counts needed by the UI: `likeCount`, `followCount`, `commentCount`

## Frontend Behavior

- Add `searchManga(params)` in the manga API module.
- Remove `MOCK_MANGAS` from `CategoryPage`.
- Fetch from `/api/v1/manga/search`.
- Refetch when `category`, `status`, `author`, `sort`, `page`, or `q` changes.
- Render real cover, title, latest chapter, and updated time.
- Show loading, empty, and error states.
- Keep the current compact filter layout.

## Elasticsearch Indexing Flow

Create `MangaSearchIndexService`:

- `indexManga(Long mangaId)` builds one document from MySQL joins and counts.
- `deleteManga(Long mangaId)` removes one document from Elasticsearch.
- `reindexAll()` rebuilds the index from approved and non-deleted manga.

Sync triggers:

- After OTruyen manga import/update: call `indexManga(mangaId)`.
- After chapter import/update: call `indexManga(mangaId)` so latest chapter and chapter count stay fresh.
- After follow/like/comment changes: call `indexManga(mangaId)` so ranking sorts stay fresh.

Manual reindex:

```http
POST /api/v1/admin/search/reindex
```

Keep this endpoint protected, not public.

## Search Behavior

Filters:

- Category: exact match on `categorySlugs`.
- Status: exact match on `status`.
- Author: match `authorNames`, case-insensitive through Elasticsearch analyzer.

Keyword `q`:

- Search `title`, `originName`, `description`, `authorNames`, and `categoryNames`.
- Boost `title` highest.
- Boost `originName` second.
- Keep description, author, and category lower.

Sort mapping:

- `update`: `updatedAt desc`
- `new`: `createdAt desc`
- `chapters`: `chapterCount desc`
- `follow`: `followCount desc`
- `comment`: `commentCount desc`
- fallback: `updatedAt desc`

Pagination:

- Default `page=0`.
- Default `size=24`.
- Max `size=60`.

## Test Plan

Backend:

```bash
./mvnw -q -DskipTests compile
```

Backend service tests:

- Category filter returns only matching category slug.
- Status filter works.
- Author filter works.
- Each sort maps to the expected Elasticsearch sort field.
- Empty filter returns paginated results.

Frontend:

```bash
npm run build
```

Manual UI checks:

- Category dropdown refetches real results.
- Status active color remains visible.
- Sort dropdown changes order.
- Pagination changes page.
- Empty state appears when no manga matches.

## Assumptions

- Use Spring Data Elasticsearch.
- MySQL remains the source of truth.
- Elasticsearch is allowed to be eventually consistent after imports and interactions.
- View-count sort is skipped in V1 until the app has real view tracking.
- Category page keeps the current compact filter layout.
