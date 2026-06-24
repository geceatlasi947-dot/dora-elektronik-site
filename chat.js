/**
 * Doruk - Interactive Client-Side Virtual Assistant
 * Dora Elektronik Web Application
 */

(function () {
    // Wait for DOM to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDorukChat);
    } else {
        initDorukChat();
    }

    function initDorukChat() {
        // Prevent duplicate initializations
        if (document.getElementById('doruk-chat-trigger')) return;

        // 1. Inject HTML Elements
        injectChatHTML();

        // 2. DOM References
        const trigger = document.getElementById('doruk-chat-trigger');
        const panel = document.getElementById('doruk-chat-panel');
        const closeBtn = document.getElementById('doruk-close-btn');
        const sendBtn = document.getElementById('doruk-chat-send');
        const inputField = document.getElementById('doruk-chat-input');
        const messagesContainer = document.getElementById('doruk-chat-messages');

        // 3. Event Listeners
        trigger.addEventListener('click', () => {
            panel.classList.toggle('active');
            const arrow = trigger.querySelector('.doruk-widget-arrow i');
            if (panel.classList.contains('active')) {
                inputField.focus();
                scrollToBottom();
                if (arrow) { arrow.style.transform = 'rotate(180deg)'; arrow.style.color = 'var(--primary)'; }
            } else {
                if (arrow) { arrow.style.transform = 'rotate(0deg)'; arrow.style.color = ''; }
            }
        });

        closeBtn.addEventListener('click', () => {
            panel.classList.remove('active');
            const arrow = trigger.querySelector('.doruk-widget-arrow i');
            if (arrow) { arrow.style.transform = 'rotate(0deg)'; arrow.style.color = ''; }
        });

        sendBtn.addEventListener('click', handleUserMessage);
        
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleUserMessage();
            }
        });

        // Quick replies clicks delegation
        document.addEventListener('click', (e) => {
            if (e.target && e.target.classList.contains('doruk-quick-chip')) {
                const text = e.target.dataset.msg || e.target.innerText;
                addUserMessage(text);
                showTypingAndReply(text);
            }
        });

        // Add initial bot greeting
        addBotGreeting();

        // --- Helper Functions ---

        function injectChatHTML() {
            // Corner customer service widget wrapper
            const widgetWrapper = document.createElement('div');
            widgetWrapper.id = 'doruk-widget-wrapper';
            widgetWrapper.innerHTML = `
                <div id="doruk-chat-trigger" title="Canlı Destek - Doruk">
                    <div class="doruk-widget-inner">
                        <div class="doruk-widget-icon-wrap">
                            <i class="fa-solid fa-headset"></i>
                            <span class="doruk-online-dot"></span>
                        </div>
                        <div class="doruk-widget-texts">
                            <span class="doruk-widget-title">Müşteri Hizmetleri</span>
                            <span class="doruk-widget-sub">Çevrimiçi — Şimdi Yanıtlıyoruz</span>
                        </div>
                        <div class="doruk-widget-arrow"><i class="fa-solid fa-chevron-up"></i></div>
                    </div>
                </div>
            `;
            document.body.appendChild(widgetWrapper);

            // Chat Panel Container
            const chatPanel = document.createElement('div');
            chatPanel.id = 'doruk-chat-panel';
            chatPanel.innerHTML = `
                <div class="doruk-chat-header">
                    <div class="doruk-chat-header-info">
                        <div class="doruk-avatar">D</div>
                        <div class="doruk-name-container">
                            <h4>Doruk <em>Asistan</em></h4>
                            <div class="doruk-status">Çevrimiçi</div>
                        </div>
                    </div>
                    <button id="doruk-close-btn" class="doruk-close-btn" title="Kapat"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div id="doruk-chat-messages" class="doruk-chat-messages"></div>
                <div class="doruk-quick-replies-container">
                    <div class="doruk-quick-replies-title">Hızlı Seçenekler:</div>
                    <div class="doruk-quick-replies">
                        <button class="doruk-quick-chip" data-msg="Sipariş Sorgula">📦 Sipariş Sorgula</button>
                        <button class="doruk-quick-chip" data-msg="Ürün Ara">🔍 Ürün Ara</button>
                        <button class="doruk-quick-chip">Orijinallik Garantisi</button>
                        <button class="doruk-quick-chip">Kargo ve Teslimat</button>
                        <button class="doruk-quick-chip">İade ve Değişim</button>
                        <button class="doruk-quick-chip">Ödeme Güvenliği</button>
                    </div>
                </div>
                <div class="doruk-chat-input-area">
                    <input type="text" id="doruk-chat-input" class="doruk-chat-input" placeholder="Mesajınızı buraya yazın..." autocomplete="off">
                    <button id="doruk-chat-send" class="doruk-chat-send" title="Gönder"><i class="fa-solid fa-paper-plane"></i></button>
                </div>
            `;
            document.body.appendChild(chatPanel);
        }

        function addBotGreeting() {
            const greeting = `
                <p>Merhaba! Ben Dora Elektronik premium dijital asistanı <strong>Doruk</strong>. Size yardımcı olmaktan memnuniyet duyarım.</p>
                <p>Siparişlerinizi sorgulamak, kataloğumuzda ürün aramak veya aklınıza takılan soruları yanıtlamak için buradayım.</p>
                <p>Nasıl yardımcı olabilirim?</p>
            `;
            appendMessage(greeting, 'bot');
        }

        function scrollToBottom() {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function appendMessage(htmlContent, sender) {
            const row = document.createElement('div');
            row.className = `doruk-msg-row ${sender}`;
            
            const bubble = document.createElement('div');
            bubble.className = 'doruk-msg-bubble';
            bubble.innerHTML = htmlContent;
            
            row.appendChild(bubble);
            messagesContainer.appendChild(row);
            scrollToBottom();
        }

        function addUserMessage(text) {
            // Escape html simple
            const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            appendMessage(escaped, 'user');
        }

        function handleUserMessage() {
            const text = inputField.value.trim();
            if (!text) return;

            addUserMessage(text);
            inputField.value = '';

            showTypingAndReply(text);
        }

        function showTypingAndReply(userText) {
            // Add typing indicator
            const typingRow = document.createElement('div');
            typingRow.className = 'doruk-msg-row bot';
            typingRow.id = 'doruk-typing';
            
            const bubble = document.createElement('div');
            bubble.className = 'doruk-msg-bubble';
            bubble.innerHTML = `
                <div class="doruk-typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `;
            typingRow.appendChild(bubble);
            messagesContainer.appendChild(typingRow);
            scrollToBottom();

            // Simulate assistant processing delay
            setTimeout(() => {
                const typingIndicator = document.getElementById('doruk-typing');
                if (typingIndicator) {
                    typingIndicator.remove();
                }

                const responseHtml = getBotResponse(userText);
                appendMessage(responseHtml, 'bot');
            }, 800);
        }

        // --- Core Intelligence & Live DB Mapping ---

        function getBotResponse(text) {
            const cleanText = text.toLowerCase().trim();

            // 1. Direct Prompts for Order or Product Search
            if (cleanText === 'sipariş sorgula') {
                return `Siparişinizin anlık durumunu sorgulamak için lütfen sipariş numaranızı yazın.<br><br><em>Örnek: <code>#DORA-123456</code> veya sadece <code>123456</code> yazabilirsiniz.</em>`;
            }

            if (cleanText === 'ürün ara') {
                return `Koleksiyonumuzda ürün veya marka aramak için kelimenizi yazın.<br><br><em>Örnek: <code>Dyson</code>, <code>Roborock</code>, <code>kahve makinesi</code> veya <code>süpürge</code> yazabilirsiniz.</em>`;
            }

            // 2. Order Tracking Matching (Live LocalStorage DB Integration)
            const hasDigits = /\d+/.test(cleanText);
            const isOrderCodeFormat = /dora/i.test(cleanText) || cleanText.startsWith('#');
            const hasOrderKeywords = /sipariş|kargo|takip|nerede|sorgu/i.test(cleanText);

            if (hasDigits && (isOrderCodeFormat || hasOrderKeywords || cleanText.length >= 5)) {
                const numMatch = cleanText.match(/\d+/);
                if (numMatch) {
                    const numericPart = numMatch[0];
                    if (window.db && typeof window.db.getOrders === 'function') {
                        const orders = window.db.getOrders() || [];
                        const order = orders.find(o => o.order_code.includes(numericPart));

                        if (order) {
                            const dateStr = new Date(order.created_at).toLocaleDateString('tr-TR');
                            const itemsList = order.items.map(item => `• ${item.brand} ${item.title} (${item.size}) x ${item.quantity}`).join('<br>');
                            
                            let explanation = "";
                            if (order.status === 'Hazırlanıyor') {
                                explanation = "Siparişiniz onaylanmış olup şu anda özenle paketlenme aşamasındadır. En kısa sürede kargoya teslim edilerek tarafınıza sms/mail gönderilecektir.";
                            } else if (order.status === 'Kargoda') {
                                explanation = "Siparişiniz kargoya verilmiştir ve dağıtım sürecindedir.";
                            } else if (order.status === 'Teslim Edildi') {
                                explanation = "Siparişiniz belirtilen adrese teslim edilmiştir. Ürünlerinizi keyifli günlerde kullanmanızı dileriz.";
                            } else if (order.status === 'İptal Edildi') {
                                explanation = "Siparişiniz iptal edilmiştir. İade işlemleriniz ve detaylı bilgi için müşteri hizmetlerimizle iletişime geçebilirsiniz.";
                            }

                            return `🔍 <strong>Sipariş Kaydınız Bulundu</strong><br><br>` +
                                   `📦 <strong>Sipariş Kodu:</strong> <code>${order.order_code}</code><br>` +
                                   `📅 <strong>Sipariş Tarihi:</strong> ${dateStr}<br>` +
                                   `💰 <strong>Toplam Tutar:</strong> ${order.total.toLocaleString('tr-TR')} TL<br>` +
                                   `📍 <strong>Teslimat Adresi:</strong> ${order.address}<br>` +
                                   `🏷️ <strong>Durum:</strong> <strong style="color:var(--primary);">${order.status}</strong><br><br>` +
                                   `💬 <strong>Açıklama:</strong> ${explanation}<br><br>` +
                                   `🛒 <strong>Sipariş İçeriği:</strong><br>${itemsList}`;
                        }
                    }
                    return `Girdiğiniz <strong>"${numericPart}"</strong> numarasını içeren bir sipariş kaydı bulamadım. Lütfen sipariş numaranızı kontrol edip tekrar deneyiniz.`;
                }
            }

            // 3. Product Live Search Integration
            const productKeywords = /ürün|ara|fiyat|stok|bul|katalog/i.test(cleanText) || 
                                    /dyson|roborock|kitchenaid|nespresso|philips|airwrap|süpürge|kahve|mutfak|güzellik/i.test(cleanText);

            if (productKeywords) {
                // Strip structural keywords to find search term
                let query = cleanText.replace(/ürün|ara|fiyatı|fiyatları|fiyat|stok|stokta|varmı|var mı|bul|sorgula/gi, "").trim();
                
                // If it is just brand names, let that be the query
                if (query.length < 2) {
                    const brands = ['dyson', 'roborock', 'kitchenaid', 'nespresso', 'philips'];
                    const foundBrand = brands.find(b => cleanText.includes(b));
                    if (foundBrand) {
                        query = foundBrand;
                    }
                }

                if (query.length >= 2 && window.db && typeof window.db.getProducts === 'function') {
                    const products = window.db.getProducts() || [];
                    const matches = products.filter(p => 
                        p.title.toLowerCase().includes(query) ||
                        p.brand.toLowerCase().includes(query) ||
                        p.category.toLowerCase().includes(query)
                    ).slice(0, 3);

                    if (matches.length > 0) {
                        const listHtml = matches.map(p => {
                            const discount = Math.round(((p.oldPrice - p.newPrice) / p.oldPrice) * 100);
                            const stockStatus = p.stock > 0 
                                ? `<span style="color:#2ed573; font-weight:600;">Stokta Var (${p.stock} Adet)</span>` 
                                : `<span style="color:#ff4757; font-weight:600;">Tükendi</span>`;
                            
                            return `🛍️ <strong>${p.brand} ${p.title}</strong><br>` +
                                   `💰 <strong>Fiyat:</strong> ${p.newPrice.toLocaleString('tr-TR')} TL <del style="color:var(--gray); font-size:0.75rem;">${p.oldPrice.toLocaleString('tr-TR')} TL</del> (%${discount} İndirim)<br>` +
                                   `📦 <strong>Durum:</strong> ${stockStatus}<br>` +
                                   `🔗 <a href="product.html?id=${p.id}" target="_blank">Detayları Gör & Satın Al</a>`;
                        }).join('<br><br>');

                        return `🔍 <strong>Arama Sonuçları</strong><br>` +
                               `Aramanızla eşleşen en özel premium ürünlerimizi listeledim:<br><br>${listHtml}`;
                    }
                }
            }

            // 4. Professional FAQ Matching (Turkish Language)
            if (cleanText.includes("orijinal") || cleanText.includes("sahte") || cleanText.includes("orjinal") || cleanText.includes("replika") || cleanText.includes("garanti")) {
                return `✨ <strong>Orijinallik Garantisi</strong><br><br>` +
                       `Dora Elektronik bünyesinde satışa sunulan tüm ürünler (Dyson, Roborock, KitchenAid, Nespresso, Philips vb.) <strong>%100 orijinaldir</strong>.<br><br>` +
                       `Ürünlerimiz yetkili distribütörlerden faturalı olarak tedarik edilmekte olup, adınıza faturalandırılmış şekilde <strong>2 yıl resmi üretici veya ithalatçı garantisiyle</strong> gönderilir. Kutularda seri numaraları yer alır, ilgili markanın kendi sitesinde kaydettirebilirsiniz.`;
            }

            if (cleanText.includes("kargo") || cleanText.includes("teslimat") || cleanText.includes("ücret") || cleanText.includes("gönderim") || cleanText.includes("kaç gün") || cleanText.includes("ne zaman")) {
                return `📦 <strong>Kargo ve Teslimat Süreci</strong><br><br>` +
                       `• <strong>1500 TL ve üzeri</strong> alışverişlerinizde kargo <strong>tamamen ücretsizdir</strong>.<br>` +
                       `• 1500 TL altındaki siparişlerinizde ise kargo ücreti standart 75 TL'dir.<br>` +
                       `• Siparişleriniz en geç 24 saat içinde kargoya teslim edilir. Teslimat süresi bulunduğunuz il/ilçeye göre <strong>1 ila 3 iş günü</strong> sürmektedir.`;
            }

            if (cleanText.includes("iade") || cleanText.includes("değişim") || cleanText.includes("geri gönder") || cleanText.includes("koşul") || cleanText.includes("iade et")) {
                return `🔄 <strong>İade ve Değişim Koşulları</strong><br><br>` +
                       `Teslim aldığınız günden itibaren <strong>14 gün içerisinde</strong> yasal cayma hakkınızı kullanarak iade yapabilirsiniz.<br><br>` +
                       `• Ürünlerin kullanılmamış, orijinal kutusunda, koruyucu bandı sökülmemiş ve aksesuarlarının eksiksiz olması şarttır.<br>` +
                       `• <strong>Dikkat:</strong> Kişisel bakım ve saç şekillendirme ürünlerinde (örneğin Dyson Airwrap, saç düzleştirici vb.) hijyen standartları gereği açılmış kutuların iadesi kabul edilememektedir.`;
            }

            if (cleanText.includes("ödeme") || cleanText.includes("kart") || cleanText.includes("taksit") || cleanText.includes("güvenlik") || cleanText.includes("güvenli mi")) {
                return `💳 <strong>Ödeme Yöntemleri ve Güvenlik</strong><br><br>` +
                       `Web sitemizden yapacağınız ödemelerde kredi kartı ve banka kartı kullanılabilir.<br><br>` +
                       `• Tüm ödeme altyapımız <strong>256-bit SSL şifreleme</strong> ve banka onaylı <strong>3D Secure doğrulama sistemi</strong> ile korunmaktadır.<br>` +
                       `• Kart bilgileriniz kesinlikle bizim tarafımızdan kaydedilmemekte ve AES-GCM şifreleme katmanı ile doğrudan bankaya iletilmektedir.`;
            }

            if (cleanText.includes("kupon") || cleanText.includes("indirim") || cleanText.includes("kod") || cleanText.includes("kampanya") || cleanText.includes("dora20")) {
                return `🏷️ <strong>İndirim Kuponu Fırsatı</strong><br><br>` +
                       `Sitemize yeni üye olan değerli müşterilerimize özel ilk alışverişlerinde geçerli <strong>%20 indirim</strong> sağlayan kuponumuz mevcuttur.<br><br>` +
                       `• Kupon Kodu: <strong>DORA20</strong><br>` +
                       `• Sepetinizde kupon alanına girip uygulayarak anında indirimden yararlanabilirsiniz.`;
            }

            if (cleanText.includes("iletisim") || cleanText.includes("iletişim") || cleanText.includes("adres") || cleanText.includes("telefon") || cleanText.includes("destek") || cleanText.includes("e-posta") || cleanText.includes("mail")) {
                return `📞 <strong>Müşteri Hizmetleri & İletişim</strong><br><br>` +
                       `Bize dilediğiniz an e-posta adresimiz üzerinden ulaşabilir ya da web sitemizdeki iletişim formunu doldurabilirsiniz.<br><br>` +
                       `• 📧 E-posta: <strong>destek@doraelektronik.com</strong><br>` +
                       `• 🕰️ Çalışma Saatlerimiz: Hafta içi 09:00 - 18:00<br>` +
                       `Sorularınız genellikle aynı iş günü içinde cevaplandırılır.`;
            }

            // General greeting check
            if (cleanText.includes("merhaba") || cleanText.includes("selam") || cleanText.includes("hey") || cleanText.includes("günaydın") || cleanText.includes("iyi günler")) {
                return `Merhaba! Dora Elektronik premium asistanı Doruk olarak buradayım. Size bugün nasıl yardımcı olabilirim?`;
            }

            // 5. Default Professional Fallback
            return `Anlayamadım. Ben Dora Elektronik premium dijital asistanıyım. Siparişinizin durumunu öğrenmek için sipariş numarasını (Örn: #DORA-123456) yazabilir, ürün veya marka ismi yazarak kataloğumuzda arama yapabilir ya da orijinallik garantisi, kargo, iade ve ödeme gibi merak ettiğiniz kurumsal konuları sorabilirsiniz.`;
        }
    }
})();
