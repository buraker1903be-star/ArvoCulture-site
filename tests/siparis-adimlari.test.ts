import assert from "node:assert/strict";
import { test } from "node:test";
import { siparisAdimlari, type Order } from "@/lib/order-types";

const temel: Order = {
  order_number: "AC261017-F93525",
  status: "processing",
  payment_status: "paid",
  subtotal: 47090,
  discount: 0,
  shipping: 12000,
  total: 57677,
  currency: "TRY",
  coupon_code: null,
  address: null,
  billing_address: null,
  note: null,
  created_at: "2026-10-17T10:00:00Z",
  items: [],
};

const adlar = (o: Order) =>
  (siparisAdimlari(o) ?? []).map((a) => `${a.ad}:${a.durum}`);

test("ödenmiş ve hazırlanan sipariş ikinci adımda", () => {
  assert.deepEqual(adlar(temel), [
    "Siparişiniz alındı:gecti",
    "Hazırlanıyor:simdi",
    "Kargoda:bekliyor",
    "Teslim edildi:bekliyor",
  ]);
});

test("ödeme bekleyen havale siparişi ilk adımda kalıyor", () => {
  /* Çubuğu ilerletmek, olmayan bir ilerlemeyi müjdelemek olurdu. */
  const adimlar =
    siparisAdimlari({ ...temel, status: "pending", payment_status: "pending" }) ?? [];
  assert.equal(adimlar[0].durum, "simdi");
  assert.equal(adimlar[1].durum, "bekliyor");
});

test("çizelge ödeme notu taşımıyor", () => {
  /*
    "Hazırlanıyor" adımının altında "Ödemeniz bekleniyor"
    yazıyordu ve canlıda çelişkili okunuyordu: sipariş hem
    hazırlanıyor hem ödeme bekliyor görünüyordu. Ödemenin kendi
    kutusu var.
  */
  const adimlar =
    siparisAdimlari({ ...temel, status: "processing", payment_status: "pending" }) ?? [];
  assert.ok(adimlar.every((adim) => adim.not === undefined));
});

test("paketlerin hepsi teslim edilince son adım", () => {
  const o = {
    ...temel,
    status: "fulfilled",
    shipments: [{ sequence: 1, status: "delivered", carrier: null }],
  } as Order;
  const adimlar = siparisAdimlari(o) ?? [];
  assert.equal(adimlar[3].durum, "simdi");
});

test("bir paket yoldayken teslim adımı beklemede", () => {
  const o = {
    ...temel,
    status: "fulfilled",
    shipments: [
      { sequence: 1, status: "delivered", carrier: null },
      { sequence: 2, status: "in_transit", carrier: null },
    ],
  } as Order;
  const adimlar = siparisAdimlari(o) ?? [];
  assert.equal(adimlar[2].durum, "simdi");
  assert.equal(adimlar[3].durum, "bekliyor");
});

test("iptal ve iade çizelgeye girmiyor", () => {
  /* Dört adımlık çubuğun içine "iptal edildi" koymak, iptal
     edilmiş siparişi yoldaymış gibi gösterirdi. */
  assert.equal(siparisAdimlari({ ...temel, status: "cancelled" }), null);
  assert.equal(siparisAdimlari({ ...temel, status: "refunded" }), null);
});
