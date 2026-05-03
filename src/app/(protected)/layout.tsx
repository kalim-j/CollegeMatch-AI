import ProtectedLayout from "@/components/ProtectedLayout";

export default function ProtectedRootLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
