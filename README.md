# TeacherUC 👨‍🎓👩‍🎓

Plataforma para conectar estudiantes con tutores.

## 📦 Requisitos

- **Node.js** `>= 18.18.0`
- **NPM** `>= 9`
- **Docker** y **Docker Compose** instalados
- (Opcional) **Python 3.11+** si deseas ejecutar el backend sin Docker


## 🚀 Setup

### 1. Clona el repositorio

### 2. Añade las variables de entorno del backend

Crea un archivo `.env` junto a `docker-compose.yml` con las siguientes variables:

```
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_DB
DATABASE_URL
```

### 3. Correr backend con Docker

```
docker-compose up --build
```

### 4. Setup del frontend

```
npm install
```

### 5. Añade las variables de entorno de frontend

```
VITE_API_URL
```

### 6. Correr frontend

```
npm run dev
```

## 🚀 Setup local
### 1. Clonar repositorio

### 2. Añade las variables de entorno de frontend

```
VITE_API_URL
```

### 3. Ejecutar

```
npm install
```

### 4. Ejecutar

```
npm run dev
```

## 🧪 Tests

Este proyecto utiliza [Vitest](https://vitest.dev/) para pruebas unitarias y [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) para la interacción con los componentes.

### 📁 Estructura

Los archivos de test están ubicados junto a sus respectivos componentes, dentro de carpetas `tests/` cuando aplica.

Luego puedes ejecutar los tests con:
```npx vitest```

O puedes abrir la consola interactiva de tests con
```npx vitest --ui```