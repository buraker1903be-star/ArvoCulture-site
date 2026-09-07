"use client";

import {useEffect} from "react";

type PreviewMessage={type:"ARVO_THEME_PREVIEW";selected?:string;config?:Record<string,string|number|boolean>};

const textFields:Record<string,string>={
  announcement:"[data-arvo-field='announcement']",hero_eyebrow:"[data-arvo-field='hero_eyebrow']",hero_title:"[data-arvo-field='hero_title']",
  hero_emphasis:"[data-arvo-field='hero_emphasis']",hero_description:"[data-arvo-field='hero_description']",primary_cta_label:"[data-arvo-field='primary_cta_label']",
  secondary_cta_label:"[data-arvo-field='secondary_cta_label']",manifest_title:"[data-arvo-field='manifest_title']",manifest_description:"[data-arvo-field='manifest_description']",
  apparel_title:"[data-arvo-field='apparel_title']",apparel_description:"[data-arvo-field='apparel_description']",beauty_title:"[data-arvo-field='beauty_title']",
  beauty_description:"[data-arvo-field='beauty_description']",featured_eyebrow:"[data-arvo-field='featured_eyebrow']",featured_title:"[data-arvo-field='featured_title']",
  campaign_title:"[data-arvo-field='campaign_title']",campaign_description:"[data-arvo-field='campaign_description']",footer_tagline:"[data-arvo-field='footer_tagline']",
};

export function ThemePreviewBridge(){
  useEffect(()=>{
    document.documentElement.classList.add("arvo-preview-mode");
    const receive=(event:MessageEvent<PreviewMessage>)=>{
      if(event.data?.type!=="ARVO_THEME_PREVIEW")return;
      document.querySelectorAll<HTMLElement>("[data-arvo-section]").forEach(node=>node.classList.toggle("arvo-preview-selected",node.dataset.arvoSection===event.data.selected));
      const config=event.data.config??{};
      Object.entries(textFields).forEach(([key,selector])=>{
        const value=config[key];if(typeof value!=="string")return;
        document.querySelectorAll<HTMLElement>(selector).forEach(node=>{node.textContent=value;});
      });
      const root=document.documentElement;
      if(typeof config.primary_color==="string")root.style.setProperty("--ink",config.primary_color);
      if(typeof config.accent_color==="string")root.style.setProperty("--acid",config.accent_color);
      if(typeof config.background_color==="string")root.style.setProperty("--paper",config.background_color);
      ["manifest","worlds","featured","campaign","values"].forEach(section=>{
        const visible=config[`show_${section}`];
        document.querySelectorAll<HTMLElement>(`[data-arvo-section='${section}']`).forEach(node=>{node.style.display=visible===false?"none":"";});
      });
    };
    window.addEventListener("message",receive);
    window.parent.postMessage({type:"ARVO_THEME_READY"},"*");
    return()=>window.removeEventListener("message",receive);
  },[]);
  return null;
}
