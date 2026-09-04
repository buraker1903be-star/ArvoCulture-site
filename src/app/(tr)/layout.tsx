import type { Metadata } from "next";
import { Shell } from "@/components/shell";
import { rootMetadata } from "@/lib/metadata";

export const metadata: Metadata = rootMetadata("tr");

export default function TrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Shell locale="tr">{children}</Shell>;
}
