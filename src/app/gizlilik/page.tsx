import { InfoPage, InfoSection } from "@/components/info-page";
export default function Privacy() {
  return (
    <InfoPage
      eyebrow="YASAL"
      title="Gizlilik ve çerez politikası."
      intro="ArvoCulture mağazasındaki gizlilik uygulamalarımızı, kullandığımız çerez türlerini ve tercihlerinizi açık biçimde açıklıyoruz."
    >
      <InfoSection title="Politikanın kapsamı">
        <p>
          Bu politika arvoculture.com ziyaretleri, üyelik, sipariş, ödeme,
          teslimat ve müşteri hizmetleri süreçlerinde uygulanan gizlilik
          esaslarını kapsar. Kişisel verilerin işlenmesine ilişkin ayrıntılı
          bilgi için <a href="/kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</a>ni
          inceleyebilirsiniz.
        </p>
      </InfoSection>
      <InfoSection title="Çerez türleri">
        <ul>
          <li><b>Zorunlu çerezler:</b> Oturum, güvenlik, sepet ve temel mağaza işlevlerini sağlar.</li>
          <li><b>İşlevsel çerezler:</b> Dil ve görünüm gibi tercihlerin hatırlanmasına yardımcı olur.</li>
          <li><b>Analitik çerezler:</b> Açık rıza verilmesi hâlinde mağaza performansını ölçer.</li>
          <li><b>Pazarlama çerezleri:</b> Açık rıza verilmesi hâlinde ilgiye uygun iletişim ve reklam ölçümü için kullanılır.</li>
        </ul>
      </InfoSection>
      <InfoSection title="Sepet ve cihaz depolaması">
        <p>
          Sepet içeriği, alışverişe daha sonra devam edebilmeniz için tarayıcınızın
          yerel depolama alanında tutulabilir. Bu alanda kart numarası veya hassas
          ödeme bilgisi saklanmaz. Kart verileri ArvoCulture tarafından açık
          biçimde kaydedilmez; ödeme, seçilen yetkili ödeme kuruluşu üzerinden yürütülür.
        </p>
      </InfoSection>
      <InfoSection title="Tercihleriniz">
        <p>
          Zorunlu olmayan çerezleri kabul etmeyebilir veya daha sonra geri
          çekebilirsiniz. Tarayıcı ayarları üzerinden çerezleri silebilirsiniz;
          zorunlu çerezlerin engellenmesi sepet ve oturum gibi işlevleri etkileyebilir.
        </p>
      </InfoSection>
      <InfoSection title="İletişim"><p>Gizlilik talepleriniz için <a href="mailto:info@arvoculture.com">info@arvoculture.com</a> adresine yazabilirsiniz. Son güncelleme: 30 Ağustos 2026.</p></InfoSection>
    </InfoPage>
  );
}
