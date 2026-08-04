package com.mangablade.backend.exceptions;

import org.springframework.http.HttpStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    USER_NOT_FOUND(404, "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    USER_EXISTED(400, "Tài khoản hoặc email đã tồn tại trong hệ thống", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(400, "Mật khẩu không hợp lệ", HttpStatus.BAD_REQUEST),
    INVALID_TOKEN(400, "Liên kết khôi phục mật khẩu không hợp lệ hoặc đã được sử dụng", HttpStatus.BAD_REQUEST),
    EXPIRED_TOKEN(400, "Liên kết khôi phục mật khẩu đã hết hạn", HttpStatus.BAD_REQUEST),
    MANGA_NOT_FOUND(404, "Không tìm thấy truyện tranh", HttpStatus.NOT_FOUND),
    MANGA_NOT_APPROVED_YET(400, "Truyện chưa được duyệt, không thể duyệt chương!", HttpStatus.BAD_REQUEST),
    CHAPTER_NOT_FOUND(404, "Không tìm thấy chương truyện", HttpStatus.NOT_FOUND),
    CHAPTER_REPORT_NOT_FOUND(404, "Không tìm thấy báo cáo lỗi chương", HttpStatus.NOT_FOUND),
    COMMENT_NOT_FOUND(404, "Không tìm thấy bình luận", HttpStatus.NOT_FOUND),
    FORUM_THREAD_NOT_FOUND(404, "Không tìm thấy bài viết diễn đàn", HttpStatus.NOT_FOUND),
    FORUM_THREAD_LOCKED(400, "Bài viết diễn đàn này đã bị khóa", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST(400, "Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),
    CANNOT_REPORT_OWN_COMMENT(400, "Không thể báo cáo bình luận của chính mình", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(401, "Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn", HttpStatus.UNAUTHORIZED),
    FORBIDDEN(403, "Bạn không có quyền thực hiện thao tác này", HttpStatus.FORBIDDEN),
    WRONG_PASSWORD(400, "Mật khẩu hiện tại không chính xác", HttpStatus.BAD_REQUEST),
    SAME_AS_CURRENT_PASSWORD(400, "Mật khẩu mới không được trùng với mật khẩu hiện tại", HttpStatus.BAD_REQUEST),
    ACCOUNT_BANNED(400, "Tài khoản của bạn đã bị khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ qua email mangablade123@gmail.com để biết thêm chi tiết!", HttpStatus.BAD_REQUEST),
    SOCIAL_USER_CANT_CHANGE_PASSWORD(400, "Tài khoản đăng nhập bằng Google không hỗ trợ đổi mật khẩu tại đây", HttpStatus.BAD_REQUEST),
    EMAIL_NOT_VERIFIED(400, "Email chưa được xác thực. Vui lòng xác thực email trước khi đăng nhập.", HttpStatus.BAD_REQUEST),
    INVALID_OTP(400, "Mã OTP không chính xác", HttpStatus.BAD_REQUEST),
    EXPIRED_OTP(400, "Mã OTP đã hết hạn", HttpStatus.BAD_REQUEST),
    INVALID_TURNSTILE_TOKEN(400, "Xác minh chống bot (Turnstile) thất bại. Vui lòng thử lại!", HttpStatus.BAD_REQUEST),
    AUTHOR_REQUEST_ALREADY_PENDING(400, "Bạn đã có đơn đăng ký đang chờ duyệt", HttpStatus.BAD_REQUEST),
    ALREADY_AUTHOR(400, "Bạn đã là tác giả", HttpStatus.BAD_REQUEST),
    AUTHOR_REQUEST_NOT_FOUND(404, "Không tìm thấy đơn đăng ký", HttpStatus.NOT_FOUND),
    UPLOAD_FAILED(500, "Upload file thất bại, vui lòng thử lại", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_TOO_LARGE(400, "File quá lớn, tối đa 5MB", HttpStatus.BAD_REQUEST),
    INVALID_FILE_TYPE(400, "Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)", HttpStatus.BAD_REQUEST),
    ATTACHMENT_NOT_FOUND(404, "Không tìm thấy tệp đính kèm", HttpStatus.NOT_FOUND),
    INTERNAL_ERROR(500, "Lỗi hệ thống nội bộ, vui lòng thử lại sau", HttpStatus.INTERNAL_SERVER_ERROR);

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;
}
