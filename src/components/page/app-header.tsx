import { Map } from 'lucide-react';

const AppHeader = () => {
  return (
    <header className="bg-gradient-to-r from-primary to-blue-500 text-white p-8 rounded-lg mb-8 shadow-lg text-center animate-fade-in">
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
