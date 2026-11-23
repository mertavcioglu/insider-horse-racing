# Horse Racing özellikleri

**Tamamlandı** uygulandı ve doğrulandı. **Devam Ediyor** kısmen uygulandı. **Planlandı** henüz uygulanmadı.

## A. Orijinal case gereksinimleri

Kaynak, Insider One'ın *Software Developer Assessment Project* PDF'sidir.

| Özellik | Durum | Davranış |
| --- | --- | --- |
| At havuzu, renkler ve kondisyon | Tamamlandı | Oyunda 20 at bulunur. Her ata farklı bir renk ve 1–100 aralığında rastgele bir tam sayı kondisyon puanı verilir. At listesinde ad, renk ve kondisyon görünür. |
| Altı turluk program | Tamamlandı | **Generate Program** sırasıyla 1200, 1400, 1600, 1800, 2000 ve 2200 m mesafelerinde altı tur oluşturur. Her tur mevcut havuzdan rastgele ve tekrarsız 10 at seçer. Program paneli mesafeleri, kulvarları ve at adlarını gösterir. |
| Start ile sıralı yarış akışı | Tamamlandı | Program oluşturulunca **Start** ilk turu başlatır. Sonraki beş tur sırayla ve otomatik başlar. Altıncı turun sonunda program tamamlanır. |
| Pistte at hareketi | Tamamlandı | Aktif turun numarası, mesafesi ve 10 katılımcısı pistte gösterilir. Atlar kendi kulvarında soldan sağa ilerler ve bitiş konumunda kalır. Yeni turda pist o turun katılımcılarını gösterir. |
| Tur sonuçlarının sırasıyla gösterilmesi | Tamamlandı | Her turun sonucu son at bitirdiğinde Pinia'ya kaydedilir ve Sonuçlar paneline eklenir. Kaydırılabilir panel tur numarasını, mesafeyi, 10 atın bitiş sırasını, adını, rengini ve yarış saniyesi cinsinden süresini gösterir. Altı sonuç program tamamlandıktan sonra da görüntülenebilir. |
| Merkezi durum, bileşenler ve kod yapısı | Tamamlandı | Pinia, atları, programı ve yarış durumunu tutar. Vue bileşenleri ekranı oluşturur. Saf TypeScript fonksiyonları yarış kurallarını, composable ise tarayıcı zamanlayıcısını yönetir. |
| PDF bonusları: birim ve E2E testleri | Tamamlandı | Vitest hesaplamaları, Pinia geçişlerini ve zamanlayıcı yaşam döngüsünü doğrular. Playwright, altı turluk kullanıcı akışını Chromium'da doğrular. |
| PDF bonusu: görsel regresyon testleri | Planlandı | Ekran görüntüsü karşılaştırması henüz kurulmadı. |

## B. Uygulama kararları ve eklenen davranışlar

| Özellik | Durum | Davranış |
| --- | --- | --- |
| PDF'deki at sayısı belirsizliği | Tamamlandı | PDF'de rastgele 1–20 at ifadesi ve toplam 20 at kuralı bulunuyor. Onaylanan yorum, uygulama açılışında her zaman 20 at oluşturmak ve kondisyonlarını rastgele belirlemek. |
| At kimliği ve tur seçimi | Tamamlandı | Her atın benzersiz sayısal kimliği vardır. Adlar ve renkler sabit listelerden atanır. Her tur havuzun tamamından bağımsız bir çekiliş yapar. Aynı at farklı turlarda tekrar seçilebilir. |
| Programı yenileme | Tamamlandı | **Generate Program** hazır ve tamamlanmış programı yenileyebilir. Yarış ilerlerken, duraklatılmışken ve turlar arasında düğme ve Pinia işlemi kilitlidir. Yeni program simülasyonu, yarış saatini ve sonuçları sıfırlar, at kimliklerini ve kondisyonları korur. Yeni Start birinci turdan başlar. |
| Responsive yerleşim ve panel durumları | Tamamlandı | Geniş ekranda at listesi solda, numaralı pist ortada, Program ve Sonuçlar sağdadır. Dar ekranlarda paneller alt satırlara geçer. At listesi ve program tabloları kaydırılabilir. Program panelinde aktif, tamamlanan ve bekleyen turlar etiketlenir. Pist, program tamamlandığında durum mesajı gösterir. |
| Kondisyon bazlı hız | Tamamlandı | Kondisyon 1–100 aralığından 14–18 m/s temel hıza doğrusal olarak çevrilir. Her atın tur formu 0,88–1,12 çarpanı, üç eşit mesafe bölümünün temposu ise ayrı ayrı 0,95–1,05 çarpanı alır. Yüksek kondisyon avantaj sağlar, yakın kondisyonlu atlarda rastgelelik sıralamayı değiştirebilir. Simülasyon zamanı gerçek zamandan sekiz kat hızlıdır. Aynı hesap her altı mesafe için çalışır. |
| Yarış saati ve pist animasyonu | Tamamlandı | Tek bir `requestAnimationFrame` döngüsü geçen süreyi günceller. Pist aynı hız parçalarından hesaplanan ilerleme yüzdesini kulvar genişliğine göre uygular. Pencere boyutu değişse de ilerleme oranı korunur. |
| Yarış durumları ve tur geçişi | Tamamlandı | Pinia bekleme, hazır, çalışıyor, duraklatıldı, geçiş ve tamamlandı durumlarını yönetir. İlk beş turun sonucu kaydedildikten sonra pist 1,5 saniye bitiş konumunda kalır ve yarış kontrolü devre dışıdır. Sonraki tur sıfır süreyle ve yeni hız değerleriyle başlar. Uygulama bileşeni kaldırıldığında bekleyen kare ve geçiş zamanlayıcısı iptal edilir. |
| Pause ve Resume | Tamamlandı | Pause, tıklamaya kadarki yarış süresini kaydedip animasyonu durdurur. Resume zaman referansını yeniden alır ve o konumdan devam eder. Duraklamada geçen zaman yarışa eklenmez. Art arda tıklamalar ikinci bir animasyon döngüsü oluşturmaz. |
| Bitiş zamanı ve eşitlik kuralı | Tamamlandı | Bir atın bitiş zamanı üç mesafe bölümünün süreleri toplanarak hesaplanır. Sıralama yuvarlanmamış bitiş zamanına göre yapılır. Tam eşitlikte küçük kulvar numarası öne geçer. Panel süreyi iki ondalık basamakla gösterir. |
| Proje altyapısı | Tamamlandı | Vue 3 Composition API ve `<script setup>`, TypeScript, Vite, Pinia ve CSS kullanılır. `npm run build` önce Vue ve TypeScript tiplerini denetler, ardından üretim paketini oluşturur. |

## Otomatik testleri çalıştırma

- `npm test` birim testlerini çalıştırır. Geliştirme sırasında `npm run test:watch` kullanılabilir. Testler tekrarlanabilir sonuçlar için sabit rastgelelik ve sanal zaman kullanır.
- `npx playwright install chromium` tarayıcıyı hazırlar. `npm run test:e2e` Vite'ı başlatıp program oluşturma, Pause/Resume, altı turun sonuçları ve programı sıfırlama akışını test eder. Tarayıcı saati yalnızca test içinde ilerletilir.
- `npm run build` uygulamayla birlikte TypeScript test dosyalarını da tip denetiminden geçirir.

## Güncelleme kuralı

Her geliştirme aşamasının sonunda bu dosyayı kodla karşılaştır. Yeni veya değişen davranışı ilgili satırda güncelle, yürürlükten kalkan davranışı çıkar ve doğrulanan özelliklerin durumunu değiştir.
