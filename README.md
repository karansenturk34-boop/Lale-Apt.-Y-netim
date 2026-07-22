# Lale Apt. Kasa Defteri — Netlify Kurulumu

Bu klasör, uygulamayı Netlify üzerinde herkesin görüntüleyebileceği ama
sadece senin (yönetici şifresiyle) düzenleyebileceğin şekilde çalıştırır.

## 1) Gerekli araç: Netlify CLI

Bilgisayarında Node.js kurulu olmalı (https://nodejs.org adresinden indirebilirsin).
Sonra terminalde:

```
npm install -g netlify-cli
netlify login
```

Bu, tarayıcıda Netlify hesabınla giriş yapmanı ister.

## 2) Bu klasörde bağımlılıkları kur

Terminalde bu klasörün içindeyken:

```
npm install
```

## 3) Siteyi oluştur ve yayınla

```
netlify init
```

Sorulara şu şekilde cevap ver:
- "Create & configure a new site" seç
- Takım/hesabını seç
- Site adı: istediğin bir isim ver (ör. lale-apt-defteri)

Ardından:

```
netlify deploy --prod
```

Bu, siteni canlıya alır ve sana bir `https://....netlify.app` linki verir.

## 4) Yönetici şifresini ayarla (ÇOK ÖNEMLİ)

Netlify Dashboard'a git → Sitenin ayarları → **Environment variables**
→ "Add a variable" ile şunu ekle:

- Key: `ADMIN_PASSWORD`
- Value: (kendi seçtiğin, kimseyle paylaşmayacağın bir şifre)

Değişkeni ekledikten sonra tekrar yayınla:

```
netlify deploy --prod
```

(Environment variable eklemek yeniden deploy gerektirir.)

## 5) Kullanım

- Siteyi kim açarsa açsın, veriler otomatik görünür ama **düzenleyemez**
  (sadece görüntüleme modu).
- Sen "Yönetici Girişi" butonuna tıklayıp yukarıda belirlediğin şifreyi
  girdiğinde düzenleme modunu açarsın. Bu, tarayıcı sekmesi kapanana kadar
  (oturum boyunca) hatırlanır.
- Paylaşacağın kişilere sadece linki ver — şifreyi kimseyle paylaşma.

## Notlar

- Veriler Netlify Blobs üzerinde (Netlify'ın kendi bulut deposu) tutulur,
  herkese aynı canlı veri gösterilir.
- Şifreni unutursan, Environment variables kısmından `ADMIN_PASSWORD`
  değerini değiştirip tekrar deploy edebilirsin.
- İstersen "Yedek al" butonuyla arada JSON yedeği indirip ayrı bir yerde
  saklamaya devam edebilirsin.
