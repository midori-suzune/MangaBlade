package com.mangablade.backend.services.mangablade;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.mangablade.backend.entities.Author;
import com.mangablade.backend.entities.Manga;
import com.mangablade.backend.entities.MangaAuthor;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.enums.UserRole;
import com.mangablade.backend.repositories.AuthorRepository;
import com.mangablade.backend.repositories.MangaAuthorRepository;
import com.mangablade.backend.repositories.MangaRepository;
import com.mangablade.backend.repositories.UserRepository;
import com.mangablade.backend.dtos.request.UpdateProfileRequest;
import com.mangablade.backend.dtos.response.UserProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final MangaRepository mangaRepository;
    private final MangaAuthorRepository mangaAuthorRepository;
    private final AuthorRepository authorRepository;
    private final Cloudinary cloudinary;

    @Override
    public User loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public Page<User> getUsersPaging(UserRole role, String search, Boolean isBanned, Pageable pageable) {
        return userRepository.findByRoleWithFilters(role, search, isBanned, pageable);
    }

    @Transactional
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());
        user.setRole(userDetails.getRole());
        user.setUpdatedAt(Instant.now());
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id, Long currentAdminId) {
        if (id.equals(currentAdminId)) {
            throw new IllegalArgumentException("Hành động bị cấm: Bạn không thể tự xóa chính mình!");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        userRepository.delete(user);
    }

    @Transactional
    public User toggleBanUser(Long id, Long currentAdminId) {
        if (id.equals(currentAdminId)) {
            throw new IllegalArgumentException("Hành động bị cấm: Bạn không thể tự khóa chính mình!");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        user.setBanned(!user.isBanned());
        user.setUpdatedAt(Instant.now());
        return userRepository.save(user);
    }

    public UserProfileResponse getUserProfile(User principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        String titleName = user.getActiveTitle() != null ? user.getActiveTitle().getName() : null;
        String titleColor = user.getActiveTitle() != null ? user.getActiveTitle().getColorCode() : null;

        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().name())
                .level(user.getLevel())
                .exp(user.getExp())
                .activeTitle(titleName)
                .activeTitleColor(titleColor)
                .build();
    }

    @Transactional
    public UserProfileResponse updateProfile(User principal, UpdateProfileRequest request) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (user.getRole() != UserRole.AUTHOR) {
            user.setDisplayName(request.getDisplayName().trim());
            user.setUpdatedAt(Instant.now());
            userRepository.save(user);
        }

        return getUserProfile(user);
    }

    @Transactional
    public UserProfileResponse updateAvatar(User principal, MultipartFile file) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "avatar",
                    "resource_type", "image"
            ));
            String url = (String) uploadResult.get("secure_url");

            user.setAvatarUrl(url);
            user.setUpdatedAt(Instant.now());
            userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tải ảnh lên Cloudinary: " + e.getMessage());
        }

        return getUserProfile(user);
    }

    private void syncAuthorPenNameForUserMangas(Long userId, String newPenName) {
        Page<Manga> mangas = mangaRepository.findByOwnerUserIdAndDeletedAtIsNull(userId, Pageable.unpaged());
        for (Manga manga : mangas.getContent()) {
            List<MangaAuthor> mangaAuthors = mangaAuthorRepository.findByMangaId(manga.getId());
            for (MangaAuthor ma : mangaAuthors) {
                Author author = ma.getAuthor();
                if (author != null) {
                    author.setName(newPenName);
                    authorRepository.save(author);
                }
            }
        }
    }
}
