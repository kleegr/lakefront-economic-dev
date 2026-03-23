import { PublicHeader } from '@/components/public/Header';
import { PublicFooter } from '@/components/public/Footer';
import { Preloader } from '@/components/public/Preloader';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Preloader />
      <PublicHeader />
      <main className="page-transition-active">{children}</main>
      <PublicFooter />
    </>
  );
}
