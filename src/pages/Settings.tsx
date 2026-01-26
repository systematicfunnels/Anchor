import { Card } from '../components/ui/Card';
import { 
  Building2, 
  Globe, 
  FileText, 
  Database, 
  Bell, 
  ShieldCheck,
  Save
} from 'lucide-react';

export const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">Settings</h2>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <nav className="space-y-1">
            {[
              { icon: Building2, label: 'Business Profile', active: true },
              { icon: Globe, label: 'Currency & Tax', active: false },
              { icon: FileText, label: 'Invoice Settings', active: false },
              { icon: Database, label: 'Backup & Restore', active: false },
              { icon: Bell, label: 'Notifications', active: false },
              { icon: ShieldCheck, label: 'Security', active: false },
            ].map((item) => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  item.active 
                    ? 'bg-white text-primary-600 shadow-sm border border-neutral-200' 
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 border-b border-neutral-100 pb-2">Business Profile</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Company Name</label>
                  <input 
                    type="text" 
                    defaultValue="ServiceOps Solutions"
                    className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">VAT / Tax ID</label>
                  <input 
                    type="text" 
                    defaultValue="GB123456789"
                    className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Business Address</label>
                <textarea 
                  rows={3}
                  defaultValue="123 Innovation Way\nTech City, TC 12345\nUnited Kingdom"
                  className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 border-b border-neutral-100 pb-2">Regional Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Default Currency</label>
                <select className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                  <option>USD ($)</option>
                  <option selected>GBP (£)</option>
                  <option>EUR (€)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Default Tax Rate (%)</label>
                <input 
                  type="number" 
                  defaultValue="20"
                  className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" 
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-red-100 bg-red-50/30">
            <h3 className="text-lg font-semibold mb-4 text-red-900 border-b border-red-100 pb-2">System & Safety</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-neutral-900">Offline Database</div>
                  <div className="text-xs text-neutral-500">Last backup: 2 hours ago</div>
                </div>
                <button className="text-primary-600 text-sm font-medium hover:underline">Manual Backup</button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-red-600">Danger Zone</div>
                  <div className="text-xs text-neutral-500">Permanently delete all data</div>
                </div>
                <button className="text-red-600 text-sm font-medium hover:underline">Reset System</button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
