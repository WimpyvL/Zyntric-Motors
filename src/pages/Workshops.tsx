import { MapPin, Star, Wrench, ShieldCheck, ChevronRight } from 'lucide-react';

const mockInstallers = [
  { id: 1, name: 'AutoPro Motors', rating: 4.8, distance: '2.5 km', specialty: 'General, Brakes, Suspension', certified: true },
  { id: 2, name: 'Precision Fit Fitment Centre', rating: 4.9, distance: '5.1 km', specialty: 'Service Kits, Filters, Oil', certified: true },
  { id: 3, name: 'Ranger & Hilux Specialists', rating: 4.7, distance: '8.0 km', specialty: 'Bakkies, 4x4, Heavy Duty', certified: false },
  { id: 4, name: 'QuickFix Auto', rating: 4.5, distance: '12 km', specialty: 'General Services', certified: true },
];

export default function Workshops() {
  return (
    <div className="bg-slate-100 min-h-screen pb-24">
      <div className="bg-slate-900 py-12 px-4 md:px-8 xl:px-12 border-b-4 border-amber-400">
        <div className="w-full">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">Installer Network</h1>
          <p className="text-slate-400 text-sm font-bold mt-2 uppercase tracking-widest">Find a certified mechanic & workshop portal</p>
        </div>
      </div>

      <div className="w-full px-4 md:px-8 xl:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-slate-200">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" /> Approved Installers Near You
              </h2>
            </div>

            <div className="space-y-4">
              {mockInstallers.map((installer) => (
                <div key={installer.id} className="bg-white border-2 border-slate-200 hover:border-slate-900 transition-colors p-6 rounded-sm shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center group">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{installer.name}</h3>
                      {installer.certified && (
                        <span className="bg-amber-100 text-amber-800 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Certified
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-3">{installer.specialty}</p>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                      <span className="flex items-center gap-1 text-amber-500"><Star className="w-4 h-4 fill-amber-500" /> {installer.rating}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {installer.distance}</span>
                    </div>
                  </div>
                  <button className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-sm transition-colors whitespace-nowrap group-hover:bg-amber-400">
                    Book Fitment
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 border-t-4 lg:border-t-0 lg:border-l-4 border-slate-200 pt-8 lg:pt-0 lg:pl-8">
            <div className="bg-slate-900 text-white rounded-sm p-8 shadow-xl relative overflow-hidden">
               <Wrench className="w-32 h-32 text-slate-800 absolute -bottom-6 -right-6 opacity-50" />
               <div className="relative z-10">
                 <h2 className="text-xl font-black uppercase tracking-tight mb-4">Workshop Portal</h2>
                 <p className="text-slate-400 text-sm font-medium mb-8">
                   Are you a mechanic or fitment centre? Join our network to receive direct parts orders and booking requests from customers.
                 </p>
                 <button className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs uppercase tracking-widest px-6 py-4 rounded-sm transition-colors shadow-sm flex items-center justify-center gap-2">
                   Apply to Join Network <ChevronRight className="w-4 h-4" />
                 </button>
                 <button className="w-full mt-3 bg-transparent border-2 border-slate-700 hover:border-slate-500 text-white font-black text-xs uppercase tracking-widest px-6 py-4 rounded-sm transition-colors">
                   Workshop Login
                 </button>
               </div>
            </div>
            
            <div className="mt-8 bg-white border-2 border-slate-200 p-6 rounded-sm shadow-sm">
              <h3 className="font-black text-slate-900 uppercase tracking-tight mb-2">How it works</h3>
              <ul className="text-sm font-medium text-slate-600 space-y-3 list-disc pl-4">
                <li>Customers buy parts on Autoconomy</li>
                <li>They select you as the installer at checkout</li>
                <li>We ship the parts directly to your workshop</li>
                <li>You charge the customer your standard labor rate</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
