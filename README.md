# NoFap API – Multi-Service NestJS Application

Welcome to the NoFap API, a modern, scalable backend built with NestJS and organized as a suite of microservices. This project is designed for rapid development, robust security, and seamless integration, making it perfect for teams and production environments.

## 🚀 Key Features

- **Microservices Architecture**: Modular services for authentication, chat, mail, users, and API gateway.
- **Authentication & Authorization**: Secure JWT-based auth, role management, and guards.
- **Real-Time Chat**: Scalable chat service with support for multiple channels and users.
- **Email Service**: Integrated mailer with templates, attachments, and Notion integration.
- **User Management**: CRUD operations, roles, and status tracking for users.
- **API Gateway**: Centralized routing, request validation, and service orchestration.
- **Dockerized Deployment**: Easy setup and scaling with Docker & Docker Compose.
- **Automated Testing**: E2E and unit tests for reliability and CI/CD.
- **Extensible Contracts**: Shared DTOs, enums, and interfaces for type-safe communication.
- **Prisma ORM**: Modern database access and migrations.
- **Configurable & Secure**: Environment-based configs, interceptors, and filters.

## 🏗️ Project Structure

```
apps/
  auth/         # Authentication microservice
  chat/         # Real-time chat microservice
  mail/         # Email service microservice
  users/        # User management microservice
  no-fap-api-gateway/ # API gateway
libs/contract/  # Shared DTOs, enums, interfaces, strategies
```

## 🛠️ Tech Stack

- **NestJS** (TypeScript)
- **Prisma** (ORM)
- **Docker & Docker Compose**
- **Jest** (Testing)
- **Makefile** (Automation)

## ⚡ Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-org/no_fap_api.git
   cd no_fap_api
   ```
2. **Build and start services**
   ```bash
   make build
   make up
   ```
3. **View logs**
   ```bash
   make logs
   ```
4. **Run tests**
   ```bash
   make test
   ```

## 📦 Deployment

- All services are containerized for easy deployment.
- Use `make` commands for building, starting, stopping, and accessing containers.
- See [Documentation du Makefile](#documentation-du-makefile--d%C3%A9ploiement-avec-docker) for details.

## 🤝 Contributing

Pull requests and issues are welcome! Please follow the code style and add tests for new features.

## 📚 Documentation

- See the `/docs` folder and service-specific README files for more details.
- API contracts and DTOs are in `libs/contract/`.

---

Made with ❤️ using NestJS, Docker, and TypeScript.

