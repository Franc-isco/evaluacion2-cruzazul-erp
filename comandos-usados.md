# Comandos utilizados - Evaluación 2 Cruz Azul ERP

## 1. Conexión SSH al Frontend

```bash
ssh -i "cruzazul-key.pem" admin@IP_ELASTICA_FRONTEND
```

## 2. Conexión desde Frontend a BD privada

```bash
ssh -i "cruzazul-key.pem" admin@IP_PRIVADA_BD
```

## 3. Actualizar e instalar dependencias

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install git docker.io curl -y
```

## 4. Iniciar Docker

```bash
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker admin
```


## 5. Instalar Docker Compose manualmente

```bash
mkdir -p ~/.docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.29.7/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose
docker compose version
```

## 6. Crear carpeta de trabajo y clonar repositorio

```bash
sudo mkdir -p /srv
sudo chown admin:admin /srv
cd /srv
git clone https://github.com/Franc-isco/evaluacion2-cruzazul-erp.git
cd evaluacion2-cruzazul-erp
```

## 7. Levantar Base de Datos en EC2 privada

```bash
docker compose -f docker-compose.bd.yml up -d --build
```

## 8. Levantar Frontend en EC2 pública

```bash
docker compose -f docker-compose.frontend.yml up -d --build
```

## 9. Ver contenedores activos

```bash
docker ps
```

## 10. Ver logs

Frontend:

```bash
docker logs cruzazul_frontend
```

Base de datos:

```bash
docker logs cruzazul_postgres
```

## 11. Entrar a PostgreSQL

```bash
docker exec -it cruzazul_postgres psql -U cruzazul_user -d cruzazul_db
```

## 12. Consultar productos

```sql
\dt
SELECT * FROM productos;
```

Salir:

```sql
\q
```

## 13. Detener servicios

Frontend:

```bash
docker compose -f docker-compose.frontend.yml down
```

Base de datos:

```bash
docker compose -f docker-compose.bd.yml down
```

## 14. Probar aplicación

Aplicación web:

```text
http://IP_ELASTICA_FRONTEND
```

API productos:

```text
http://IP_ELASTICA_FRONTEND/api/productos
```

## 15. Subir cambios a GitHub

```bash
git status
git add .
git commit -m "Actualizar documentación del proyecto"
git push
```


