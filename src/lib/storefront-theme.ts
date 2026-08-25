import "server-only";

export type StorefrontTheme={
  announcement:string;hero_eyebrow:string;hero_title:string;hero_emphasis:string;hero_description:string;
  primary_cta_label:string;primary_cta_href:string;secondary_cta_label:string;secondary_cta_href:string;
  featured_eyebrow:string;featured_title:string;campaign_title:string;campaign_description:string;
  primary_color:string;accent_color:string;background_color:string;typography:string;hero_style:string;
  logo_url?:string;favicon_url?:string;store_name?:string;
};

export const defaultTheme:StorefrontTheme={
  announcement:"2.000 TL üzeri ücretsiz kargo • İlk alışverişe ARVO10",
  hero_eyebrow:"ARVOCULTURE · APPAREL & BEAUTY",hero_title:"Seçtiğin şey,",hero_emphasis:"senin hikâyen.",
  hero_description:"Tarzını, bakımını ve gündelik ritüellerini tek bir kültürde buluşturan özgün seçkiler.",
  primary_cta_label:"Giyimi keşfet",primary_cta_href:"/koleksiyon/giyim",secondary_cta_label:"Bakımı keşfet",secondary_cta_href:"/koleksiyon/bakim",
  featured_eyebrow:"ÖNE ÇIKANLAR",featured_title:"Şimdi keşfet.",campaign_title:"İlk seçimine özel.",campaign_description:"İlk siparişinde ARVO10 koduyla %10 indirim.",
  primary_color:"#111210",accent_color:"#D9FF43",background_color:"#F5F2EC",typography:"editorial",hero_style:"editorial-orbs",store_name:"ArvoCulture"
};

const validColor=(value:unknown,fallback:string)=>typeof value==="string"&&/^#[0-9A-Fa-f]{6}$/.test(value)?value:fallback;
const validPath=(value:unknown,fallback:string)=>typeof value==="string"&&value.startsWith("/")?value.slice(0,240):fallback;
const clean=(value:unknown,fallback:string,max=360)=>typeof value==="string"&&value.trim()?value.trim().slice(0,max):fallback;

export async function getStorefrontTheme():Promise<StorefrontTheme>{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const organizationId=process.env.ARVO_ORGANIZATION_ID;
  if(!url||!key||!organizationId)return defaultTheme;
  try{
    const endpoint=new URL("/rest/v1/arc_store_themes",url);
    endpoint.searchParams.set("organization_id",`eq.${organizationId}`);
    endpoint.searchParams.set("mode","eq.published");
    endpoint.searchParams.set("select","config");
    endpoint.searchParams.set("limit","1");
    const response=await fetch(endpoint,{headers:{apikey:key,Authorization:`Bearer ${key}`},next:{revalidate:60,tags:["storefront-theme"]}});
    if(!response.ok)return defaultTheme;
    const rows=await response.json() as Array<{config?:Record<string,unknown>}>;
    const c=rows[0]?.config??{};
    return {
      ...defaultTheme,
      announcement:clean(c.announcement,defaultTheme.announcement,180),hero_eyebrow:clean(c.hero_eyebrow,defaultTheme.hero_eyebrow,100),
      hero_title:clean(c.hero_title,defaultTheme.hero_title,100),hero_emphasis:clean(c.hero_emphasis,defaultTheme.hero_emphasis,100),
      hero_description:clean(c.hero_description,defaultTheme.hero_description),primary_cta_label:clean(c.primary_cta_label,defaultTheme.primary_cta_label,60),
      primary_cta_href:validPath(c.primary_cta_href,defaultTheme.primary_cta_href),secondary_cta_label:clean(c.secondary_cta_label,defaultTheme.secondary_cta_label,60),
      secondary_cta_href:validPath(c.secondary_cta_href,defaultTheme.secondary_cta_href),featured_eyebrow:clean(c.featured_eyebrow,defaultTheme.featured_eyebrow,80),
      featured_title:clean(c.featured_title,defaultTheme.featured_title,100),campaign_title:clean(c.campaign_title,defaultTheme.campaign_title,100),
      campaign_description:clean(c.campaign_description,defaultTheme.campaign_description,240),primary_color:validColor(c.primary_color,defaultTheme.primary_color),
      accent_color:validColor(c.accent_color,defaultTheme.accent_color),background_color:validColor(c.background_color,defaultTheme.background_color),
      typography:["editorial","modern","minimal"].includes(String(c.typography))?String(c.typography):defaultTheme.typography,
      hero_style:["editorial-orbs","split","minimal"].includes(String(c.hero_style))?String(c.hero_style):defaultTheme.hero_style,
      logo_url:typeof c.logo_url==="string"?c.logo_url:undefined,favicon_url:typeof c.favicon_url==="string"?c.favicon_url:undefined,
      store_name:clean(c.store_name,defaultTheme.store_name??"ArvoCulture",160)
    };
  }catch{return defaultTheme;}
}
