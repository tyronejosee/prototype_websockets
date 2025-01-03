# Prototype WebSockets

Los **WebSockets** son un protocolo de comunicación que permite la comunicación bidireccional y persistente entre un servidor y un cliente a través de una única conexión TCP. A diferencia de los métodos tradicionales como HTTP, donde el cliente realiza una solicitud y el servidor responde, WebSockets permiten una comunicación en tiempo real, donde el servidor puede enviar datos al cliente en cualquier momento sin necesidad de que el cliente realice una nueva solicitud.

![WebSockets](./main.webp)

## 💻 General

### 🗃️ Repository

Clone the repository.

```bash
git clone git@github.com:tyronejosee/prototype_websockets.git
```

## 🛠️ Backend

### ⚙️ Installation

Activate the virtual environment:

```bash
pipenv shell
```

Install dependencies:

```bash
poetry install
```

Verify dependencies:

```bash
poetry show
```

Run the development server using `uvicorn`:

```bash
uvicorn core.asgi:application --host 127.0.0.1 --port 8000
```

Or using `daphne`:

```bash
daphne -b 127.0.0.1 -p 8000 core.asgi:application
```

Run the migrations:

```bash
python manage.py migrate
```

Create a superuser to access the entire site without restrictions:

```bash
python manage.py createsuperuser
```

Log in to `admin`:

```bash
http://127.0.0.1:8000/admin/
```

## 🎨 Frontend

The front end of the application was created with [Next.js](https://nextjs.org/) using the App Router introduced in Next.js 13 and the package manager [PNPM](https://pnpm.io/).

### ✅ Requirements

- [Node.js](https://nodejs.org/) >= 16.8.0
- [PNPM](https://pnpm.io/installation) >= 7.0

### ⚙️ Installation (Front-end)

To get started, make sure you have [PNPM](https://pnpm.io/installation) installed on your system. Then, follow these steps:

Navigate to the `frontend` folder:

```bash
cd ./frontend/
```

Install the dependencies:

```bash
pnpm install
```

### Available Scripts

Start the development server at `http://localhost:5173/`:

```bash
pnpm dev
```

Enjoy! 🎉
