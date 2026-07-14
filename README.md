# MangaBlade

[![CodeFactor](https://www.codefactor.io/repository/github/midori-suzune/mangablade/badge)](https://www.codefactor.io/repository/github/midori-suzune/mangablade)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.16-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.7-61DAFB?style=flat-square&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)


## Environment Notes

The project uses a shared root `.env` file:

```text
MangaBlade/.env
```

```ts
envDir: '../'
```

```env
GOOGLE_CLIENT_ID=your-google-oauth-client-id

VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id

DB_USERNAME=root

DB_PASSWORD=your_password

JWT_SECRET_KEY=your_secret

# Spring Mail Configuration

SPRING_MAIL_HOST=smtp.gmail.com

SPRING_MAIL_PORT=587

SPRING_MAIL_USERNAME=your_email

SPRING_MAIL_PASSWORD=your_password
```

