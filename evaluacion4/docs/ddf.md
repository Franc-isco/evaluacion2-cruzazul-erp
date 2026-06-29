# DDF - Diseño de Flujo de Datos

## Flujo general del sistema

El sistema ERP Cruz Azul funciona mediante una arquitectura web desplegada en AWS. El usuario accede desde un navegador web al nombre DNS del balanceador de carga. Luego, el Application Load Balancer distribuye la solicitud hacia una de las instancias EC2 disponibles en el Target Group.

## Flujo 1: Acceso del usuario

1. El usuario ingresa al ERP desde un navegador web.
2. La solicitud llega al Application Load Balancer.
3. El balanceador reenvía la solicitud a una instancia EC2 saludable del frontend.
4. El frontend muestra el portal de autenticación.

## Flujo 2: Autenticación y acceso condicional

1. El usuario ingresa usuario y contraseña.
2. El servidor Node.js valida las credenciales.
3. Si las credenciales son correctas, solicita el código MFA.
4. El usuario ingresa el código MFA.
5. Si el código es correcto, el sistema genera un token JWT.
6. El usuario puede acceder al dashboard solo si el token es válido.

## Flujo 3: Consulta a la base de datos

1. El usuario autenticado ingresa al dashboard.
2. El frontend realiza una consulta a PostgreSQL.
3. La base de datos responde con información del sistema.
4. El frontend muestra el estado de conexión y datos disponibles.

## Flujo 4: Balanceo de carga

1. El usuario accede al DNS del Application Load Balancer.
2. El balanceador revisa las instancias saludables del Target Group.
3. La solicitud es enviada a una instancia disponible.
4. Si una instancia falla, el balanceador deja de enviarle tráfico.

## Flujo 5: Escalado automático

1. CloudWatch monitorea el uso de CPU de las instancias EC2.
2. Si el consumo supera el umbral definido, se activa una alarma.
3. El Auto Scaling Group crea nuevas instancias EC2 desde la AMI del frontend.
4. Las nuevas instancias se registran en el Target Group.
5. El Load Balancer comienza a distribuir tráfico hacia las nuevas instancias.

## Flujo 6: Reducción de recursos

1. CloudWatch detecta que el uso de CPU disminuye.
2. Se activa una política de reducción.
3. El Auto Scaling Group termina instancias innecesarias.
4. Se mantiene la cantidad mínima definida para asegurar disponibilidad.

## Resumen del flujo

Usuario → Load Balancer → EC2 Frontend → PostgreSQL en EC2 → CloudWatch → Auto Scaling Group
