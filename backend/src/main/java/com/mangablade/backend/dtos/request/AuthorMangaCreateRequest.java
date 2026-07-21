package com.mangablade.backend.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorMangaCreateRequest {
    @NotBlank(message = "Tên truyện không được để trống")
    @Size(max = 255, message = "Tên truyện tối đa 255 ký tự")
    private String title;

    @Size(max = 255, message = "Tên gốc/tên khác tối đa 255 ký tự")
    private String originName;

    @Size(max = 5000, message = "Mô tả truyện tối đa 5000 ký tự")
    private String description;

    @NotBlank(message = "Trạng thái truyện không được để trống")
    private String status;

    @NotEmpty(message = "Vui lòng chọn ít nhất 1 thể loại")
    private List<Long> categoryIds;
}
