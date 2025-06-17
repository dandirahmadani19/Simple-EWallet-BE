# File: Dockerfile
FROM node:18

WORKDIR /app

# Salin hanya file dependensi dulu
COPY package*.json ./

# Install dependensi dulu (pakai cache Docker layer)
RUN yarn

# Baru salin semua source code
COPY . .

EXPOSE 3000

CMD ["yarn", "dev"]

