FROM node:22-alpine
WORKDIR /app/apps/web
COPY apps/web/package.json ./package.json
RUN npm install
COPY apps/web ./
COPY apps/shared /app/shared
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]
