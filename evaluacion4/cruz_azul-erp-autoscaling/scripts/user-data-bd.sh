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

cd /srv/cruz_azul-erp/db
docker-compose -f docker-compose.bd.yml up -d
