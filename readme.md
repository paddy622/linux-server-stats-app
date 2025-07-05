# Linux Server Stats Application

This project is a Linux server statistics application that provides real-time monitoring of server performance metrics. It consists of a frontend built with Tailwind CSS and a backend that serves the API endpoints.

## Project Structure

```
linux-server-stats-app
├── system-monitor-frontend
│   ├── src
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── README.md
├── system-monitor-backend
│   ├── src
│   │   └── app.js
│   ├── package.json
│   └── README.md
├── docker-compose.yml
└── README.md
```

## Getting Started

To get started with the application, follow the instructions below:

### Prerequisites

- Docker
- Docker Compose

### Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd linux-server-stats-app
   ```

2. Build and run the application using Docker Compose:
   ```
   docker-compose up --build
   ```

3. Access the frontend application at `http://localhost:3000` and the backend API at `http://localhost:5000`.

### Frontend

The frontend application is located in the `system-monitor-frontend` directory. It uses Tailwind CSS for styling. Refer to the `system-monitor-frontend/README.md` for more details on the frontend setup and usage.

### Backend

The backend application is located in the `system-monitor-backend` directory. It serves the API endpoints for fetching server statistics. Refer to the `system-monitor-backend/README.md` for more details on the backend setup and usage.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.