import assert from "node:assert/strict";
import test from "node:test";
import { IADE_GUNU, iadeAcikMi } from "@/lib/iade-penceresi";

/*
  Vitrin düğmesi ArvoARC'ın kuralını aynalıyor: 14 günden eski
  siparişte form hiç açılmamalı. Önce hiç bakmıyordu; müşteri formu
  doldurup gönderdikten sonra "İade süresi dolmuş." duvarına
  tosluyordu (16.10.2026).
*/
const AN = Date.parse("2026-10-16T12:00:00+03:00");
const gunOnce = (gun: number) => new Date(AN - gun * 86_400_000).toISOString();

test("süre içindeki siparişte iade açık", () => {
  assert.equal(iadeAcikMi(gunOnce(0), AN), true);
  assert.equal(iadeAcikMi(gunOnce(13), AN), true);
});

test("SINIR: on dördüncü gün hâlâ açık, on beşinci kapalı", () => {
  /* ArvoARC `v_days > 14` diyor: on dördüncü gün içeride. */
  assert.equal(iadeAcikMi(gunOnce(14), AN), true);
  assert.equal(iadeAcikMi(gunOnce(15), AN), false);
});

test("saat farkı aşağı yuvarlanıyor (müşteri lehine)", () => {
  /* 14 gün 23 saat geçmiş sipariş hâlâ on dördüncü gün sayılıyor. */
  const neredeyse15 = new Date(AN - 14 * 86_400_000 - 23 * 3_600_000).toISOString();
  assert.equal(iadeAcikMi(neredeyse15, AN), true);
});

test("okunamayan tarihte düğme gösteriliyor, kararı sunucu verir", () => {
  assert.equal(iadeAcikMi("bozuk-tarih", AN), true);
});

test("gün sayısı tek yerde", () => {
  assert.equal(IADE_GUNU, 14);
});
