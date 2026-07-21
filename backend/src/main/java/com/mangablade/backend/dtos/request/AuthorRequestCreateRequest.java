package com.mangablade.backend.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorRequestCreateRequest {
    @NotBlank
    @Size(max = 100)
    private String penName;

    @NotBlank
    @jakarta.validation.constraints.Pattern(regexp = "^(0|\\+84)[35789]\\d{8}$", message = "Số điện thoại không hợp lệ. Phải bao gồm 10 chữ số.")
    @Size(max = 20)
    private String phone;

    @NotBlank
    @jakarta.validation.constraints.Pattern(regexp = "^https?://.+$", message = "Đường dẫn không hợp lệ. Phải bắt đầu bằng http:// hoặc https://")
    @Size(max = 500)
    private String socialLink;
}
