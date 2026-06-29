#!/bin/bash
apt update -y
apt install -y docker.io docker-compose git

systemctl enable docker
systemctl start docker

cd /srv/cruz_azul-erp/db
docker-compose -f docker-compose.bd.yml up -d
