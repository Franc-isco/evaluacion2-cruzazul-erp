# Arquitectura propuesta - Evaluación 4

## Caso de estudio

La cadena de farmacias Cruz Azul requiere mejorar la disponibilidad, monitoreo y escalabilidad de su sistema ERP web, incorporando servicios de AWS como Elastic Load Balancing, Auto Scaling Group, Amazon CloudWatch y Amazon EC2.

La problemática principal consiste en asegurar que el aplicativo pueda mantenerse disponible ante un aumento de carga, distribuir el tráfico entre varias instancias y monitorear el rendimiento de la infraestructura para tomar acciones automáticas ante eventos de alto consumo.

## Objetivo de la arquitectura

Implementar una maqueta funcional en AWS que permita:

- Distribuir el tráfico web mediante un Application Load Balancer.
- Escalar automáticamente instancias EC2 del frontend.
- Monitorear el consumo de CPU mediante Amazon CloudWatch.
- Mantener la base de datos PostgreSQL en una instancia EC2 privada.
- Proteger el acceso al ERP mediante login, MFA y token JWT.
- Utilizar AMI para replicar instancias del aplicativo.
- Documentar costos, evidencias y cronograma del proyecto.

## Componentes principales

- VPC personalizada.
- Subredes públicas para el Load Balancer.
- Subredes privadas para instancias EC2 del frontend.
- Subred privada para la base de datos PostgreSQL.
- Application Load Balancer.
- Target Group.
- Launch Template.
- Auto Scaling Group.
- Amazon CloudWatch.
- Amazon S3.
- Security Groups.
- Amazon Machine Image AMI.

## Flujo de funcionamiento

Cliente Web → Application Load Balancer → Target Group → EC2 Frontend Node.js/Express → EC2 PostgreSQL Dockerizado

## Seguridad aplicada

La arquitectura considera una separación por capas:

### Capa pública

En esta capa se ubica el Application Load Balancer, encargado de recibir las solicitudes HTTP desde internet y distribuirlas hacia las instancias del frontend.

### Capa de aplicación

En esta capa se ubican las instancias EC2 que ejecutan el ERP desarrollado con Node.js y Express. Estas instancias forman parte de un Auto Scaling Group, permitiendo aumentar o reducir la cantidad de servidores según la demanda.

### Capa de datos

La base de datos PostgreSQL se ejecuta en una instancia EC2 bajo modelo IaaS, utilizando Docker. Esta instancia no queda expuesta directamente a internet y solo permite conexiones desde el Security Group del frontend.

### Capa de monitoreo

Amazon CloudWatch permite revisar métricas de rendimiento, principalmente el uso de CPU. A partir de estas métricas se generan alarmas que permiten activar el escalado automático.

## Justificación del Load Balancer

Se utiliza un Application Load Balancer porque la aplicación ERP funciona como un servicio web HTTP. Este tipo de balanceador permite distribuir solicitudes entre múltiples instancias del frontend, mejorar la disponibilidad y trabajar de forma integrada con Target Groups y Auto Scaling Group.

## Justificación del Auto Scaling

El Auto Scaling Group permite ajustar automáticamente la cantidad de instancias EC2 según la carga del sistema. Para esta evaluación se considera la configuración solicitada:

- Capacidad mínima: 1 instancia.
- Capacidad deseada: 4 instancias.
- Capacidad máxima: 8 instancias.

Esto permite mantener disponibilidad del servicio, responder ante aumentos de demanda y reducir recursos cuando la carga disminuye.

## Justificación de CloudWatch

CloudWatch se utiliza para monitorear el rendimiento de la infraestructura, especialmente el uso de CPU de las instancias EC2. Con esta información se pueden generar alarmas para escalar o reducir instancias de forma automática.

## Justificación de PostgreSQL en EC2

La base de datos se implementa bajo modelo IaaS utilizando una instancia EC2 con PostgreSQL dockerizado. Esta decisión permite cumplir con el requerimiento de contar con una base de datos administrada desde una instancia, manteniendo control sobre el sistema operativo, contenedor y configuración del servicio.
