import { test } from "node:test";
import assert from "node:assert/strict";
import { storeSchema, websiteSchema, storeId, websiteId, type MagazaKimligi } from "@/lib/seo";

/*
  Yapısal verideki kimlik, önceden lib/seller.ts sabitinden
  geliyordu: ikinci bir kiracının her sayfası arama motoruna "bu
  işletme ArvoCulture'dır" diyordu — unvan, vergi numarası, adres,
  telefon ve holding bağı dahil. Hukuki sayfalar bir şirketi,
  yapısal veri başka bir şirketi gösterirdi.

  Buradaki testler iki şeyi sabitliyor: kimlik parametreden geliyor
  ve EKSİK ALAN HİÇ BASILMIYOR.
*/

const BOS: MagazaKimligi = {
  brand: "",
  legalName: "",
  email: "",
  phoneLink: "",
  phone: "",
  taxNumber: "",
  addressLine: "",
  addressDistrict: "",
  addressCity: "",
  addressCountry: "",
  website: "",
  parentOrganizationName: "",
  parentOrganizationUrl: "",
};

const dolu = (ekler: Partial<MagazaKimligi> = {}): MagazaKimligi => ({
  ...BOS,
  brand: "Örnek Mağaza",
  legalName: "ÖRNEK TİCARET LİMİTED ŞİRKETİ",
  email: "destek@ornek.test",
  phone: "+90 500 000 00 00",
  taxNumber: "1234567890",
  addressLine: "Örnek Mah. 1. Sokak No:2",
  addressDistrict: "Beşiktaş",
  addressCity: "İstanbul",
  ...ekler,
});

const ADRES = "https://ornek-magaza.test";

test("kimlik parametreden geliyor, koddan değil", () => {
  const sema = storeSchema({ kimlik: dolu(), siteUrl: ADRES }) as never as Record<string, unknown>;
  assert.equal(sema.name, "Örnek Mağaza");
  assert.equal(sema.legalName, "ÖRNEK TİCARET LİMİTED ŞİRKETİ");
  assert.equal(sema.taxID, "1234567890");
  assert.equal(sema.url, ADRES);
  assert.equal(sema["@id"], `${ADRES}/#store`);
});

test("eksik alan şemaya hiç girmiyor", () => {
  /* Yanlış ya da uydurma bir değer basmak, eksik bırakmaktan kötü:
     geri alınması zor bir varlık bağı kurar. */
  const sema = storeSchema({ kimlik: BOS, siteUrl: ADRES }) as never as Record<string, unknown>;
  for (const alan of ["legalName", "email", "telephone", "taxID", "vatID", "address", "contactPoint", "logo", "image", "parentOrganization"]) {
    assert.equal(alan in sema, false, `${alan} basılmamalıydı`);
  }
  /* Kimlik yoksa da şema geçerli kalmalı: tür, adres ve para birimi. */
  assert.equal(sema["@type"], "OnlineStore");
  assert.equal(sema.currenciesAccepted, "TRY");
});

test("posta kodu ve sabit ilçe artık basılmıyor", () => {
  /* Önceden "34524", "Beylikdüzü" ve "İstanbul" koda yazılıydı. */
  const sema = storeSchema({ kimlik: dolu(), siteUrl: ADRES }) as never as {
    address: Record<string, unknown>;
  };
  assert.equal("postalCode" in sema.address, false);
  assert.equal(sema.address.addressLocality, "Beşiktaş");
  assert.equal(sema.address.addressRegion, "İstanbul");
});

test("üst kuruluş bağı yalnızca ikisi birlikte varsa basılıyor", () => {
  const eksik = storeSchema({
    kimlik: dolu({ parentOrganizationName: "Örnek Grup" }),
    siteUrl: ADRES,
  }) as never as Record<string, unknown>;
  assert.equal("parentOrganization" in eksik, false);

  const tam = storeSchema({
    kimlik: dolu({
      parentOrganizationName: "Örnek Grup",
      parentOrganizationUrl: "https://ornek-grup.test",
    }),
    siteUrl: ADRES,
  }) as never as { parentOrganization: { name: string; url: string } };
  assert.equal(tam.parentOrganization.name, "Örnek Grup");
  assert.equal(tam.parentOrganization.url, "https://ornek-grup.test");
});

test("site şeması mağazanın kendi adresine bağlanıyor", () => {
  const sema = websiteSchema({ brand: "Örnek Mağaza", siteUrl: ADRES }) as never as {
    "@id": string;
    publisher: { "@id": string };
    potentialAction: { target: { urlTemplate: string } };
  };
  assert.equal(sema["@id"], websiteId(ADRES));
  assert.equal(sema.publisher["@id"], storeId(ADRES));
  assert.match(sema.potentialAction.target.urlTemplate, /^https:\/\/ornek-magaza\.test\/arama/);
});

test("sameAs mağazanın kendi adresini tekrarlamıyor", () => {
  /* sameAs başka platformlardaki profiller için; kendi adresi
     zaten `url` alanında. Canlıda storefront_url siteUrl'e eşitti
     ve şema "ben benim" diyen bir atıf basıyordu. */
  const kendisi = storeSchema({
    kimlik: dolu({ website: `${ADRES}/` }),
    siteUrl: ADRES,
  }) as never as Record<string, unknown>;
  assert.equal("sameAs" in kendisi, false);

  const baska = storeSchema({
    kimlik: dolu({ website: "https://baska-platform.test/magaza" }),
    siteUrl: ADRES,
    instagramUrl: "https://instagram.com/ornek",
  }) as never as { sameAs: string[] };
  assert.deepEqual(baska.sameAs, [
    "https://baska-platform.test/magaza",
    "https://instagram.com/ornek",
  ]);
});
