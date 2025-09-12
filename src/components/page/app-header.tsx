import { Map, Folder } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const DynamicAuthButton = dynamic(() => import('./auth-button'), {
  ssr: false,
});


const AppHeader = () => {
  return (
    <header className="text-white p-8 rounded-xl mb-8 text-center animate-fade-in shadow-lg bg-gradient-to-r from-primary to-secondary relative">
      <div className="absolute top-4 right-4 flex items-center gap-4">
        <Button asChild variant="secondary" className="hover:bg-primary hover:-translate-y-0.5">
          <Link href="/files" className="flex items-center gap-2">
            <Folder className="glowing-icon"/>
            File Manager
          </Link>
        </Button>
        <DynamicAuthButton />
      </div>
      <h1 className="text-4xl font-bold font-headline flex items-center justify-center gap-3">
        <Map className="w-10 h-10 glowing-icon" />
        GIS KPI Issue Tracker
      </h1>
      <p className="mt-2 text-lg opacity-90">
        Track and manage issues related to GIS Team KPI activities
      </p>
    </header>
  );
};

export default AppHeader;
