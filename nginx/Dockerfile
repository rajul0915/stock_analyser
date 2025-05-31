# Build frontend
FROM node:20-alpine as frontend-build
WORKDIR /app
COPY ../frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY ../frontend ./frontend
RUN cd frontend && npm run build

# nginx stage
FROM nginx:1.25-alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html
