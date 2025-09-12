import { Map } from 'lucide-react';
import dynamic from 'next/dynamic';

const DynamicAuthButton = dynamic(() => import('./auth-button'), {
  ssr: false,
});


const AppHeader = () => {
  return (
    <header className="text-white p-8 rounded-xl mb-8 text-center animate-fade-in shadow-lg bg-gradient-to-r from-primary to-secondary relative">
      <div className="absolute top-4 right-4">
        <DynamicAuthButton />
      </div>
      <h1 className="text-4xl font-bold font-headline flex items-center justify-center gap-3">
        <Map className="w-10 h-10" />
        GIS KPI Issue Tracker
      </h1>
      <p className="mt-2 text-lg opacity-90">
        Track and manage issues related to GIS Team KPI activities
      </p>
    </header>
  );
};

export default AppHeader;
