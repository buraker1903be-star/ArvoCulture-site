import type { Metadata } from "next";
import { Shell } from "@/components/shell";
import { rootMetadata } from "@/lib/metadata";

export const metadata: Metadata = rootMetadata("en");

export default function EnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Shell locale="en">{children}</Shell>;
}
