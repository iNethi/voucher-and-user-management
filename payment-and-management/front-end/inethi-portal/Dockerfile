# ---- Base Node ----
FROM node:18-alpine AS base
WORKDIR /app
COPY package.json .
RUN npm install -g npm@9.6.5
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

# Copy start script and make it executable
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80
CMD ["/start.sh"]