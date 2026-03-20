import { PublicHeader } from '@/components/public/Header';
import { PublicFooter } from '@/components/public/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main className="pt-20">{children}</main>
      <PublicFooter />
    </>
  );
}
