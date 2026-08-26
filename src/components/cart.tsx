"use client";
import {createContext,useCallback,useContext,useState,useSyncExternalStore} from "react";
import Link from "next/link";
type CartValue={count:number;add:()=>void};
const CartContext=createContext<CartValue>({count:0,add:()=>{}});
const CART_KEY="arvo-cart";
const listeners=new Set<()=>void>();
const getSnapshot=()=>Number(localStorage.getItem(CART_KEY)||0);
const getServerSnapshot=()=>0;
const subscribe=(callback:()=>void)=>{listeners.add(callback);return()=>listeners.delete(callback)};
const setCartCount=(value:number)=>{localStorage.setItem(CART_KEY,String(value));listeners.forEach(listener=>listener())};
export function CartProvider({children}:{children:React.ReactNode}){const count=useSyncExternalStore(subscribe,getSnapshot,getServerSnapshot);const add=useCallback(()=>setCartCount(count+1),[count]);return <CartContext.Provider value={{count,add}}>{children}</CartContext.Provider>}
export function CartLink(){const {count}=useContext(CartContext);return <Link className="cart-link" href="/sepet" aria-label={`Sepet, ${count} ürün`}>Sepet <span>{count}</span></Link>}
export function AddButton(){const {add}=useContext(CartContext);const [done,setDone]=useState(false);return <button className="button button-dark full" onClick={()=>{add();setDone(true);setTimeout(()=>setDone(false),1500)}}>{done?"Sepete eklendi ✓":"Sepete ekle"}</button>}
