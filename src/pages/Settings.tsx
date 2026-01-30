import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { useNotificationStore } from '../store/useNotificationStore';
import { 
  Building2, 
  Globe, 
  FileText, 
  Database, 
  Bell, 
  ShieldCheck,
  Save,
  Lock,
  Download,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('Business Profile');
  const [isWipeDialogOpen, setIsWipeDialogOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const { settings, fetchSettings, updateSettings } = useStore();
  const { addNotification } = useNotificationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdateSetting = async (key: string, value: string) => {
    setSaveStatus('saving');
    try {
      await updateSettings(key, value);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      addNotification({ message: 'Failed to update setting', type: 'error' });
    }
  };

  const toggleSetting = (key: string) => {
    const currentValue = settings[key] === 'true';
    handleUpdateSetting(key, (!currentValue).toString());
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for Base64 storage
        addNotification({ message: 'Logo must be less than 1MB', type: 'error' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdateSetting('companyLogo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWipeDatabase = async () => {
    try {
      if (window.api?.resetDatabase) {
        await window.api.resetDatabase();
        addNotification({ message: 'Database wiped successfully', type: 'success' });
      } else {
        addNotification({ message: 'Database reset is only available in the desktop app', type: 'warning' });
      }
    } catch (error) {
      addNotification({ message: 'Failed to wipe database', type: 'error' });
    }
  };

  const handleExportDatabase = async () => {
    try {
      if (window.api?.exportDatabase) {
        const success = await window.api.exportDatabase();
        if (success) {
          addNotification({ message: 'Database exported successfully', type: 'success' });
        }
      } else {
        addNotification({ message: 'Export is only available in the desktop app', type: 'warning' });
      }
    } catch (error) {
      addNotification({ message: 'Failed to export database', type: 'error' });
    }
  };

  const tabs = [
    { id: 'Business Profile', icon: Building2, label: 'Business Profile' },
    { id: 'Currency & Tax', icon: Globe, label: 'Currency & Tax' },
    { id: 'Invoice Settings', icon: FileText, label: 'Invoice Settings' },
    { id: 'Backup & Restore', icon: Database, label: 'Backup & Restore' },
    { id: 'Notifications', icon: Bell, label: 'Notifications' },
    { id: 'Security', icon: ShieldCheck, label: 'Security' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Business Profile':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 border-b border-neutral-100 pb-2">Business Profile</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="companyName" className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Company Name</label>
                    <input 
                      id="companyName"
                      type="text" 
                      placeholder="e.g. Acme Corp"
                      value={settings.companyName || ''}
                      onChange={(e) => handleUpdateSetting('companyName', e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="taxId" className="text-xs font-bold text-neutral-500 uppercase tracking-wider">VAT / Tax ID</label>
                    <input 
                      id="taxId"
                      type="text" 
                      placeholder="e.g. VAT123456"
                      value={settings.taxId || ''}
                      onChange={(e) => handleUpdateSetting('taxId', e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Email Address</label>
                    <input 
                      id="email"
                      type="email" 
                      placeholder="billing@example.com"
                      value={settings.email || ''}
                      onChange={(e) => handleUpdateSetting('email', e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Phone Number</label>
                    <input 
                      id="phone"
                      type="text" 
                      placeholder="+1 234 567 890"
                      value={settings.phone || ''}
                      onChange={(e) => handleUpdateSetting('phone', e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" 
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="address" className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Business Address</label>
                  <textarea 
                    id="address"
                    rows={3}
                    placeholder="Enter your business address"
                    value={settings.address || ''}
                    onChange={(e) => handleUpdateSetting('address', e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => addNotification({ message: 'Profile settings saved automatically', type: 'success' })}
                    className="flex items-center gap-2 px-4 py-2 bg-[#218091] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#1a6573] transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Profile
                  </button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 border-b border-neutral-100 pb-2">Logo & Branding</h3>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-neutral-100 rounded-lg flex items-center justify-center border-2 border-dashed border-neutral-300 overflow-hidden">
                  {settings.companyLogo ? (
                    <img src={settings.companyLogo} alt="Company Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-8 h-8 text-neutral-400" />
                  )}
                </div>
                <div className="space-y-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleLogoUpload} 
                    className="hidden" 
                    accept="image/*" 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 text-sm font-medium bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors"
                  >
                    Upload New Logo
                  </button>
                  <p className="text-xs text-neutral-500">Recommended size: 512x512px. PNG or SVG.</p>
                </div>
              </div>
            </Card>
          </div>
        );
      case 'Currency & Tax':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 border-b border-neutral-100 pb-2">Regional Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Default Currency</label>
                  <select 
                    value={settings.currency || 'USD'}
                    onChange={(e) => handleUpdateSetting('currency', e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Currency Position</label>
                  <select 
                    value={settings.currencyPosition || 'before'}
                    onChange={(e) => handleUpdateSetting('currencyPosition', e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  >
                    <option value="before">Before Amount (£100)</option>
                    <option value="after">After Amount (100£)</option>
                  </select>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 border-b border-neutral-100 pb-2">Tax Configuration</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Tax Name (e.g., VAT, GST)</label>
                    <input 
                      type="text" 
                      placeholder="VAT"
                      value={settings.taxName || 'VAT'}
                      onChange={(e) => handleUpdateSetting('taxName', e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Default Tax Rate (%)</label>
                    <input 
                      type="number" 
                      placeholder="20"
                      value={settings.taxRate || '20'}
                      onChange={(e) => handleUpdateSetting('taxRate', e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" 
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="compound-tax" className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                  <label htmlFor="compound-tax" className="text-sm text-neutral-700">Apply tax on top of other charges (Compound Tax)</label>
                </div>
              </div>
            </Card>
          </div>
        );
      case 'Invoice Settings':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 border-b border-neutral-100 pb-2">Invoice Numbering</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Prefix</label>
                  <input 
                    type="text" 
                    placeholder="INV-"
                    value={settings.invoicePrefix || 'INV-'}
                    onChange={(e) => handleUpdateSetting('invoicePrefix', e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Next Number</label>
                  <input 
                    type="number" 
                    placeholder="1001"
                    value={settings.invoiceNextNumber || '1001'}
                    onChange={(e) => handleUpdateSetting('invoiceNextNumber', e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" 
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 border-b border-neutral-100 pb-2">Payment Terms & Notes</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Default Payment Terms (Days)</label>
                  <input 
                    type="number" 
                    placeholder="30"
                    value={settings.paymentTerms || '30'}
                    onChange={(e) => handleUpdateSetting('paymentTerms', e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Default Footer Notes</label>
                  <textarea 
                    rows={3}
                    placeholder="Thank you for your business!"
                    value={settings.footerNotes || 'Thank you for your business!'}
                    onChange={(e) => handleUpdateSetting('footerNotes', e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>
            </Card>
          </div>
        );
      case 'Backup & Restore':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 border-b border-neutral-100 pb-2">Database Management</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-neutral-400" />
                    <div>
                      <div className="text-sm font-medium text-neutral-900">Local SQLite Database</div>
                      <div className="text-xs text-neutral-500">Current size: 2.4 MB</div>
                    </div>
                  </div>
                  <button 
                    onClick={handleExportDatabase}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export DB
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handleExportDatabase}
                    className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Create Manual Backup
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors">
                    <Database className="w-4 h-4" />
                    Restore from File
                  </button>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-red-100 bg-red-50/30">
              <h3 className="text-lg font-semibold mb-4 text-red-900 border-b border-red-100 pb-2">Danger Zone</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Reset All Data</div>
                    <div className="text-xs text-neutral-500">This will permanently delete all clients, projects, and invoices.</div>
                  </div>
                  <button 
                    onClick={() => setIsWipeDialogOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Wipe Database
                  </button>
                </div>
              </div>
            </Card>
          </div>
        );
      case 'Notifications':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 border-b border-neutral-100 pb-2">Email Notifications</h3>
              <div className="space-y-4">
                {[
                  { key: 'notify_overdue', label: 'Invoice Overdue Alerts', desc: 'Receive an email when an invoice becomes overdue' },
                  { key: 'notify_summary', label: 'Weekly Business Summary', desc: 'Get a summary of your financial performance every Monday' },
                  { key: 'notify_quotes', label: 'New Quote Request', desc: 'Notification when a client accepts a quote online' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-neutral-900">{item.label}</div>
                      <div className="text-xs text-neutral-500">{item.desc}</div>
                    </div>
                    <div 
                      onClick={() => toggleSetting(item.key)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors ${
                        settings[item.key] === 'true' ? 'bg-primary-600' : 'bg-neutral-200'
                      }`}
                    >
                      <div className={`h-4 w-4 rounded-full bg-white transition-transform ${
                        settings[item.key] === 'true' ? 'translate-x-4.5' : 'translate-x-0.5'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 border-b border-neutral-100 pb-2">System Alerts</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Desktop Notifications</div>
                    <div className="text-xs text-neutral-500">Show native system alerts for important events</div>
                  </div>
                  <div 
                    onClick={() => toggleSetting('notify_desktop')}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors ${
                      settings.notify_desktop === 'true' ? 'bg-primary-600' : 'bg-neutral-200'
                    }`}
                  >
                    <div className={`h-4 w-4 rounded-full bg-white transition-transform ${
                      settings.notify_desktop === 'true' ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`} />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );
      case 'Security':
        const isPasscodeEnabled = settings.passcode_enabled === 'true';
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 border-b border-neutral-100 pb-2">Authentication</h3>
              <div className="space-y-4">
                <div className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                  isPasscodeEnabled ? 'bg-blue-50 border-blue-100' : 'bg-neutral-50 border-neutral-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className={`w-5 h-5 ${isPasscodeEnabled ? 'text-blue-600' : 'text-neutral-400'}`} />
                    <div>
                      <div className="text-sm font-medium text-neutral-900">App Passcode</div>
                      <div className="text-xs text-neutral-500">Protect your financial data with a startup PIN</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleSetting('passcode_enabled')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      isPasscodeEnabled 
                        ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
                        : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    {isPasscodeEnabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Change Password</label>
                  <div className="grid grid-cols-1 gap-3">
                    <input 
                      type="password" 
                      placeholder="Current Password"
                      className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" 
                    />
                    <input 
                      type="password" 
                      placeholder="New Password"
                      className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" 
                    />
                  </div>
                  <button className="mt-2 flex items-center gap-2 px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors">
                    <Lock className="w-4 h-4" />
                    Update Password
                  </button>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-amber-100 bg-amber-50/30">
              <h3 className="text-lg font-semibold mb-4 text-amber-900 border-b border-amber-100 pb-2">Session Management</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <div>
                    <div className="text-sm font-medium text-amber-900">Auto-lock App</div>
                    <div className="text-xs text-amber-700">Lock the application after 15 minutes of inactivity</div>
                  </div>
                </div>
                <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-amber-200 cursor-pointer">
                  <div className="h-4 w-4 translate-x-0.5 rounded-full bg-white transition-transform" />
                </div>
              </div>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-neutral-900">Settings</h2>
          {saveStatus !== 'idle' && (
            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-neutral-50 border border-neutral-100 transition-all">
              {saveStatus === 'saving' ? (
                <>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Saving...</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Saved</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <nav className="space-y-1">
            {tabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === item.id 
                    ? 'bg-white text-primary-600 shadow-sm border border-neutral-200' 
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-primary-600' : 'text-neutral-400'}`} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="md:col-span-2">
          {renderContent()}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isWipeDialogOpen}
        onClose={() => setIsWipeDialogOpen(false)}
        onConfirm={handleWipeDatabase}
        title="Wipe Database"
        description="Are you sure you want to delete all data? This action is permanent and cannot be undone."
        confirmText="Wipe Everything"
        cancelText="Keep Data"
        intent="danger"
        impact="Deletes all Clients, Projects, Quotes, and Invoices."
      />
    </div>
  );
};
