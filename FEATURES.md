# Horse Racing özellikleri

**Tamamlandı** uygulandı ve doğrulandı. **Devam Ediyor** kısmen uygulandı. **Planlandı** henüz uygulanmadı.

## A. Orijinal case gereksinimleri

Kaynak, Insider One'ın *Software Developer Assessment Project* PDF'sidir.

| Özellik | Durum | Davranış |
| --- | --- | --- |
| At havuzu, renkler ve kondisyon | Tamamlandı | Oyunda 20 at bulunur. Her ata farklı bir renk ve 1–100 aralığında rastgele bir tam sayı kondisyon puanı verilir. At listesinde ad, renk ve kondisyon görünür. |
| Altı turluk program | Tamamlandı | **Generate Program** sırasıyla 1200, 1400, 1600, 1800, 2000 ve 2200 m mesafelerinde altı tur oluşturur. Her tur mevcut havuzdan rastgele ve tekrarsız 10 at seçer. Program paneli mesafeleri, kulvarları ve at adlarını gösterir. |
| Start ile sıralı yarış akışı | Devam Ediyor | Program oluşturulunca **Start** kullanılabilir hale gelir ve ilk turu başlatır. Sonraki beş turun otomatik olarak sırayla başlaması planlandı. |
| Pistte at hareketi | Tamamlandı | Çalışan turdaki 10 at kendi kulvarında soldan sağa hareket eder. Bitişi geçen at bitiş konumunda kalır. Bu aşamada pistte ilk tur oynatılır. |
| Tur sonuçlarının sırasıyla gösterilmesi | Planlandı | Sonuçlar paneli şu an bir yer tutucu gösterir. Tamamlanan her turun sıralaması, ilgili tur bittiğinde panele eklenecek. |
| Merkezi durum, bileşenler ve kod yapısı | Tamamlandı | Pinia, atları, programı ve yarış durumunu tutar. Vue bileşenleri ekranı oluşturur. Saf TypeScript fonksiyonları yarış kurallarını, composable ise tarayıcı zamanlayıcısını yönetir. |
| PDF bonusları | Planlandı | Vitest birim testleri ve zaman kalırsa Playwright E2E ve görsel regresyon testleri. Mevcut kontroller geçici doğrulama komutlarıyla çalıştırıldı. |

## B. Uygulama kararları ve eklenen davranışlar

| Özellik | Durum | Davranış |
| --- | --- | --- |
| PDF'deki at sayısı belirsizliği | Tamamlandı | PDF'de rastgele 1–20 at ifadesi ve toplam 20 at kuralı bulunuyor. Onaylanan yorum, uygulama açılışında her zaman 20 at oluşturmak ve kondisyonlarını rastgele belirlemek. |
| At kimliği ve tur seçimi | Tamamlandı | Her atın benzersiz sayısal kimliği vardır. Adlar ve renkler sabit listelerden atanır. Her tur havuzun tamamından bağımsız bir çekiliş yapar. Aynı at farklı turlarda tekrar seçilebilir. |
| Programı yenileme | Tamamlandı | **Generate Program** mevcut atları ve kondisyonları koruyarak yeni bir program üretir. Tur çalışırken veya duraklatılmışken düğme ve Pinia işlemi kilitlidir. Tur tamamlandıktan sonra yeni program, önceki simülasyonu ve hesaplanan sırayı sıfırlar. |
| Responsive yerleşim ve panel durumları | Tamamlandı | Geniş ekranda at listesi solda, numaralı pist ortada, Program ve Sonuçlar sağdadır. Dar ekranlarda paneller alt satırlara geçer. At listesi ile program tabloları kaydırılabilir. Program oluşturulana kadar ilgili panel bir yönlendirme gösterir. |
| Kondisyon bazlı hız | Tamamlandı | Kondisyon 1–100 aralığından 14–18 m/s temel hıza doğrusal olarak çevrilir. Her atın tur formu 0,88–1,12 çarpanı, üç eşit mesafe bölümünün temposu ise ayrı ayrı 0,95–1,05 çarpanı alır. Yüksek kondisyon avantaj sağlar, yakın kondisyonlu atlarda rastgelelik sıralamayı değiştirebilir. Simülasyon zamanı gerçek zamandan sekiz kat hızlıdır. Aynı hesap her altı mesafe için çalışır. |
| Yarış saati ve pist animasyonu | Tamamlandı | Tek bir `requestAnimationFrame` döngüsü geçen süreyi günceller. Bileşen, aynı hız parçalarından hesaplanan 0–100% ilerlemeyi kulvar genişliğine göre uygular. Pencere boyutu değişse de ilerleme oranı korunur. Bileşen kaldırıldığında bekleyen animasyon karesi iptal edilir. |
| Pause ve Resume | Tamamlandı | Pause, tıklamaya kadarki yarış süresini kaydedip animasyonu durdurur. Resume zaman referansını yeniden alır ve o konumdan devam eder. Duraklamada geçen zaman yarışa eklenmez. Art arda tıklamalar ikinci bir animasyon döngüsü oluşturmaz. |
| Bitiş sırası ve tur sonu | Tamamlandı | Her atın bitiş zamanı, mesafe bölümlerinin süreleri toplanarak hesaplanır. Son at bitirdiğinde zaman sırasına göre sonuç Pinia'ya yazılır. Tam eşitlikte küçük kulvar numarası öne geçer. İlk tur tamamlanır ve oyun yeni program oluşturulana kadar bitiş durumunda kalır. |
| Proje altyapısı | Tamamlandı | Vue 3 Composition API ve `<script setup>`, TypeScript, Vite, Pinia ve CSS kullanılır. `npm run build` önce Vue ve TypeScript tiplerini denetler, ardından üretim paketini oluşturur. |

## Güncelleme kuralı

Her geliştirme aşamasının sonunda bu dosyayı kodla karşılaştır. Yeni veya değişen davranışı ilgili satırda güncelle, yürürlükten kalkan davranışı çıkar ve doğrulanan özelliklerin durumunu değiştir.
