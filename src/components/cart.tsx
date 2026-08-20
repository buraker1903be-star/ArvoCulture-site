"use client";
import {createContext,useContext,useEffect,useState} from "react";
import Link from "next/link";
type CartValue={count:number;add:()=>void};
const CartContext=createContext<CartValue>({count:0,add:()=>{}});
export function CartProvider({children}:{children:React.ReactNode}){const [count,setCount]=useState(0);useEffect(()=>{setCount(Number(localStorage.getItem("arvo-cart")||0))},[]);const add=()=>setCount(c=>{localStorage.setItem("arvo-cart",String(c+1));return c+1});return <CartContext.Provider value={{count,add}}>{children}</CartContext.Provider>}
export function CartLink(){const {count}=useContext(CartContext);return <Link className="cart-link" href="/sepet" aria-label={`Sepet, ${count} ürün`}>Sepet <span>{count}</span></Link>}
export function AddButton(){const {add}=useContext(CartContext);const [done,setDone]=useState(false);return <button className="button button-dark full" onClick={()=>{add();setDone(true);setTimeout(()=>setDone(false),1500)}}>{done?"Sepete eklendi ✓":"Sepete ekle"}</button>}
