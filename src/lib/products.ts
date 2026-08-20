export type Product = { slug:string; name:string; category:string; price:number; oldPrice?:number; eyebrow:string; tone:string; description:string; tags:string[] };

export const products: Product[] = [
 {slug:"basic-regular-fit-mint",name:"Basic Regular Fit Mint Tişört",category:"Giyim",price:599.9,eyebrow:"ARVOCULTURE APPAREL",tone:"mint",description:"Dengeli kesimi ve yumuşak dokusuyla günlük stilin zamansız parçası.",tags:["Regular Fit","Pamuk","Unisex"]},
 {slug:"basic-regular-fit-fume",name:"Basic Regular Fit Füme Tişört",category:"Giyim",price:599.9,eyebrow:"ARVOCULTURE APPAREL",tone:"graphite",description:"Sade çizgiyi güçlü bir duruşla buluşturan temel parça.",tags:["Regular Fit","Pamuk","Unisex"]},
 {slug:"society-vancouver",name:"The Society Vancouver Oversize Tişört",category:"Giyim",price:1000,eyebrow:"THE SOCIETY COLLECTION",tone:"ivory",description:"Şehir kültüründen ilham alan rahat ve modern silüet.",tags:["Oversize","Unisex","Koleksiyon"]},
 {slug:"l-recapin-set",name:"L-Recapin Şampuan + Tonik İkilisi",category:"Bakım",price:3423.63,oldPrice:4027.8,eyebrow:"BEAUTY & CARE",tone:"sage",description:"Saç ve saç derisi için iki aşamalı tamamlayıcı bakım rutini.",tags:["Saç Bakımı","Set","Çok Satan"]},
 {slug:"aloe-via-spf50",name:"Aloe Via Güneş Koruyucu SPF 50",category:"Bakım",price:1699.9,eyebrow:"BEAUTY & CARE",tone:"sun",description:"Günlük güneş bakımını konforlu kullanımla tamamlar.",tags:["SPF 50","Güneş Bakımı","Aloe Vera"]},
 {slug:"iconic-elixirs",name:"Iconic Elixirs Eau de Parfum",category:"Parfüm",price:1899.9,eyebrow:"SIGNATURE SCENTS",tone:"rose",description:"Günün ritmine eşlik eden karakterli ve kalıcı bir imza.",tags:["Parfüm","Unisex","Yeni"]}
];
export const formatPrice=(n:number)=>new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY"}).format(n);
