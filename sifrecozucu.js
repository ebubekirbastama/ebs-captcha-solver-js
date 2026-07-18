var script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
document.head.appendChild(script);

/**
 * CAPTCHA okuma modülü
 * 1. Görseli alır.
 * 2. Canvas üzerinde ön işleme (gri tonlama, eşikleme) yapar.
 * 3. Tesseract.js ile OCR işlemini gerçekleştirir.
 */
async function captchaCozucu() {
    // 1. DOM elemanını kontrol et
    const img = document.querySelector("#captcha");
    if (!img || !img.complete) {
        console.error("CAPTCHA görseli bulunamadı veya yüklenmedi.");
        return null;
    }

    // 2. İşleme için canvas oluştur
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);

    // 3. Görseli işleme (Binary/Siyah-Beyaz)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const esik = 145; // Siyah-beyaz ayrımı için eşik değeri

    for (let i = 0; i < data.length; i += 4) {
        const gri = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        const deger = gri < esik ? 0 : 255;
        data[i] = data[i + 1] = data[i + 2] = deger;
        data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    // 4. Tesseract OCR işlemi
    try {
        // Tesseract worker oluştur
        const worker = await Tesseract.createWorker('eng');
        
        // Sadece rakamlara odaklanması için whitelist ayarı
        await worker.setParameters({
            tessedit_char_whitelist: '0123456789',
        });

        // OCR sonucunu al
        const { data: { text } } = await worker.recognize(canvas);
        const sonuc = text.trim();

        console.log("CAPTCHA Başarıyla Çözüldü:", sonuc);
        
        // Belleği temizle
        await worker.terminate();
        
        return sonuc;
    } catch (err) {
        console.error("OCR hatası:", err);
        return null;
    }
}

 captchaCozucu().then(kod => console.log("Forma girilecek kod:", kod));
