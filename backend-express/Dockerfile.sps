FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
RUN npx prisma generate
COPY . .
EXPOSE 5000
CMD ["node", "sps-api.js"]
