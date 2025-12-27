import Promptbar from '@/components/dashboard/Promptbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-linear-to-br from-slate-50 to-blue-50'>
      <Promptbar />
      <main className='max-w-7xl mx-auto px-6 py-8'>{children}</main>
    </div>
  );
}
