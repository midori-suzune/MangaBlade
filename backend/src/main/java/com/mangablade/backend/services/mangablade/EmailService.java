package com.mangablade.backend.services.mangablade;

import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String fromEmail;

    public void sendResetPasswordMail(String toEmail, String username, String resetLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Đặt lại mật khẩu tài khoản MangaBlade");

            String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
                    <div style="background-color: #6366f1; padding: 24px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 28px; letter-spacing: -0.5px;">MangaBlade</h1>
                        <p style="margin: 4px 0 0; font-size: 14px; opacity: 0.9;">NỀN TẢNG ĐỌC TRUYỆN TRANH TRỰC TUYẾN</p>
                    </div>
                    <div style="padding: 32px; color: #2f3437; line-height: 1.6;">
                        <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: bold; color: #111111;">Đặt Lại Mật Khẩu</h2>
                        <p style="margin-bottom: 24px; color: #787774;">Yêu cầu thiết lập mật khẩu mới cho tài khoản của bạn.</p>
                        
                        <p>Xin chào <strong>%s</strong> 👋,</p>
                        <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản MangaBlade của bạn. Để bảo mật tài khoản, vui lòng nhấp vào nút dưới đây để tạo mật khẩu mới.</p>
                        
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="%s" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 15px;">Đặt Lại Mật Khẩu &rarr;</a>
                        </div>
                        
                        <div style="background-color: #fbf3db; border: 1px solid #f5ebc6; border-radius: 6px; padding: 16px; margin-top: 32px;">
                            <h4 style="margin: 0 0 8px; color: #b37d00; font-size: 14px;">
                                ⚠️ Lưu ý bảo mật
                            </h4>
                            <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #664d03; line-height: 1.8;">
                                <li>Liên kết này có hiệu lực trong <strong>5 phút</strong></li>
                                <li>Chỉ có thể sử dụng <strong>một lần duy nhất</strong></li>
                                <li>Không chia sẻ liên kết với bất kỳ ai</li>
                                <li>Nếu không phải bạn yêu cầu, hãy bỏ qua email này</li>
                            </ul>
                        </div>
                    </div>
                </div>
            """.formatted(username, resetLink);

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Gửi mail thất bại: " + e.getMessage(), e);
        }
    }
}
