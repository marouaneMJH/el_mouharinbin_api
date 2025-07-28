# Documentation du Makefile – Déploiement avec Docker

Ce projet est une application NestJS organisée selon une architecture microservices. Le processus de développement et d'exécution est automatisé à l'aide d'un fichier Makefile afin de faciliter l'utilisation de Docker et Docker Compose.

## Prérequis

Avant d'exécuter les commandes décrites ci-dessous, vous devez avoir installé :

- Docker : https://www.docker.com/
- Docker Compose (inclus dans Docker Desktop)
- GNU Make (souvent préinstallé sur Linux/macOS, sinon installable via `sudo apt install make`)

## Contenu du Makefile

### 1. `make build`

Cette commande construit l’image Docker à partir du `Dockerfile`. Elle prépare l’environnement de production ou de développement dans un conteneur isolé.

**Equivalent :**

```bash
docker compose build
```

### 2. `make up`

Lance l’application avec Docker Compose en mode détaché (en arrière-plan). Cela démarre tous les services définis dans `docker-compose.yml`.

**Equivalent :**

```bash
docker compose up -d
```

### 3. `make logs`

Affiche les logs de tous les services en cours d’exécution via Docker Compose.

**Equivalent :**

```bash
docker compose logs -f
```

### 4. `make down`

Arrête les conteneurs et supprime les réseaux associés créés par Docker Compose.

**Equivalent :**

```bash
docker compose down
```

### 5. `make restart`

Redémarre les conteneurs (équivalent de `down` puis `up`).

**Commande composée :**

```bash
make down && make up
```

### 6. `make exec service=nom_du_service`

Permet d’entrer dans le conteneur d’un service spécifique défini dans `docker-compose.yml`.

**Exemple :**

```bash
make exec service=api-gateway
```

**Equivalent :**

```bash
docker exec -it nom_du_service sh
```

## Exemple d’utilisation

```bash
make build        # Construit les images
make up           # Lance les services
make logs         # Affiche les logs
make exec service=my-service # Accède au conteneur d'un service
make down         # Stoppe et nettoie les services
```

## Conclusion

L’objectif du Makefile est de simplifier et standardiser les commandes complexes ou répétitives liées au développement avec Docker. Cela permet une meilleure productivité et une cohérence entre les différents environnements de l’équipe.
