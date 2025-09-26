# Use an official Node runtime as a parent image

# ------------------------------
# 1. Build stage
# ------------------------------
FROM node:20 as build

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json to the working directory
COPY ./package*.json ./

# Install the dependencies
RUN npm install

# Copy the remaining application files to the working directory
COPY . .

# Build the application
RUN npm run build

# ------------------------------
# 2. Serve stage
# ------------------------------
FROM nginx:stable-alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy build output to nginx html folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config (optional, for SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# Expose port 5173 for the application
#EXPOSE 5173

# Start the application
#CMD ["npm", "run", "preview", "--", "--host"]
