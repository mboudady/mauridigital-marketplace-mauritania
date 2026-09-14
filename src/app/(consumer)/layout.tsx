import { BottomNav } from "@/components/BottomNav";

export default function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
