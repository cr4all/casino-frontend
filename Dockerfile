FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=http://localhost:8000/api/v1
ARG VITE_TAWK_PROPERTY_ID=
ARG VITE_TAWK_WIDGET_ID=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_TAWK_PROPERTY_ID=$VITE_TAWK_PROPERTY_ID
ENV VITE_TAWK_WIDGET_ID=$VITE_TAWK_WIDGET_ID

RUN npm run build

FROM nginx:alpine

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
