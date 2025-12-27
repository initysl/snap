import Profile from '@/components/dashboard/Profile';
import Promptbar from '@/components/dashboard/Promptbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex flex-col items-center justify-center'>
      <div>
        <Profile />
      </div>
      <main className='max-w-5xl'>{children}</main>
      <div>
        <Promptbar />
      </div>
    </div>
  );
}
