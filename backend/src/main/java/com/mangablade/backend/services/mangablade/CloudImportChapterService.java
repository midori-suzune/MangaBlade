package com.mangablade.backend.services.mangablade;

import com.cloudinary.Cloudinary;
import com.mangablade.backend.entities.Chapter;
import com.mangablade.backend.entities.ChapterPage;
import com.mangablade.backend.entities.Manga;
import com.mangablade.backend.enums.ImageProvider;
import com.mangablade.backend.repositories.ChapterPageRepository;
import com.mangablade.backend.repositories.ChapterRepository;
import com.mangablade.backend.repositories.MangaRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudImportChapterService {

    private static final Pattern PAGE_NUMBER_PATTERN = Pattern.compile("(\\d+)$");

    private final Cloudinary cloudinary;
    private final MangaRepository mangaRepository;
    private final ChapterRepository chapterRepository;
    private final ChapterPageRepository chapterPageRepository;
    private final MangaSearchService mangaSearchService;

    @Value("${spring.app.cloudinary.importer.max-chapters-per-run:20}")
    private int maxChaptersPerRun;

    @Transactional
    public int syncMangaChapterPages(Manga manga) {
        if (manga.getId() == null) {
            throw new IllegalArgumentException("Manga id is required for Cloudinary chapter page sync");
        }

        var managedManga = mangaRepository.findById(manga.getId())
                .orElseThrow(() -> new IllegalArgumentException("Manga not found: " + manga.getId()));

        var syncedChapters = syncMangaChapterFolders(managedManga, maxChaptersPerRun);
        indexMangaSearch(managedManga);
        return syncedChapters;
    }

    @Transactional
   @Scheduled(cron = "${spring.app.cloudinary.chapter-page-sync-cron}", zone = "Asia/Ho_Chi_Minh")
    public void syncMissingChapterPages() {
        log.info("Starting Cloudinary chapter page sync");

        int syncedChapters = 0;
        for (var manga : mangaRepository.findAll()) {
            if (syncedChapters >= maxChaptersPerRun) {
                break;
            }

            try {
                var mangaSyncedChapters = syncMangaChapterFolders(manga, maxChaptersPerRun - syncedChapters);
                if (mangaSyncedChapters > 0) {
                    indexMangaSearch(manga);
                }
                syncedChapters += mangaSyncedChapters;
            } catch (Exception exception) {
                log.warn(
                        "Cloudinary manga sync skipped: mangaId={}, slug={}, reason={}",
                        manga.getId(),
                        manga.getSlug(),
                        exception.getMessage(),
                        exception
                );
            }
        }

        log.info("Finished Cloudinary chapter page sync: syncedChapters={}", syncedChapters);
    }

    private void syncChapterPages(Chapter chapter) {
        var manga = chapter.getManga();
        String folderSlug = manga.getCloudinaryFolderSlug();
        if (folderSlug == null || folderSlug.isBlank()) {
            folderSlug = manga.getSlug();
        }

        String folder = "mangablade/%s/chapters/%s".formatted(folderSlug, chapter.getChapterNumber());
        var resources = fetchFolderResources(folder);
        if (resources.isEmpty()) {
            throw new IllegalStateException("No Cloudinary resources found in folder: " + folder);
        }

        chapterPageRepository.deleteByChapterId(chapter.getId());

        Instant now = Instant.now();
        List<ChapterPage> pages = new ArrayList<>();
        for (var resource : resources) {
            pages.add(ChapterPage.builder()
                    .chapterId(chapter.getId())
                    .pageNumber(resource.pageNumber())
                    .imageUrl(resource.secureUrl())
                    .cloudinaryPublicId(resource.publicId())
                    .imageProvider(ImageProvider.CLOUDINARY)
                    .createdAt(now)
                    .build());
        }

        chapterPageRepository.saveAll(pages);
        log.info("Synced {} Cloudinary pages: mangaSlug={}, chapterNumber={}, folder={}",
                pages.size(), manga.getSlug(), chapter.getChapterNumber(), folder);
    }

    private int syncMangaChapterFolders(Manga manga, int remainingChapters) {
        if (remainingChapters <= 0) {
            return 0;
        }

        String folderSlug = manga.getCloudinaryFolderSlug();
        if (folderSlug == null || folderSlug.isBlank()) {
            folderSlug = manga.getSlug();
        }

        String chaptersFolder = "mangablade/%s/chapters".formatted(folderSlug);
        var chapterNumbers = fetchChapterFolders(chaptersFolder);
        int synced = 0;

        for (String chapterNumber : chapterNumbers) {
            if (synced >= remainingChapters) {
                break;
            }

            var chapter = chapterRepository.findByMangaIdAndChapterNumber(manga.getId(), chapterNumber)
                    .orElseGet(() -> chapterRepository.save(Chapter.builder()
                            .mangaId(manga.getId())
                            .title(null)
                            .chapterNumber(chapterNumber)
                            .chapterSort(toChapterSort(chapterNumber))
                            .createdAt(Instant.now())
                            .manga(manga)
                            .build()));

            if (chapter.getManga() == null) {
                chapter.setManga(manga);
            }

            if (chapterPageRepository.existsByChapterId(chapter.getId())) {
                continue;
            }

            syncChapterPages(chapter);
            synced++;
        }

        return synced;
    }

    private void indexMangaSearch(Manga manga) {
        try {
            mangaSearchService.indexManga(manga);
            log.info("Indexed manga search document after Cloudinary sync: slug={}", manga.getSlug());
        } catch (Exception exception) {
            log.warn("Manga search indexing after Cloudinary sync skipped: slug={}, reason={}",
                    manga.getSlug(), exception.getMessage(), exception);
        }
    }

    private List<String> fetchChapterFolders(String chaptersFolder) {
        try {
            List<String> chapterNumbers = new ArrayList<>();
            String nextCursor = null;

            do {
                Map<String, Object> options = new HashMap<>();
                options.put("max_results", 500);
                if (nextCursor != null) {
                    options.put("next_cursor", nextCursor);
                }

                var response = cloudinary.api().subFolders(chaptersFolder, options);
                Object folders = response.get("folders");
                if (folders instanceof List<?> folderItems) {
                    for (Object folderItem : folderItems) {
                        if (!(folderItem instanceof Map<?, ?> folder)) {
                            continue;
                        }

                        String name = getString(folder, "name");
                        if (name != null && !name.isBlank()) {
                            chapterNumbers.add(name);
                        }
                    }
                }

                nextCursor = (String) response.get("next_cursor");
            } while (nextCursor != null && !nextCursor.isBlank());

            chapterNumbers.sort(Comparator
                    .comparing(CloudImportChapterService::toChapterSortForCompare, Comparator.nullsLast(Comparator.naturalOrder()))
                    .thenComparing(chapterNumber -> chapterNumber));

            return chapterNumbers;
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to fetch Cloudinary chapter folders: " + chaptersFolder, exception);
        }
    }

    private BigDecimal toChapterSort(String chapterNumber) {
        if (chapterNumber == null || chapterNumber.isBlank()) {
            return null;
        }

        try {
            return new BigDecimal(chapterNumber.trim());
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private static BigDecimal toChapterSortForCompare(String chapterNumber) {
        if (chapterNumber == null || chapterNumber.isBlank()) {
            return null;
        }

        try {
            return new BigDecimal(chapterNumber.trim());
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private List<CloudinaryPageResource> fetchFolderResources(String folder) {
        try {
            List<CloudinaryPageResource> resources = new ArrayList<>();
            String nextCursor = null;

            do {
                Map<String, Object> options = new HashMap<>();
                options.put("type", "upload");
                options.put("prefix", folder + "/");
                options.put("max_results", 500);
                if (nextCursor != null) {
                    options.put("next_cursor", nextCursor);
                }

                var response = cloudinary.api().resources(options);
                Object responseResources = response.get("resources");
                if (responseResources instanceof List<?> resourceItems) {
                    for (Object resourceItem : resourceItems) {
                        if (!(resourceItem instanceof Map<?, ?> item)) {
                            continue;
                        }

                        String publicId = getString(item, "public_id");
                        String secureUrl = getString(item, "secure_url");
                        if (publicId == null || secureUrl == null) {
                            continue;
                        }
                        resources.add(new CloudinaryPageResource(
                                publicId,
                                secureUrl,
                                extractPageNumber(publicId)
                        ));
                    }
                }

                nextCursor = (String) response.get("next_cursor");
            } while (nextCursor != null && !nextCursor.isBlank());

            resources.sort(Comparator
                    .comparingInt(CloudinaryPageResource::pageNumber)
                    .thenComparing(CloudinaryPageResource::publicId));

            return resources;
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to fetch Cloudinary folder: " + folder, exception);
        }
    }

    private String getString(Map<?, ?> map, String key) {
        Object value = map.get(key);
        return value instanceof String stringValue ? stringValue : null;
    }

    private int extractPageNumber(String publicId) {
        String filename = publicId.substring(publicId.lastIndexOf('/') + 1);
        int extensionIndex = filename.lastIndexOf('.');
        if (extensionIndex >= 0) {
            filename = filename.substring(0, extensionIndex);
        }

        Matcher matcher = PAGE_NUMBER_PATTERN.matcher(filename);
        if (!matcher.find()) {
            throw new IllegalStateException("Cloudinary public_id does not end with a page number: " + publicId);
        }

        return Integer.parseInt(matcher.group(1));
    }

    private record CloudinaryPageResource(String publicId, String secureUrl, int pageNumber) {
    }
}
