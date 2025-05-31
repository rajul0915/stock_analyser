# Build frontend
FROM node:20-alpine as frontend-build
WORKDIR /app/frontend
COPY ../frontend/package*.json ./
RUN npm install
COPY ../frontend ./
RUN npm run build

# Backend build
FROM node:20-alpine as backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# Nginx image will copy from frontend-build
FROM nginx:1.25-alpine as nginx
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Backend runtime stage
FROM node:20-alpine as backend-runtime
WORKDIR /app/backend
COPY --from=backend /app/backend /app/backend
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
