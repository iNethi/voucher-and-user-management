# ---- Base Node ----
FROM node:18-alpine AS base
WORKDIR /app
COPY package.json .
RUN npm install -g npm@9.8.1` to update!
RUN npm install
COPY . .

# ---- Build ----
FROM base AS build
RUN npm run build

# --- Release with Alpine ----
FROM nginx:1.19.0-alpine AS release
WORKDIR /app
COPY --from=build /app/build /usr/share/nginx/html
# Copy the default nginx.conf provided by tiangolo/node-frontend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]