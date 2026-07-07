package com.mangablade.backend.configurations;

import com.mangablade.backend.entities.User;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import javax.crypto.SecretKey;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtService {

    @Value("${jwt.secret-key}")
    private String secretKey;

    @Value("${jwt.expiration-ms}")
    private long expiration;

    public String generateToken(User user) {
        Date now  = new Date();
        Date expiry = new Date(now.getTime() + expiration);
        return Jwts.builder()
                .subject(user.getEmail())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSignInKey(), Jwts.SIG.HS256)
                .compact();
    }

    public String getEmailByToken(String token) {
        return extractAllClaimsJws(token).getSubject();
    }

    public boolean isTokenValid(String token, User user) {
        String email = getEmailByToken(token);
        return email.equals(user.getEmail()) && !isExpired(token);
    }

    private boolean isExpired(String token) {
        return extractAllClaimsJws(token)
                .getExpiration()
                .before(new Date());
    }


    private Claims extractAllClaimsJws(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = secretKey.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
