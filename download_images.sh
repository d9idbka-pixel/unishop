#!/bin/sh
# Скачивает фото с Unsplash в images/. Запуск: sh download_images.sh
cd "$(dirname "$0")" && mkdir -p images
curl -L -A "Mozilla/5.0" -o "images/tractor-1.jpg" "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=1600&q=80"
curl -L -A "Mozilla/5.0" -o "images/tractor-2.jpg" "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1600&q=80"
curl -L -A "Mozilla/5.0" -o "images/tractor-3.jpg" "https://images.unsplash.com/photo-1605338803155-8b0e6d8f2a73?auto=format&fit=crop&w=1600&q=80"
curl -L -A "Mozilla/5.0" -o "images/combine-1.jpg" "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=1600&q=80"
curl -L -A "Mozilla/5.0" -o "images/combine-2.jpg" "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80"
curl -L -A "Mozilla/5.0" -o "images/parts.jpg" "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1600&q=80"
curl -L -A "Mozilla/5.0" -o "images/oils.jpg" "https://images.unsplash.com/photo-1635784063388-1ff609e5d5f5?auto=format&fit=crop&w=1600&q=80"
curl -L -A "Mozilla/5.0" -o "images/crop-protection.jpg" "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1600&q=80"
