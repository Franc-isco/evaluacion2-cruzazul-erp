# Evaluación 4 - Arquitectura Cloud Segura con Auto Scaling y Load Balancer

Proyecto correspondiente a la Evaluación N°4 de Arquitectura Multi Cloud.

Esta evaluación considera la implementación de una arquitectura en AWS para Farmacia Cruz Azul, incorporando:

- Application Load Balancer.
- Auto Scaling Group.
- Amazon CloudWatch.
- Instancias EC2 para Web ERP.
- Instancia EC2 para base de datos PostgreSQL dockerizada.
- Seguridad por capas mediante VPC, subredes y Security Groups.
- Portal web con autenticación, MFA y JWT.
- Evidencias técnicas de despliegue, monitoreo, escalado y costos.

## Estructura inicial del proyecto

```text
evaluacion4/
└── cruz_azul-erp-autoscaling/
    ├── frontend/
    ├── db/
    ├── scripts/
    ├── docker-compose.yml
    ├── .env.example
    └── README.md
