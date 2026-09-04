import type { Locale } from "@/lib/site";

export const dict = {
  tr: {
    skip: "İçeriğe geç",
    nav: {
      brands: "Markalar",
      sustainability: "Sürdürülebilirlik",
      future: "Gelecek",
      about: "Hakkımızda",
      contact: "İletişim",
      careers: "Kariyer",
    },
    status: { live: "Yayında", development: "Geliştirmede" },
    langSwitch: "English",
    home: {
      title: "ArvoCulture Group — Araştırma, sistem ve üretim",
      description:
        "ArvoCulture Group; akademik danışmanlık, yazılım ürünleri ve perakende alanlarında marka geliştiren bir teknoloji ve hizmet grubudur.",
      heading: "Dağınık işleri yürüyen sistemlere çeviriyoruz.",
      lede: "ArvoCulture Group; akademik araştırma, kurumsal yazılım ve perakende alanlarında marka geliştirir. Üç işi de birbirine bağlayan tek şey, bir süreci baştan kurup ölçülebilir hâle getirme biçimimizdir.",
      portfolio: "Grup markaları",
      sustainPull:
        "Sürdürülebilirlik bir bölüm başlığı değil, bir maliyet kalemi.",
      sustainA:
        "Yazılım işinde çevresel etkinin büyük bölümü sunucu tarafında oluşur. Bunu azaltmanın yolu slogan değil, ölçüm: hangi bölgede çalıştığınız, ne kadar kaynak ayırdığınız ve boşta duran kapasiteyi ne yaptığınız.",
      sustainB:
        "Hedeflerimizi ve bugün nerede olduğumuzu — henüz ulaşamadığımız yerler dahil — açık biçimde yayımlıyoruz.",
      sustainCta: "Sürdürülebilirlik yaklaşımımız",
      futurePull: "Yeni işler, mevcut işlerin içinden çıkıyor.",
      futureA:
        "Grubun ürünleri birbirinden bağımsız fikirler değil. Akademik danışmanlıkta karşılaştığımız süreç sorunları ArvoLab'i, kendi operasyonumuzu yönetme ihtiyacı ArvoOS'u, mağaza altyapısı arayışı da e-ticaret yazılımını doğurdu.",
      futureB:
        "Geliştirme aşamasındaki çalışmalarımızı ve hangi problemlere baktığımızı burada paylaşıyoruz.",
      futureCta: "Geliştirdiğimiz projeler",
    },
    brands: {
      title: "Markalar",
      description:
        "ArvoCulture Group bünyesindeki markalar: Akademik Merkez, Arvo ve geliştirme aşamasındaki perakende markası.",
      lede: "Her marka kendi pazarında bağımsız çalışır. Ortak olan şey altyapı, çalışma yöntemi ve sorumluluk çerçevesidir.",
      distinction: "Onu ayıran şey",
      scope: "Kapsam",
      statusLine: "Durum",
      foundedLine: "Kuruluş",
      visit: (name: string) => `${name} web sitesi`,
    },
    about: {
      title: "Hakkımızda",
      description:
        "ArvoCulture Group; akademik danışmanlık, yazılım ürünleri ve perakende alanlarında marka geliştiren bir teknoloji ve hizmet grubudur.",
      lede: "Akademik danışmanlıkla başladık. Kendi işimizi yönetmek için kurduğumuz araçlar zamanla ayrı ürünlere dönüştü.",
      originPull: "Nereden geldik",
      originA:
        "Akademik Merkez, araştırmacıların yöntem ve analiz aşamasında yalnız kalmasından doğdu. Danışmanlık sürecini yürütürken ihtiyacımız olan takip, teklif ve dosya yönetimi araçlarını kendimiz yazdık; bu araçlar bugün ArvoOS adıyla ayrı bir ürün.",
      originB:
        "Aynı şey araştırma tarafında da oldu. Literatür, yazım ve analiz adımlarını tek yerde toplama denemesi ArvoLab'e dönüştü.",
      registryPull: "Kurumsal bilgiler",
      legalName: "Ticaret unvanı",
      addressLabel: "Adres",
      emailLabel: "E-posta",
      pending: "— (doldurulacak)",
    },
    sustainability: {
      title: "Sürdürülebilirlik",
      description:
        "ArvoCulture Group'un çevresel etki yaklaşımı, ölçüm yöntemi ve açık hedefleri.",
      lede: "Ölçmediğimiz hiçbir şey için iddia kullanmıyoruz. Bu sayfa neyi ölçtüğümüzü, hangi hedefe baktığımızı ve nerede henüz yetersiz olduğumuzu içerir.",
      methodPull: "Nasıl ölçüyoruz",
      methodA:
        "Yazılım ürünlerimizin çevresel etkisi ağırlıklı olarak sunucu tarafında oluşur. Bunu üç değişkende takip ediyoruz: çalıştığımız veri merkezi bölgesinin enerji kaynağı, ayrılan kaynak miktarı ve boşta duran kapasitenin oranı.",
      methodB:
        "Metodolojiyi ve ölçüm dönemini bu sayfada açıkça belirtiriz; doğrulanmamış hiçbir sayıyı yayımlamayız.",
      gapsPull: "Henüz yapamadıklarımız",
      gapsA:
        "Kapsam 3 emisyonlarımızı (tedarikçi ve lojistik kaynaklı) henüz hesaplamıyoruz. Perakende markasının ambalaj politikası lansmanla birlikte tanımlanacak. Bu başlıklarda ilerleme kaydettikçe sayfa güncellenir.",
    },
    future: {
      title: "Gelecek",
      description:
        "ArvoCulture Group bünyesinde geliştirme aşamasındaki ürünler ve üzerinde çalıştığımız problemler.",
      lede: "Üzerinde çalıştığımız problemler ve henüz yayına almadığımız işler.",
      pull: "Geliştirmede",
      items: [
        "Perakende markası — kimlik çalışması ve mağaza lansmanı",
        "Arvo ürün ailesinin üçüncü ürünü",
      ],
    },
    careers: {
      title: "Kariyer",
      description: "ArvoCulture Group bünyesindeki açık pozisyonlar ve başvuru.",
      lede: "Şu an yayımlanmış açık pozisyon yok. Grup markalarından birinde çalışmak istiyorsanız kendinizi kısaca anlatan bir e-posta gönderin; uygun bir rol açıldığında dönüş yaparız.",
      cta: "Başvuru gönder",
    },
    contact: {
      title: "İletişim",
      description:
        "ArvoCulture Group iletişim bilgileri ve grup markalarına erişim.",
      lede: "Hizmet talepleri için doğrudan ilgili markaya ulaşmanız daha hızlı sonuç verir. Grup düzeyindeki konular için aşağıdaki adres.",
      hqPull: "Grup merkezi",
      brandsPull: "Markalara doğrudan",
      formPull: "Mesaj bırakın",
      form: {
        name: "Adınız",
        email: "E-posta",
        message: "Mesajınız",
        submit: "Mesajı gönder",
        sending: "Gönderiliyor",
        sent: "Mesajınız iletildi. En kısa sürede dönüş yapacağız.",
        error:
          "Mesaj gönderilemedi. Doğrudan info@arvoculture.com adresine yazabilirsiniz.",
        required: "Tüm alanları doldurun.",
        consent:
          "Formu göndererek iletişim bilgilerinizin talebinizi yanıtlamak amacıyla işlenmesini kabul edersiniz.",
      },
    },
    notFound: {
      heading: "Bu sayfa yok.",
      body: "Adres değişmiş ya da bağlantı hatalı olabilir. Markalar sayfasından aradığınıza ulaşabilirsiniz.",
      cta: "Markalara git",
    },
    footer: {
      brands: "Markalar",
      corporate: "Kurumsal",
      legal: "Yasal",
      contact: "İletişim",
      kvkk: "KVKK Aydınlatma Metni",
      privacy: "Gizlilik ve Çerez Politikası",
      rights: "Tüm hakları saklıdır.",
      disclaimer:
        "ArvoCulture Group bir yatırım, danışmanlık veya aracılık kuruluşu değildir. Grup şirketlerinin hizmetleri kendi web sitelerinde tanımlanan kapsam ve koşullarla sunulur.",
    },
  },

  en: {
    skip: "Skip to content",
    nav: {
      brands: "Brands",
      sustainability: "Sustainability",
      future: "Future",
      about: "About",
      contact: "Contact",
      careers: "Careers",
    },
    status: { live: "Live", development: "In development" },
    langSwitch: "Türkçe",
    home: {
      title: "ArvoCulture Group — Research, systems and production",
      description:
        "ArvoCulture Group builds brands in academic consulting, software products and retail.",
      heading: "We turn scattered work into systems that run.",
      lede: "ArvoCulture Group builds brands in academic research, enterprise software and retail. What connects all three is how we rebuild a process from the ground up and make it measurable.",
      portfolio: "Group brands",
      sustainPull: "Sustainability is a cost line, not a section heading.",
      sustainA:
        "In software, most environmental impact sits on the server side. Reducing it takes measurement rather than slogans: which region you run in, how much capacity you reserve, and what you do with the capacity sitting idle.",
      sustainB:
        "We publish our targets and where we stand today, including the places we have not reached yet.",
      sustainCta: "How we approach sustainability",
      futurePull: "New work comes out of existing work.",
      futureA:
        "The group's products are not unrelated ideas. Process problems we hit in academic consulting produced ArvoLab; the need to run our own operation produced ArvoOS; the search for storefront infrastructure produced the e-commerce software.",
      futureB:
        "We share what is in development and which problems we are looking at.",
      futureCta: "What we are building",
    },
    brands: {
      title: "Brands",
      description:
        "The brands within ArvoCulture Group: Akademik Merkez, Arvo, and a retail brand in development.",
      lede: "Each brand operates independently in its own market. What they share is infrastructure, working method and a common standard of responsibility.",
      distinction: "What sets it apart",
      scope: "Scope",
      statusLine: "Status",
      foundedLine: "Founded",
      visit: (name: string) => `Visit ${name}`,
    },
    about: {
      title: "About",
      description:
        "ArvoCulture Group builds brands in academic consulting, software products and retail.",
      lede: "We started in academic consulting. The tools we built to run our own work eventually became products of their own.",
      originPull: "Where we came from",
      originA:
        "Akademik Merkez grew out of how alone researchers are left at the methodology and analysis stage. While running that consulting work we wrote our own tracking, quoting and file management tools; those tools are now a separate product called ArvoOS.",
      originB:
        "The same happened on the research side. An attempt to bring literature, writing and analysis into one place became ArvoLab.",
      registryPull: "Company details",
      legalName: "Registered name",
      addressLabel: "Address",
      emailLabel: "Email",
      pending: "— (to be completed)",
    },
    sustainability: {
      title: "Sustainability",
      description:
        "ArvoCulture Group's approach to environmental impact, how we measure it, and our open targets.",
      lede: "We make no claim about anything we do not measure. This page covers what we measure, what we are aiming at, and where we still fall short.",
      methodPull: "How we measure",
      methodA:
        "The environmental impact of our software sits mostly on the server side. We track it across three variables: the energy source of the data centre region we run in, the amount of capacity we reserve, and the share of that capacity sitting idle.",
      methodB:
        "We state the methodology and the measurement period on this page. We publish no figure that has not been verified.",
      gapsPull: "What we cannot do yet",
      gapsA:
        "We do not yet calculate our Scope 3 emissions from suppliers and logistics. The retail brand's packaging policy will be defined at launch. This page is updated as we make progress on both.",
    },
    future: {
      title: "Future",
      description:
        "Products in development within ArvoCulture Group and the problems we are working on.",
      lede: "The problems we are working on and the work we have not released yet.",
      pull: "In development",
      items: [
        "Retail brand — identity work and store launch",
        "A third product in the Arvo family",
      ],
    },
    careers: {
      title: "Careers",
      description: "Open roles at ArvoCulture Group and how to apply.",
      lede: "There are no published openings right now. If you would like to work at one of the group's brands, send a short email about yourself and we will get back to you when a suitable role opens.",
      cta: "Send an application",
    },
    contact: {
      title: "Contact",
      description: "ArvoCulture Group contact details and links to group brands.",
      lede: "For service enquiries, contacting the relevant brand directly is faster. Use the address below for group-level matters.",
      hqPull: "Group office",
      brandsPull: "Brands directly",
      formPull: "Leave a message",
      form: {
        name: "Your name",
        email: "Email",
        message: "Your message",
        submit: "Send message",
        sending: "Sending",
        sent: "Your message has been sent. We will get back to you shortly.",
        error:
          "The message could not be sent. You can write to info@arvoculture.com directly.",
        required: "Please fill in every field.",
        consent:
          "By sending this form you agree to your contact details being processed in order to respond to your enquiry.",
      },
    },
    notFound: {
      heading: "This page does not exist.",
      body: "The address may have changed or the link may be wrong. You can find what you are looking for on the brands page.",
      cta: "Go to brands",
    },
    footer: {
      brands: "Brands",
      corporate: "Corporate",
      legal: "Legal",
      contact: "Contact",
      kvkk: "KVKK Disclosure (Turkish)",
      privacy: "Privacy and Cookie Policy (Turkish)",
      rights: "All rights reserved.",
      disclaimer:
        "ArvoCulture Group is not an investment, advisory or brokerage firm. The services of group companies are provided under the scope and terms set out on their own websites.",
    },
  },
} as const;

export function t(locale: Locale) {
  return dict[locale];
}
