#!/bin/bash

apt update -y
apt install -y docker.io docker-compose git

systemctl enable docker
systemctl start docker

mkdir -p /srv

if [ ! -d "/srv/evaluacion2-cruzazul-erp" ]; then
  git clone https://github.com/Franc-isco/evaluacion2-cruzazul-erp.git /srv/evaluacion2-cruzazul-erp
fi

rm -rf /srv/cruz_azul-erp
cp -r /srv/evaluacion2-cruzazul-erp/evaluacion4/cruz_azul-erp-autoscaling /srv/cruz_azul-erp

cat > /srv/cruz_azul-erp/.env <<EOF
PORT=3000

APP_USER=admin
APP_PASSWORD=admin123

JWT_SECRET=CambiarJWTSecret2026
TOTP_SECRET=CambiarTOTPSecret2026

DB_HOST=IP_PRIVADA_EC2_BD
DB_PORT=5432
DB_NAME=cruzazuldb
DB_USER=postgres
DB_PASSWORD=CambiarPasswordBD2026
EOF

cd /srv/cruz_azul-erp
docker-compose up -d --build
