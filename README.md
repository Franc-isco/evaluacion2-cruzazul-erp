# Evaluación 2 - ERP Farmacia Cruz Azul

## Descripción del proyecto

Este proyecto corresponde a la Evaluación N°2 de la asignatura Arquitectura Multi Cloud.  
Consiste en el desarrollo de una maqueta prototipo para la cadena de farmacias Cruz Azul, utilizando una arquitectura basada en microservicios dockerizados y desplegada sobre infraestructura Cloud en AWS.

La solución implementa un sistema ERP básico para el registro y consulta de productos farmacéuticos, utilizando un frontend desarrollado con Node.js y Express, y una base de datos PostgreSQL ejecutada mediante Docker.

## Objetivo

Implementar un prototipo funcional en la nube que permita demostrar el uso de contenedores Docker, separación de servicios, conexión entre frontend y base de datos, control de acceso mediante Security Groups y despliegue sobre instancias EC2 en AWS.

## Tecnologías utilizadas

- AWS EC2
- VPC, subred pública y subred privada
- Internet Gateway
- NAT Gateway
- Security Groups
- Elastic IP
- Docker
- Docker Compose
- Node.js
- Express
- PostgreSQL
- GitHub
- HTML, CSS y JavaScript

## Arquitectura implementada

La solución se compone de dos instancias EC2 en AWS:

1. **EC2 Frontend**
   - Ubicada en una subred pública.
   - Tiene IP elástica asociada.
   - Ejecuta un contenedor Docker con Node.js y Express.
   - Expone el puerto 80 para acceso desde navegador.

2. **EC2 Base de Datos**
   - Ubicada en una subred privada.
   - No tiene IP pública.
   - Ejecuta un contenedor Docker con PostgreSQL.
   - Solo permite conexión desde la instancia frontend por el puerto 5432

evaluacion2-cruzazul-erp/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   └── public/
│       └── index.html
│
├── database/
│   ├── Dockerfile
│   └── init.sql
│
├── docker-compose.yml
├── docker-compose.frontend.yml
├── docker-compose.bd.yml
└── README.md
