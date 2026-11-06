"""Скачивает фото с Unsplash в папку images/.
Запуск: python download_images.py   (нужен интернет, Python 3)"""
import os, urllib.request

FILES = {
    'tractor-1.jpg': 'photo-1530267981375-f0de937f5f13',
    'tractor-2.jpg': 'photo-1592982537447-7440770cbfc9',
    'tractor-3.jpg': 'photo-1605338803155-8b0e6d8f2a73',
    'combine-1.jpg': 'photo-1574323347407-f5e1ad6d020b',
    'combine-2.jpg': 'photo-1500382017468-9049fed747ef',
    'parts.jpg': 'photo-1581092160562-40aa08e78837',
    'oils.jpg': 'photo-1635784063388-1ff609e5d5f5',
    'crop-protection.jpg': 'photo-1464226184884-fa280b87c399',
}
HERE = os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(HERE, 'images'), exist_ok=True)
for name, uid in FILES.items():
    url = f'https://images.unsplash.com/{uid}?auto=format&fit=crop&w=1600&q=80'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=30) as r, open(os.path.join(HERE, 'images', name), 'wb') as f:
            f.write(r.read())
        print('OK  ', name)
    except Exception as e:
        print('FAIL', name, e)
