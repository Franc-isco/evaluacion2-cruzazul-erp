#!/bin/bash

echo "Iniciando prueba de carga para evidenciar Auto Scaling..."

sudo apt update -y
sudo apt install -y stress

stress --cpu 2 --timeout 300

echo "Prueba de carga finalizada."
