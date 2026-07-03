# MangaBlade

[![CodeFactor](https://www.codefactor.io/repository/github/midori-suzune/mangablade/badge)](https://www.codefactor.io/repository/github/midori-suzune/mangablade)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.16-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.7-61DAFB?style=flat-square&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)

## Project Structure

```text
MangaBlade/
├── backend/                                      # Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/mangablade/backend/
│   │   │   │   ├── client/                      # Third-party API clients
│   │   │   │   ├── config/                      # Application configuration
│   │   │   │   ├── controller/                  # REST API controllers
│   │   │   │   ├── dto/                         # Request and response models
│   │   │   │   ├── entity/                      # JPA entities
│   │   │   │   ├── exception/                   # Exception handling
│   │   │   │   ├── repository/                  # Data access repositories
│   │   │   │   ├── security/                    # Authentication and authorization
│   │   │   │   ├── service/                     # Business logic
│   │   │   │   ├── utils/                       # Shared utility functions
│   │   │   │   └── BackendApplication.java      # Application entry point
│   │   │   └── resources/
│   │   │       └── application.yaml              # Spring Boot configuration
│   │   └── test/                                 # Backend tests
│   ├── pom.xml                                   # Maven configuration
│   └── mvnw                                      # Maven wrapper
│
├── frontend/                                     # React application
│   ├── src/
│   │   ├── api/                                  # Axios configuration and API functions
│   │   ├── assets/                               # Images and fonts
│   │   ├── components/                           # Reusable UI components
│   │   ├── css/                                  # Global styles
│   │   ├── hooks/                                # Custom React hooks
│   │   ├── layouts/                              # Shared page layouts
│   │   ├── pages/                                # Route-level page components
│   │   ├── routes/                               # React Router configuration
│   │   ├── types/                                # Shared TypeScript types
│   │   ├── utils/                                # Utility functions
│   │   ├── App.tsx                               # Root React component
│   │   └── main.tsx                              # Frontend entry point
│   ├── index.html                                # HTML entry point
│   ├── package.json                              # npm scripts and dependencies
│   └── vite.config.ts                            # Vite configuration
│
├── compose.yaml                                  # Local Docker services
├── .env                                          # Local environment variables
├── .env.example                                  # Environment variable template
├── .gitignore                                    # Git ignore rules
└── README.md                                      # Project documentation
```
