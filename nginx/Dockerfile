FROM node:16-alpine3.14 as build

WORKDIR /frontend
COPY ./frontend/package.json ./
# COPY ./frontend/package-lock.json ./
RUN npm install
COPY ./frontend/ ./
RUN npm run build


FROM nginx:1.18.0-alpine

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /frontend/dist /usr/share/nginx/html
# COPY ./mount/staticfiles /staticfiles