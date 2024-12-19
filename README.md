# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:


## Docker Setup

To run this application using Docker, follow these steps:

1. Build the Docker image:
   ```bash
   docker build -t rexett-website-builder-frontend .
   ```

2. Run the container:
   ```bash
   docker run -p 5173:5173 rexett-website-builder-frontend
   ```

3. Access the application:
   Open your browser and navigate to `http://localhost:5173`

Note: Make sure you have Docker installed on your machine before running these commands.


- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
