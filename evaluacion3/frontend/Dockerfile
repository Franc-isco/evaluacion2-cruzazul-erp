# Usar versión estable LTS de Node.js
FROM node:20
# Crear directorio de trabajo
WORKDIR /app
# Copiar package.json y package-lock.json
COPY package*.json ./
# Instalar dependencias
RUN npm install
# Copiar el resto del frontend
COPY . .
# Exponer puerto 3000
EXPOSE 3000
# Comando para iniciar la app
CMD ["node", "server.js"]
