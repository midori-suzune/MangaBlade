package com.mangablade.backend.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequest {
    @NotBlank(message = "Token không được để trống")
    private String token;

    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 8, max = 72, message = "Mật khẩu mới phải từ 8 đến 72 ký tự")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]|.*[^A-Za-z0-9]).{8,72}$",
        message = "Mật khẩu mới phải chứa ít nhất 1 chữ cái viết hoa, 1 chữ cái viết thường và 1 số hoặc ký tự đặc biệt"
    )
    private String newPassword;
}
