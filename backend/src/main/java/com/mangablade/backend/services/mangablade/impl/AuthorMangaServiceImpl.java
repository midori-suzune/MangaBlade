package com.mangablade.backend.services.mangablade.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.mangablade.backend.dtos.request.AuthorChapterCreateRequest;
import com.mangablade.backend.dtos.request.AuthorMangaCreateRequest;
import com.mangablade.backend.dtos.response.*;
import com.mangablade.backend.entities.*;
import com.mangablade.backend.enums.ApprovalStatus;
import com.mangablade.backend.enums.ChapterPageSource;
import com.mangablade.backend.enums.ImageProvider;
import com.mangablade.backend.enums.MangaSourceType;
import com.mangablade.backend.repositories.*;
import com.mangablade.backend.services.mangablade.AuthorMangaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.Instant;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthorMangaServiceImpl implements AuthorMangaService {

    private final MangaRepository mangaRepository;
    private final CategoryRepository categoryRepository;
    private final MangaCategoryRepository mangaCategoryRepository;
    private final AuthorRepository authorRepository;
    private final MangaAuthorRepository mangaAuthorRepository;
    private final AuthorRequestRepository authorRequestRepository;
    private final ChapterRepository chapterRepository;
    private final ChapterPageRepository chapterPageRepository;
    private final FavoriteRepository favoriteRepository;
    private final ReadingHistoryRepository readingHistoryRepository;
    private final CommentRepository commentRepository;
    private final Cloudinary cloudinary;

    @Override
    @Transactional
    public AuthorMangaResponse createManga(User user, AuthorMangaCreateRequest request) {
        String baseSlug = toSlug(request.getTitle());
        String slug = baseSlug;
        if (mangaRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + UUID.randomUUID().toString().substring(0, 4);
        }

        List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());
        if (categories.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn thể loại hợp lệ!");
        }

        Instant now = Instant.now();
        Manga manga = Manga.builder()
                .ownerUserId(user.getId())
                .title(request.getTitle())
                .slug(slug)
                .originName(request.getOriginName())
                .description(request.getDescription())
                .status(request.getStatus())
                .metadataSource(MangaSourceType.LOCAL)
                .chapterPageSource(ChapterPageSource.LOCAL_UPLOAD)
                .approvalStatus(ApprovalStatus.DRAFT)
                .createdAt(now)
                .updatedAt(now)
                .build();

        manga = mangaRepository.save(manga);

        for (Category category : categories) {
            MangaCategory mangaCategory = MangaCategory.builder()
                    .mangaId(manga.getId())
                    .categoryId(category.getId())
                    .manga(manga)
                    .category(category)
                    .build();
            mangaCategoryRepository.save(mangaCategory);
        }

        String penName = authorRequestRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId())
                .map(AuthorRequest::getPenName)
                .orElse(user.getDisplayName() != null ? user.getDisplayName() : user.getUsername());

        Author author = authorRepository.findByName(penName).orElseGet(() -> {
            Author newAuthor = new Author();
            newAuthor.setName(penName);
            return authorRepository.save(newAuthor);
        });

        MangaAuthor mangaAuthor = MangaAuthor.builder()
                .mangaId(manga.getId())
                .authorId(author.getId())
                .manga(manga)
                .author(author)
                .build();
        mangaAuthorRepository.save(mangaAuthor);

        return mapToResponse(manga, categories);
    }

    @Override
    @Transactional
    public AuthorMangaResponse uploadCover(User user, String identifier, MultipartFile file) {
        Manga manga = findMangaByIdentifier(user, identifier);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File ảnh bìa không được để trống!");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Kích thước file tối đa là 5MB!");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Định dạng file không hợp lệ! Vui lòng chọn tệp ảnh.");
        }

        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "author",
                    "resource_type", "image"
            ));
            String secureUrl = (String) uploadResult.get("secure_url");

            manga.setThumbUrl(secureUrl);
            manga.setLocalCoverUrl(secureUrl);
            manga.setUpdatedAt(Instant.now());
            mangaRepository.save(manga);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tải ảnh bìa lên Cloudinary: " + e.getMessage());
        }

        List<Category> categories = getMangaCategories(manga.getId());
        return mapToResponse(manga, categories);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuthorMangaResponse> getMyMangas(User user, Pageable pageable) {
        Page<Manga> mangas = mangaRepository.findByOwnerUserIdAndDeletedAtIsNull(user.getId(), pageable);
        return mangas.map(manga -> {
            List<Category> categories = getMangaCategories(manga.getId());
            return mapToResponse(manga, categories);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public AuthorMangaResponse getMangaByIdentifier(User user, String identifier) {
        Manga manga = findMangaByIdentifier(user, identifier);
        List<Category> categories = getMangaCategories(manga.getId());
        return mapToResponse(manga, categories);
    }

    @Override
    @Transactional
    public AuthorMangaResponse updateManga(User user, String identifier, AuthorMangaCreateRequest request) {
        Manga manga = findMangaByIdentifier(user, identifier);

        List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());
        if (categories.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn thể loại hợp lệ!");
        }

        manga.setTitle(request.getTitle());
        manga.setOriginName(request.getOriginName());
        manga.setDescription(request.getDescription());
        manga.setStatus(request.getStatus());
        manga.setUpdatedAt(Instant.now());

        mangaRepository.save(manga);

        return mapToResponse(manga, categories);
    }

    @Override
    @Transactional
    public void deleteManga(User user, String identifier) {
        Manga manga = findMangaByIdentifier(user, identifier);
        manga.setDeletedAt(Instant.now());
        manga.setDeletedBy(user.getId());
        mangaRepository.save(manga);
    }

    @Override
    @Transactional
    public void submitManga(User user, String identifier) {
        Manga manga = findMangaByIdentifier(user, identifier);
        manga.setApprovalStatus(ApprovalStatus.PENDING);
        manga.setSubmittedAt(Instant.now());
        manga.setUpdatedAt(Instant.now());
        mangaRepository.save(manga);
    }

    @Override
    @Transactional
    public void cancelMangaSubmission(User user, String identifier) {
        Manga manga = findMangaByIdentifier(user, identifier);
        if (manga.getApprovalStatus() != ApprovalStatus.PENDING) {
            throw new IllegalArgumentException("Truyện không ở trạng thái chờ duyệt!");
        }
        manga.setApprovalStatus(ApprovalStatus.DRAFT);
        manga.setUpdatedAt(Instant.now());
        mangaRepository.save(manga);

        // Đưa tất cả các chương đang chờ duyệt về bản nháp
        List<Chapter> chapters = chapterRepository.findAllByMangaId(manga.getId());
        for (Chapter chapter : chapters) {
            if (chapter.getApprovalStatus() == ApprovalStatus.PENDING) {
                chapter.setApprovalStatus(ApprovalStatus.DRAFT);
                chapterRepository.save(chapter);
            }
        }
    }

    // ==========================================
    // CHAPTER MANAGEMENT
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public Page<AuthorChapterResponse> getChapters(User user, String identifier, Pageable pageable) {
        Manga manga = findMangaByIdentifier(user, identifier);
        Page<Chapter> chapters = chapterRepository.findByMangaId(manga.getId(), pageable);
        return chapters.map(ch -> mapToChapterResponse(ch));
    }

    @Override
    @Transactional(readOnly = true)
    public AuthorChapterResponse getChapterDetail(User user, Long chapterId) {
        Chapter chapter = findChapterAndVerifyOwner(user, chapterId);
        return mapToChapterResponse(chapter);
    }

    @Override
    @Transactional
    public AuthorChapterResponse createChapter(User user, String identifier, AuthorChapterCreateRequest request) {
        Manga manga = findMangaByIdentifier(user, identifier);

        Optional<Chapter> existing = chapterRepository.findByMangaIdAndChapterNumber(manga.getId(), request.getChapterNumber());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Số chương '" + request.getChapterNumber() + "' đã tồn tại trong bộ truyện này!");
        }

        BigDecimal sortVal;
        if (request.getChapterSort() != null) {
            sortVal = BigDecimal.valueOf(request.getChapterSort());
        } else {
            try {
                sortVal = new BigDecimal(request.getChapterNumber());
            } catch (Exception e) {
                sortVal = BigDecimal.ZERO;
            }
        }

        Instant now = Instant.now();
        Chapter chapter = Chapter.builder()
                .mangaId(manga.getId())
                .chapterNumber(request.getChapterNumber())
                .title(request.getTitle())
                .chapterSort(sortVal)
                .approvalStatus(ApprovalStatus.DRAFT)
                .createdAt(now)
                .build();

        chapter = chapterRepository.save(chapter);
        return mapToChapterResponse(chapter);
    }

    @Override
    @Transactional
    public AuthorChapterResponse updateChapter(User user, Long chapterId, AuthorChapterCreateRequest request) {
        Chapter chapter = findChapterAndVerifyOwner(user, chapterId);

        if (chapter.getApprovalStatus() == ApprovalStatus.PENDING) {
            throw new IllegalArgumentException("Chương đang ở trạng thái 'Chờ duyệt', không thể chỉnh sửa!");
        }

        BigDecimal sortVal;
        if (request.getChapterSort() != null) {
            sortVal = BigDecimal.valueOf(request.getChapterSort());
        } else {
            try {
                sortVal = new BigDecimal(request.getChapterNumber());
            } catch (Exception e) {
                sortVal = chapter.getChapterSort();
            }
        }

        chapter.setChapterNumber(request.getChapterNumber());
        chapter.setTitle(request.getTitle());
        chapter.setChapterSort(sortVal);

        chapter = chapterRepository.save(chapter);
        return mapToChapterResponse(chapter);
    }

    @Override
    @Transactional
    public void deleteChapter(User user, Long chapterId) {
        Chapter chapter = findChapterAndVerifyOwner(user, chapterId);
        chapterPageRepository.deleteByChapterId(chapterId);
        chapterRepository.delete(chapter);
    }

    @Override
    @Transactional
    public void submitChapter(User user, Long chapterId) {
        Chapter chapter = findChapterAndVerifyOwner(user, chapterId);

        int pageCount = chapterPageRepository.countByChapterId(chapterId);
        if (pageCount == 0) {
            throw new IllegalArgumentException("Vui lòng tải lên ít nhất 1 ảnh trang truyện trước khi gửi duyệt!");
        }

        chapter.setApprovalStatus(ApprovalStatus.PENDING);
        chapter.setSubmittedAt(Instant.now());
        chapterRepository.save(chapter);
    }

    @Override
    @Transactional
    public void cancelChapterSubmission(User user, Long chapterId) {
        Chapter chapter = findChapterAndVerifyOwner(user, chapterId);
        if (chapter.getApprovalStatus() != ApprovalStatus.PENDING) {
            throw new IllegalArgumentException("Chương không ở trạng thái chờ duyệt!");
        }
        chapter.setApprovalStatus(ApprovalStatus.DRAFT);
        chapterRepository.save(chapter);
    }

    // ==========================================
    // CHAPTER PAGES MANAGEMENT
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<AuthorChapterPageResponse> getChapterPages(User user, Long chapterId) {
        findChapterAndVerifyOwner(user, chapterId);
        List<ChapterPage> pages = chapterPageRepository.findByChapterIdOrderByPageNumberAsc(chapterId);
        return pages.stream()
                .map(p -> AuthorChapterPageResponse.builder()
                        .id(p.getId())
                        .pageNumber(p.getPageNumber())
                        .imageUrl(p.getImageUrl())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<AuthorChapterPageResponse> uploadChapterPages(User user, Long chapterId, MultipartFile[] files) {
        Chapter chapter = findChapterAndVerifyOwner(user, chapterId);

        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("Danh sách tệp ảnh tải lên không được để trống!");
        }

        chapterPageRepository.deleteByChapterId(chapterId);

        List<AuthorChapterPageResponse> responseList = new ArrayList<>();
        Instant now = Instant.now();

        for (int i = 0; i < files.length; i++) {
            MultipartFile file = files[i];
            if (file.isEmpty()) continue;

            try {
                Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                        "folder", "author",
                        "resource_type", "image"
                ));
                String secureUrl = (String) uploadResult.get("secure_url");
                String publicId = (String) uploadResult.get("public_id");

                ChapterPage page = ChapterPage.builder()
                        .chapterId(chapter.getId())
                        .pageNumber(i + 1)
                        .imageUrl(secureUrl)
                        .cloudinaryPublicId(publicId)
                        .imageProvider(ImageProvider.CLOUDINARY)
                        .createdAt(now)
                        .build();

                page = chapterPageRepository.save(page);

                responseList.add(AuthorChapterPageResponse.builder()
                        .id(page.getId())
                        .pageNumber(page.getPageNumber())
                        .imageUrl(page.getImageUrl())
                        .build());
            } catch (Exception e) {
                throw new RuntimeException("Lỗi tải ảnh trang " + (i + 1) + " lên Cloudinary: " + e.getMessage());
            }
        }

        return responseList;
    }

    // ==========================================
    // STATISTICS
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public AuthorStatsOverviewResponse getStatsOverview(User user) {
        List<Manga> mangas = mangaRepository.findByOwnerUserIdAndDeletedAtIsNull(user.getId(), Pageable.unpaged()).getContent();
        long totalManga = mangas.size();

        long totalViews = 0L;
        long totalFollows = 0L;
        long totalComments = 0L;

        for (Manga manga : mangas) {
            totalViews += readingHistoryRepository.countByMangaId(manga.getId());
            totalFollows += favoriteRepository.countByMangaId(manga.getId());
            totalComments += commentRepository.countByMangaId(manga.getId());
        }

        return AuthorStatsOverviewResponse.builder()
                .totalManga(totalManga)
                .totalViews(totalViews)
                .totalFollows(totalFollows)
                .totalComments(totalComments)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuthorMangaStatsResponse> getMangaStats(User user, Pageable pageable) {
        Page<Manga> mangas = mangaRepository.findByOwnerUserIdAndDeletedAtIsNull(user.getId(), pageable);
        return mangas.map(manga -> {
            long views = readingHistoryRepository.countByMangaId(manga.getId());
            long follows = favoriteRepository.countByMangaId(manga.getId());
            long comments = commentRepository.countByMangaId(manga.getId());

            return AuthorMangaStatsResponse.builder()
                    .id(manga.getId())
                    .title(manga.getTitle())
                    .slug(manga.getSlug())
                    .thumbUrl(manga.getThumbUrl() != null ? manga.getThumbUrl() : manga.getLocalCoverUrl())
                    .approvalStatus(manga.getApprovalStatus() != null ? manga.getApprovalStatus().name() : "DRAFT")
                    .viewCount(views)
                    .followCount(follows)
                    .commentCount(comments)
                    .build();
        });
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

    private Manga findMangaByIdentifier(User user, String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new IllegalArgumentException("Mã hoặc slug bộ truyện không được để trống!");
        }

        Manga manga = null;
        try {
            Long id = Long.parseLong(identifier);
            Optional<Manga> byId = mangaRepository.findById(id);
            if (byId.isPresent() && byId.get().getDeletedAt() == null) {
                manga = byId.get();
            }
        } catch (NumberFormatException ignored) {}

        if (manga == null) {
            manga = mangaRepository.findBySlugAndDeletedAtIsNull(identifier)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bộ truyện với ID/slug: " + identifier));
        }

        if (manga.getOwnerUserId() == null || !manga.getOwnerUserId().equals(user.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền truy cập bộ truyện này!");
        }

        return manga;
    }

    private Chapter findChapterAndVerifyOwner(User user, Long chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chương truyện!"));

        Manga manga = mangaRepository.findById(chapter.getMangaId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bộ truyện của chương này!"));

        if (manga.getOwnerUserId() == null || !manga.getOwnerUserId().equals(user.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền thao tác trên chương này!");
        }

        return chapter;
    }

    private List<Category> getMangaCategories(Long mangaId) {
        return categoryRepository.findAll().stream()
                .filter(c -> mangaCategoryRepository.existsByMangaIdAndCategoryId(mangaId, c.getId()))
                .collect(Collectors.toList());
    }

    private AuthorMangaResponse mapToResponse(Manga manga, List<Category> categories) {
        long chapterCount = chapterRepository.countByMangaId(manga.getId());

        List<CategoryResponse> catResponses = categories.stream()
                .map(c -> CategoryResponse.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .slug(c.getSlug())
                        .build())
                .collect(Collectors.toList());

        return AuthorMangaResponse.builder()
                .id(manga.getId())
                .title(manga.getTitle())
                .slug(manga.getSlug())
                .originName(manga.getOriginName())
                .description(manga.getDescription())
                .status(manga.getStatus())
                .approvalStatus(manga.getApprovalStatus().name())
                .rejectionReason(manga.getRejectionReason())
                .submittedAt(manga.getSubmittedAt())
                .viewCount(0L)
                .followCount(0L)
                .chapterCount(chapterCount)
                .thumbUrl(manga.getThumbUrl())
                .localCoverUrl(manga.getLocalCoverUrl())
                .createdAt(manga.getCreatedAt())
                .updatedAt(manga.getUpdatedAt())
                .categories(catResponses)
                .build();
    }

    private AuthorChapterResponse mapToChapterResponse(Chapter ch) {
        return AuthorChapterResponse.builder()
                .id(ch.getId())
                .mangaId(ch.getMangaId())
                .chapterNumber(ch.getChapterNumber())
                .title(ch.getTitle())
                .chapterSort(ch.getChapterSort() != null ? ch.getChapterSort().intValue() : 0)
                .pageCount(chapterPageRepository.countByChapterId(ch.getId()))
                .approvalStatus(ch.getApprovalStatus() != null ? ch.getApprovalStatus().name() : "DRAFT")
                .rejectionReason(ch.getRejectionReason())
                .submittedAt(ch.getSubmittedAt())
                .createdAt(ch.getCreatedAt())
                .build();
    }

    private static String toSlug(String input) {
        if (input == null || input.isBlank()) return "truyen";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String slug = pattern.matcher(normalized).replaceAll("")
                .replaceAll("Đ", "D")
                .replaceAll("đ", "d")
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
        return slug.isEmpty() ? "truyen" : slug;
    }
}
