FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# Se monta el volumen en runtime para desarrollo,
# pero copiamos el resto para tener la imagen preparada
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
