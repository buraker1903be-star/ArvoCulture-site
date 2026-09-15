/* X (Twitter) aynı ürün kartını kullanıyor. `revalidate` yeniden dışa
   aktarılamıyor (Next ayarı dosyada okuyor), bu yüzden burada yazılı. */
export { default, alt, size, contentType } from "./opengraph-image";
export const revalidate = 3600;
