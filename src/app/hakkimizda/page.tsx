import { InfoPage, InfoSection } from "@/components/info-page";
export default function About() {
  return (
    <InfoPage
      eyebrow="ARVOCULTURE DÜNYASI"
      title="Seçtiğin şey sensin."
      intro="ArvoCulture; giyim, kişisel bakım ve koku dünyasını tek bir çağdaş yaşam kültüründe buluşturur."
    >
      <InfoSection title="Biz kimiz?">
        <p>
          Tarzın yalnızca giydiklerinden, bakımın yalnızca kullandığın
          ürünlerden ibaret olmadığına inanıyoruz. Her seçim kendini ifade etme
          biçimidir. Bu nedenle seçkimizi tasarım, nitelik ve kullanım
          deneyimini birlikte değerlendirerek oluşturuyoruz.
        </p>
      </InfoSection>
      <InfoSection title="Seçim yaklaşımımız">
        <p>
          Zamansız giyim parçalarını, günlük bakım ritüellerini ve karakter
          sahibi kokuları anlaşılır bir deneyimle sunuyoruz. Amacımız daha
          fazlasını değil, size gerçekten eşlik edecek doğru ürünü bulmanızı
          sağlamaktır.
        </p>
      </InfoSection>
      <InfoSection title="ArvoCulture sözü">
        <p>
          Özgün seçki, şeffaf ürün bilgisi, güvenli ödeme ve özenli paketleme.
          Siparişin ilk keşiften teslimata kadar aynı dikkatle ele alınır.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
