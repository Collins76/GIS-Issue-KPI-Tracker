import { Map } from 'lucide-react';

const AppHeader = () => {
  return (
    <header className="text-white p-8 rounded-xl mb-8 text-center animate-fade-in shadow-lg bg-gradient-to-r from-primary to-secondary">
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
