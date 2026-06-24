const products = [
    {
        "id": 1,
        "brand": "Dyson",
        "title": "Airwrap™ i.d. Çok Amaçlı Saç Şekillendirme Cihazı",
        "category": "guzellik",
        "oldPrice": 34000,
        "newPrice": 29999,
        "image": "images/dyson_airwrap_complete_1782046094385.png",
        "sizes": [
            "Ceramic Pink",
            "Ceramic Apricot",
            "Prussian Blue"
        ],
        "stock": 5,
        "colors": [
            {
                "name": "Ceramic Pink",
                "hex": "#f8c2c6",
                "image": "images/dyson_airwrap_complete_1782046094385.png",
                "filterClass": "filter-none"
            },
            {
                "name": "Ceramic Apricot",
                "hex": "#f4a261",
                "image": null,
                "filterClass": "filter-none"
            },
            {
                "name": "Prussian Blue",
                "hex": "#1d3557",
                "image": null,
                "filterClass": "filter-none"
            }
        ],
        "description": "Dyson'un en yeni saç şekillendiricisi Airwrap™ i.d. akıllı telefon entegrasyonu ve Bluetooth bağlantısı ile kişiselleştirilmiş şekillendirme profilleri oluşturur. Coanda etkisiyle saçları aşırı ısı hasarı olmadan şekillendirir, kurutur ve pürüzsüzleştirir."
    },
    {
        "id": 2,
        "brand": "Roborock",
        "title": "S8 Pro Ultra Akıllı Robot Süpürge ve Çöp İstasyonu",
        "category": "temizlik",
        "oldPrice": 105000,
        "newPrice": 94999,
        "image": "images/roborock_s8.png",
        "sizes": [
            "Siyah",
            "Beyaz"
        ],
        "stock": 3,
        "colors": [
            {
                "name": "Siyah",
                "hex": "#1a1a1a",
                "image": "images/roborock_s8.png",
                "filterClass": "filter-none"
            },
            {
                "name": "Beyaz",
                "hex": "#ffffff",
                "image": null,
                "filterClass": "filter-none"
            }
        ],
        "description": "DuoRoller Riser fırça ve VibraRise 2.0 paspaslama sistemiyle Roborock S8 Pro Ultra, ev temizliğini tamamen eller serbest hale getiriyor. Kendini yıkayan, kurutan ve çöpünü boşaltan hepsi bir arada akıllı şarj istasyonu ile maksimum konfor sağlar."
    },
    {
        "id": 3,
        "brand": "KitchenAid",
        "title": "Artisan 4.8 L Stand Mikser ve Mutfak Şefi",
        "category": "mutfak",
        "oldPrice": 48000,
        "newPrice": 41999,
        "image": "images/kitchenaid_mixer.png",
        "sizes": [
            "İmparator Kırmızı",
            "Mat Siyah",
            "Krem"
        ],
        "stock": 4,
        "colors": [
            {
                "name": "İmparator Kırmızı",
                "hex": "#a8201a",
                "image": "images/kitchenaid_mixer.png",
                "filterClass": "filter-none"
            },
            {
                "name": "Mat Siyah",
                "hex": "#222222",
                "image": null,
                "filterClass": "filter-none"
            },
            {
                "name": "Krem",
                "hex": "#fdf6e2",
                "image": null,
                "filterClass": "filter-none"
            }
        ],
        "description": "Efsanevi tasarımı ve sağlam metal yapısıyla mutfağınızın baş köşesini süsleyecek KitchenAid Artisan Mikser. 10 farklı hız kademesi, 4.8 litrelik paslanmaz çelik haznesi ve zengin aparat seçenekleriyle her türlü hamur işi ve karıştırma tarifini zahmetsizce hazırlar."
    },
    {
        "id": 4,
        "brand": "Nespresso",
        "title": "Vertuo Lattissima Kapsüllü Kahve Makinesi",
        "category": "kahve",
        "oldPrice": 28000,
        "newPrice": 23999,
        "image": "images/nespresso_lattissima_one_1782046170712.png",
        "sizes": [
            "Mat Beyaz",
            "Siyah"
        ],
        "stock": 6,
        "colors": [
            {
                "name": "Mat Beyaz",
                "hex": "#f9f9f9",
                "image": "images/nespresso_lattissima_one_1782046170712.png",
                "filterClass": "filter-none"
            },
            {
                "name": "Siyah",
                "hex": "#111111",
                "image": null,
                "filterClass": "filter-none"
            }
        ],
        "description": "Tek bir tuşla kremamsı cappuccino, latte macchiato veya sade kahve çeşitleri hazırlayabileceğiniz Nespresso Vertuo Lattissima. Centrifusion™ teknolojisiyle her fincan için mükemmel kremayı hazırlar, süt köpürtme sistemiyle barista kalitesinde tarifler sunar."
    },
    {
        "id": 5,
        "brand": "Philips",
        "title": "Lumea IPL Series 9000 Epilasyon Cihazı",
        "category": "guzellik",
        "oldPrice": 16000,
        "newPrice": 12999,
        "image": "images/philips_lumea.png",
        "sizes": [
            "Standart"
        ],
        "stock": 8,
        "colors": [
            {
                "name": "Standart",
                "hex": "#f3e1e1",
                "image": "images/philips_lumea.png",
                "filterClass": "filter-none"
            }
        ],
        "description": "SenseIQ teknolojisine sahip Philips Lumea Series 9000, tüy gelişimini engellemek için ışık atımları (IPL) kullanır. Akıllı başlıkları sayesinde vücut kıvrımlarına özel programlar uygular, cilt tonu sensörüyle en güvenli ve etkili atım seviyesini otomatik belirler."
    },
    {
        "id": 6,
        "brand": "Dyson",
        "title": "Airstrait™ Islak Saç Düzleştirici",
        "category": "guzellik",
        "oldPrice": 26000,
        "newPrice": 22499,
        "image": "images/dyson_airstrait.png",
        "sizes": [
            "Bakır",
            "Prussian Mavi"
        ],
        "stock": 4,
        "colors": [
            {
                "name": "Bakır",
                "hex": "#b87333",
                "image": "images/dyson_airstrait.png",
                "filterClass": "filter-none"
            },
            {
                "name": "Prussian Mavi",
                "hex": "#1b2a47",
                "image": null,
                "filterClass": "filter-none"
            }
        ],
        "description": "Saçları ıslaktan kuruya sadece hava gücü kullanarak düzleştirir. Aşırı ısı hasarı olmadan, plakalar yerine yüksek basınçlı hava akımı sayesinde saç tellerini düzleştirirken doğal hacmini korur ve parlaklık katar."
    },
    {
        "id": 7,
        "brand": "Cosori",
        "title": "Dual Blaze 6.4 L Çift Rezistanslı Akıllı Airfryer",
        "category": "mutfak",
        "oldPrice": 7500,
        "newPrice": 5999,
        "image": "images/cosori_airfryer.png",
        "sizes": [
            "Koyu Gri",
            "Kırmızı"
        ],
        "stock": 10,
        "colors": [
            {
                "name": "Koyu Gri",
                "hex": "#3a3d40",
                "image": "images/cosori_airfryer.png",
                "filterClass": "filter-none"
            },
            {
                "name": "Kırmızı",
                "hex": "#b52b2b",
                "image": null,
                "filterClass": "filter-none"
            }
        ],
        "description": "Çift ısıtma elemanı sayesinde yiyecekleri alt-üst çevirmeye gerek kalmadan eşit ve çıtır şekilde pişiren Cosori Dual Blaze. 6.4 litrelik geniş kapasitesi, akıllı telefon kontrolü ve pratik temizleme özellikleri ile mutfakta geçirdiğiniz zamanı yarıya indirir."
    },
    {
        "id": 8,
        "brand": "Roborock",
        "title": "Q Revo MaxV Sıcak Suyla Paspas Yıkayan Robot Süpürge",
        "category": "temizlik",
        "oldPrice": 48000,
        "newPrice": 41999,
        "image": "images/roborock_qrevo.png",
        "sizes": [
            "Beyaz",
            "Siyah"
        ],
        "stock": 5,
        "colors": [
            {
                "name": "Beyaz",
                "hex": "#ffffff",
                "image": "images/roborock_qrevo.png",
                "filterClass": "filter-none"
            },
            {
                "name": "Siyah",
                "hex": "#1c1d1f",
                "image": null,
                "filterClass": "filter-none"
            }
        ],
        "description": "Rocky AI sesli asistanı ve FlexiArm kenar temizleme teknolojisine sahip Roborock Q Revo MaxV. 60°C sıcak suyla paspas yıkayarak ve kurutarak maksimum hijyen sağlar. 7000 Pa yüksek emiş gücü ve akıllı engelden kaçma özelliği bulunur."
    },
    {
        "id": 10,
        "brand": "De'Longhi",
        "title": "La Specialista Prestigio Manuel Espresso Makinesi",
        "category": "kahve",
        "oldPrice": 54000,
        "newPrice": 47999,
        "image": "images/delonghi_espresso.png",
        "sizes": [
            "Metalik Gri",
            "Mat Siyah"
        ],
        "stock": 3,
        "colors": [
            {
                "name": "Metalik Gri",
                "hex": "#a6a6a6",
                "image": "images/delonghi_espresso.png",
                "filterClass": "filter-none"
            },
            {
                "name": "Mat Siyah",
                "hex": "#1c1c1c",
                "image": null,
                "filterClass": "filter-none"
            }
        ],
        "description": "Tutkulu kahve severler için tasarlanmış, barista kalitesinde kahve deneyimi sunan De'Longhi La Specialista. Sensörlü Öğütme Teknolojisi, Akıllı Sıkıştırma İstasyonu ve Aktif Sıcaklık Kontrolü özellikleri ile kahve çekirdeklerinin aromalarını mükemmel şekilde açığa çıkarır."
    },
    {
        "id": 11,
        "brand": "Theragun",
        "title": "PRO G5 Akıllı Perküsif Terapi Cihazı",
        "category": "guzellik",
        "oldPrice": 22000,
        "newPrice": 18999,
        "image": "images/theragun_pro.png",
        "sizes": [
            "Siyah"
        ],
        "stock": 6,
        "colors": [
            {
                "name": "Siyah",
                "hex": "#111111",
                "image": "images/theragun_pro.png",
                "filterClass": "filter-none"
            }
        ],
        "description": "Kondisyon ve kas toparlanmasında dünya lideri Theragun PRO G5. Kişiselleştirilebilir hız ayarları, OLED ekranı ve ultra sessiz EQ150 fırçasız motoru ile profesyonel düzeyde masaj ve derin kas terapisi sunar. Mobil uygulama entegrasyonu mevcuttur."
    },
    {
        "id": 12,
        "brand": "SMEG",
        "title": "Retro Espresso Kahve Makinesi",
        "category": "kahve",
        "oldPrice": 21000,
        "newPrice": 17499,
        "image": "images/smeg_espresso.png",
        "sizes": [
            "Krem",
            "Pastel Pembe",
            "Pastel Mavi"
        ],
        "stock": 5,
        "colors": [
            {
                "name": "Krem",
                "hex": "#f2ece1",
                "image": "images/smeg_espresso.png",
                "filterClass": "filter-none"
            },
            {
                "name": "Pastel Pembe",
                "hex": "#f2d2d9",
                "image": null,
                "filterClass": "filter-none"
            },
            {
                "name": "Pastel Mavi",
                "hex": "#d1e4e6",
                "image": null,
                "filterClass": "filter-none"
            }
        ],
        "description": "50'lerin ikonik retro tarzını yansıtan şık tasarımı ve kompakt yapısıyla mutfaklara İtalyan şıklığı getiren SMEG Espresso Makinesi. 15 bar basınç sistemi, Thermoblock ısıtma sistemi ve Cappuccino sistemi ile lezzetli espresso ve süt köpüklü kahveler hazırlar."
    },
    {
        "id": 13,
        "brand": "Dyson",
        "title": "Supersonic Nural™ Saç Kurutma Makinesi",
        "category": "guzellik",
        "oldPrice": 24000,
        "newPrice": 19999,
        "image": "images/dyson_supersonic.png",
        "sizes": [
            "Vinca Blue",
            "Ceramic Patina"
        ],
        "stock": 4,
        "colors": [
            {
                "name": "Vinca Blue",
                "hex": "#1f2d3d",
                "image": "images/dyson_supersonic.png",
                "filterClass": "filter-none"
            },
            {
                "name": "Ceramic Patina",
                "hex": "#c3b091",
                "image": null,
                "filterClass": "filter-none"
            }
        ],
        "description": "Dyson'ın en akıllı saç kurutma makinesi Supersonic Nural™. Time-of-Flight mesafe sensörüyle saç ile arasındaki mesafeyi ölçerek ısıyı otomatik ayarlar ve saç derisini aşırı ısı hasarından korur. Akıllı başlık tanıma sistemiyle her başlığa özel hava akımı ve sıcaklık ayarını hatırlar."
    },
    {
        "id": 14,
        "brand": "SMEG",
        "title": "Retro 2 Dilimli Ekmek Kızartma Makinesi",
        "category": "mutfak",
        "oldPrice": 9500,
        "newPrice": 7499,
        "image": "images/smeg_toaster.png",
        "sizes": [
            "Krem",
            "Pastel Pembe",
            "Kırmızı"
        ],
        "stock": 6,
        "colors": [
            {
                "name": "Krem",
                "hex": "#f2ece1",
                "image": "images/smeg_toaster.png",
                "filterClass": "filter-none"
            },
            {
                "name": "Pastel Pembe",
                "hex": "#f2d2d9",
                "image": null,
                "filterClass": "filter-none"
            },
            {
                "name": "Kırmızı",
                "hex": "#b52b2b",
                "image": null,
                "filterClass": "filter-none"
            }
        ],
        "description": "50'lerin ikonik retro estetiğini yansıtan SMEG Ekmek Kızartma Makinesi. 6 farklı kızartma kademesi, buz çözme, yeniden ısıtma ve bagel fonksiyonları ile ekmeklerinizi dilediğiniz kıvamda kızartır. Paslanmaz çelik gövdesi ve kırıntı tepsisi ile son derece kullanışlıdır."
    },
    {
        "id": 15,
        "brand": "Roborock",
        "title": "Dyad Pro Islak Kuru Dikey Süpürge",
        "category": "temizlik",
        "oldPrice": 27000,
        "newPrice": 22999,
        "image": "images/roborock_dyad.png",
        "sizes": [
            "Standart"
        ],
        "stock": 5,
        "colors": [
            {
                "name": "Standart",
                "hex": "#222222",
                "image": "images/roborock_dyad.png",
                "filterClass": "filter-none"
            }
        ],
        "description": "Zorlu ıslak ve kuru kirleri tek geçişte temizleyen Roborock Dyad Pro dikey zemin temizleyici. DyadPower™ çoklu rulo temizleme sistemi ve kenardan kenara temizleme özelliğiyle dip köşe temizlik sunar. Akıllı kir algılama ve otomatik deterjan dağıtımı bulunur."
    },
    {
        "id": 16,
        "brand": "Breville",
        "title": "Barista Express Manuel Espresso Makinesi",
        "category": "kahve",
        "oldPrice": 42000,
        "newPrice": 34999,
        "image": "images/breville_barista.png",
        "sizes": [
            "Çelik Gri"
        ],
        "colors": [
            {
                "name": "Çelik Gri",
                "hex": "#8a9597",
                "image": "images/breville_barista.png",
                "filterClass": "filter-none"
            }
        ],
        "description": "Evde profesyonel üçüncü dalga kahve deneyimi sunan efsanevi Breville Barista Express. Dahili konik dişli değirmeni ile taze çekilmiş çekirdeklerden tam zamanında çekim yapar. Dijital sıcaklık kontrolü (PID) ve güçlü buhar çubuğu ile mükemmel espresso ve süt köpüklü kahveler sunar."
    },
    {
        "id": 17,
        "brand": "Shark",
        "title": "FlexStyle™ 5'i 1 Arada Saç Şekillendirme ve Kurutma Sistemi",
        "category": "guzellik",
        "oldPrice": 19000,
        "newPrice": 15999,
        "image": "images/dyson_airwrap.png",
        "sizes": [
            "Siyah/Gold",
            "Taş Grisi"
        ],
        "stock": 5,
        "colors": [
            {
                "name": "Siyah/Gold",
                "hex": "#d4af37",
                "image": "images/dyson_airwrap.png",
                "filterClass": "filter-none"
            },
            {
                "name": "Taş Grisi",
                "hex": "#708090",
                "image": null,
                "filterClass": "filter-none"
            }
        ],
        "description": "Tek bir bükme hareketiyle güçlü bir saç kurutma makinesinden çok yönlü bir şekillendiriciye dönüşen Shark FlexStyle. Aşırı ısı hasarı olmadan Coanda etkisiyle bukleler oluşturur, düzleştirir, hacim verir ve pürüzsüzleştirir."
    },
    {
        "id": 18,
        "brand": "FOREO",
        "title": "LUNA™ 4 Akıllı Yüz Temizleme ve Sıkılaştırıcı Masaj Cihazı",
        "category": "guzellik",
        "oldPrice": 10500,
        "newPrice": 8499,
        "image": "images/foreo_luna_1782046017874.png",
        "sizes": [
            "Şeftali (Hassas Cilt)",
            "Lavanta (Karma Cilt)"
        ],
        "stock": 6,
        "colors": [
            {
                "name": "Şeftali (Hassas Cilt)",
                "hex": "#ffccb3",
                "image": "images/foreo_luna_1782046017874.png",
                "filterClass": "filter-none"
            },
            {
                "name": "Lavanta (Karma Cilt)",
                "hex": "#e6e6fa",
                "image": null,
                "filterClass": "filter-none"
            }
        ],
        "description": "T-Sonic™ titreşimleri ve ultra hijyenik yumuşak silikon temas noktalarıyla cildinizi kirden, yağdan ve makyaj kalıntılarından %99 oranında arındıran FOREO LUNA 4. Farklı masaj modları sayesinde ince çizgi görünümünü azaltır ve cildin kan dolaşımını hızlandırır."
    },
    {
        "id": 19,
        "brand": "Braun",
        "title": "Silk-expert Pro 5 IPL Tüy Alma Cihazı",
        "category": "guzellik",
        "oldPrice": 18000,
        "newPrice": 14999,
        "image": "images/braun_silkexpert_1782046006482.png",
        "sizes": [
            "Beyaz/Gold"
        ],
        "stock": 4,
        "colors": [
            {
                "name": "Beyaz/Gold",
                "hex": "#f5f5dc",
                "image": "images/braun_silkexpert_1782046006482.png",
                "filterClass": "filter-none"
            }
        ],
        "description": "Braun'un en güvenli ve hızlı IPL epilasyon cihazı. Skin Pro 2.0 (SensoAdapt™) cilt sensörü, cilt tonunuzu saniyede 80 kez okuyarak ışık atım gücünü otomatik ayarlar. Ev konforunda sadece 4 haftada gözle görülür tüy azalması sağlar."
    },
    {
        "id": 20,
        "brand": "Dyson",
        "title": "Corrale™ Kablosuz Saç Düzleştirici",
        "category": "guzellik",
        "oldPrice": 22000,
        "newPrice": 18999,
        "image": "images/dyson_corrale_1782045996038.png",
        "sizes": [
            "Fuşya/Nikel",
            "Bakır/Nikel"
        ],
        "stock": 4,
        "colors": [
            {
                "name": "Fuşya/Nikel",
                "hex": "#de3163",
                "image": "images/dyson_corrale_1782045996038.png",
                "filterClass": "filter-none"
            },
            {
                "name": "Bakır/Nikel",
                "hex": "#b87333",
                "image": null,
                "filterClass": "filter-none"
            }
        ],
        "description": "Saç tellerini bir araya getirmek için esneyen bakır alaşımlı plakalara sahip tek düzleştirici Dyson Corrale. Kablosuz kullanım özgürlüğüyle saçlarınızı daha az ısı hasarı, daha az kırılma ve mükemmel pürüzsüzlükle şekillendirir."
    },
    {
        "id": 21,
        "brand": "L'Oreal",
        "title": "SteamPod 4.0 Buharlı Saç Şekillendirici ve Düzleştirici",
        "category": "guzellik",
        "oldPrice": 14000,
        "newPrice": 11499,
        "image": "images/loreal_steampod_1782045984075.png",
        "sizes": [
            "Beyaz"
        ],
        "colors": [
            {
                "name": "Beyaz",
                "hex": "#ffffff",
                "image": "images/loreal_steampod_1782045984075.png",
                "filterClass": "filter-none"
            }
        ],
        "description": "Kuru saçtan şekillendirmeye kadar patentli kuru buhar teknolojisiyle saçları şekillendiren profesyonel SteamPod 4.0. Saç tellerine zarar vermeden, daha hızlı ve 3 kat daha düz, pürüzsüz ve parlak sonuçlar elde etmenizi sağlar."
    },
    {
        "id": 23,
        "brand": "Roborock",
        "title": "S8 MaxV Ultra Akıllı Robot Süpürge ve Sıcak Su İstasyonu",
        "category": "temizlik",
        "oldPrice": 125000,
        "newPrice": 114999,
        "image": "images/roborock_s8maxv_1782046035907.png",
        "sizes": [
            "Siyah",
            "Beyaz"
        ],
        "stock": 3,
        "colors": [
            {
                "name": "Siyah",
                "hex": "#1c1c1c",
                "image": "images/roborock_s8maxv_1782046035907.png",
                "filterClass": "filter-none"
            },
            {
                "name": "Beyaz",
                "hex": "#ffffff",
                "image": null,
                "filterClass": "filter-none"
            }
        ],
        "description": "Roborock'un en gelişmiş amiral gemisi robot süpürgesi S8 MaxV Ultra. FlexiArm yan fırçası ve kenar paspas sistemiyle köşelerde sıfır toz bırakır. 10.000 Pa yüksek emiş gücü, sıcak suyla paspas yıkama, deterjan dağıtımı ve sesli asistan özellikleriyle eller serbest temizliği zirveye taşır."
    },
    {
        "id": 24,
        "brand": "Xiaomi",
        "title": "Robot Vacuum X20+ Akıllı Mop İstasyonlu Robot Süpürge",
        "category": "temizlik",
        "oldPrice": 29000,
        "newPrice": 25999,
        "image": "images/xiaomi_x20_1782046046022.png",
        "sizes": [
            "Beyaz"
        ],
        "colors": [
            {
                "name": "Beyaz",
                "hex": "#f8f9fa",
                "image": "images/xiaomi_x20_1782046046022.png",
                "filterClass": "filter-none"
            }
        ],
        "description": "Yüksek performansı erişilebilir kılan Xiaomi Robot Vacuum X20+. Kendini temizleyen, mopları kurutan ve toz haznesini otomatik boşaltan akıllı istasyonuyla temizlik zahmetini minimuma indirir. LDS lazer navigasyonu ve 6000 Pa emiş gücü mevcuttur."
    },
    {
        "id": 26,
        "brand": "Philips",
        "title": "AquaTrio Series 9000 3'ü 1 Arada Kablosuz Islak Kuru Süpürge",
        "category": "temizlik",
        "oldPrice": 32000,
        "newPrice": 28499,
        "image": "images/philips_aquatrio_1782046056439.png",
        "sizes": [
            "Siyah/Mavi"
        ],
        "stock": 4,
        "colors": [
            {
                "name": "Siyah/Mavi",
                "hex": "#0a3d62",
                "image": "images/philips_aquatrio_1782046056439.png",
                "filterClass": "filter-none"
            }
        ],
        "description": "Hem süpüren hem paspaslayan hem de dökülen sıvıları çeken Philips AquaTrio 9000. AquaSpin başlığı zeminleri aktif şekilde yıkar, patentli kendi kendini temizleme teknolojisi ruloları ve fırçayı her kullanımdan sonra temiz tutar."
    },
    {
        "id": 27,
        "brand": "KitchenAid",
        "title": "Artisan 1.5 L Ayarlanabilir Sıcaklıklı Su Isıtıcısı",
        "category": "mutfak",
        "oldPrice": 11500,
        "newPrice": 9999,
        "image": "images/kitchenaid_kettle_1782046065471.png",
        "sizes": [
            "İmparator Kırmızı",
            "Mat Siyah",
            "Krem"
        ],
        "stock": 5,
        "colors": [
            {
                "name": "İmparator Kırmızı",
                "hex": "#a8201a",
                "image": "images/kitchenaid_kettle_1782046065471.png",
                "filterClass": "filter-none"
            },
            {
                "name": "Mat Siyah",
                "hex": "#222222",
                "image": null,
                "filterClass": "filter-none"
            },
            {
                "name": "Krem",
                "hex": "#fdf6e2",
                "image": null,
                "filterClass": "filter-none"
            }
        ],
        "description": "Mutfağına şıklık katacak çift cidarlı gövdeye sahip KitchenAid Artisan Su Isıtıcısı. 50°C'den 100°C'ye kadar ayarlanabilir sıcaklık kontrolü sayesinde çay ve kahvelerinizi en doğru ısıda demlemenizi sağlar. Sıcaklık göstergesi aktiftir."
    },
    {
        "id": 28,
        "brand": "SMEG",
        "title": "Retro HBF02 El Blenderı Seti",
        "category": "mutfak",
        "oldPrice": 10500,
        "newPrice": 8999,
        "image": "images/smeg_blender_1782046073822.png",
        "sizes": [
            "Krem",
            "Pastel Pembe",
            "Kırmızı"
        ],
        "stock": 6,
        "colors": [
            {
                "name": "Krem",
                "hex": "#f2ece1",
                "image": "images/smeg_blender_1782046073822.png",
                "filterClass": "filter-none"
            },
            {
                "name": "Pastel Pembe",
                "hex": "#f2d2d9",
                "image": null,
                "filterClass": "filter-none"
            },
            {
                "name": "Kırmızı",
                "hex": "#b52b2b",
                "image": null,
                "filterClass": "filter-none"
            }
        ],
        "description": "50'lerin retro tarzı tasarımı ve 700W güçlü motoruyla SMEG El Blenderı Seti. Ayarlanabilir hız kontrolü ve turbo fonksiyonu ile pürüzsüz sonuçlar sunar. Doğrayıcı, çırpıcı, püre ezici ve karıştırma sürahisi aksesuarlarıyla tam settir."
    },
    {
        "id": 32,
        "brand": "Nespresso",
        "title": "Vertuo Pop Kapsüllü Kahve Makinesi",
        "category": "kahve",
        "oldPrice": 6500,
        "newPrice": 5499,
        "image": "images/nespresso_lattissima.png",
        "sizes": [
            "Hindistan Cevizi Beyazı",
            "Pasifik Mavisi",
            "Baharat Sarısı"
        ],
        "stock": 8,
        "colors": [
            {
                "name": "Hindistan Cevizi Beyazı",
                "hex": "#f5f6fa",
                "image": "images/nespresso_lattissima.png",
                "filterClass": "filter-none"
            },
            {
                "name": "Pasifik Mavisi",
                "hex": "#2f3542",
                "image": null,
                "filterClass": "filter-none"
            },
            {
                "name": "Baharat Sarısı",
                "hex": "#eccc68",
                "image": null,
                "filterClass": "filter-none"
            }
        ],
        "description": "Kompakt ve enerjik tasarımıyla Nespresso Vertuo Pop. Centrifusion™ teknolojisiyle kapsüldeki barkodu okuyarak mükemmel aromayı ve zengin kremayı hazırlar. 4 farklı fincan boyutunda kahve demleme seçeneği sunar."
    }
];
