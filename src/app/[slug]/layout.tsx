import { TenantGate } from '@/components/layout/TenantGate';

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { slug } = await params;
  return <TenantGate slug={decodeURIComponent(slug)}>{children}</TenantGate>;
}
