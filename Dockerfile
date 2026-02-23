FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN pnpm run build

# Expose the port that the server will listen on
EXPOSE 5173

# Start the application
CMD [ "pnpm", "run", "preview" ]
