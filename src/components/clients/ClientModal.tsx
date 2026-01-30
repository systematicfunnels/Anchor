import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/Button';
import { useStore } from '../../store/useStore';
import { useCurrency } from '../../hooks/useCurrency';
import { X } from 'lucide-react';
import { Client, Currency } from '../../types';

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address').or(z.literal('')),
  phone: z.string().max(20, 'Phone number is too long').optional().or(z.literal('')),
  billingAddress: z.string().max(500, 'Address is too long').optional().or(z.literal('')),
  currency: z.enum(['USD', 'EUR', 'GBP', 'INR'] as const),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  isDuplicate?: boolean;
}

export const ClientModal = ({ isOpen, onClose, client, isDuplicate = false }: ClientModalProps) => {
  const { addClient, updateClient } = useStore();
  const { globalCurrency } = useCurrency();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      billingAddress: '',
      currency: globalCurrency,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (client) {
        reset({
          name: isDuplicate ? `${client.name} (Copy)` : client.name,
          email: client.email || '',
          phone: client.phone || '',
          billingAddress: client.billingAddress || '',
          currency: (client.currency as Currency) || globalCurrency,
        });
      } else {
        reset({
          name: '',
          email: '',
          phone: '',
          billingAddress: '',
          currency: globalCurrency,
        });
      }
    }
  }, [client, isOpen, isDuplicate, reset, globalCurrency]);

  if (!isOpen) return null;

  const onSubmit = async (data: ClientFormData) => {
    try {
      if (client && !isDuplicate) {
        await updateClient({ ...client, ...data });
      } else {
        await addClient(data);
      }
      onClose();
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="text-lg font-bold">{
            client 
              ? isDuplicate 
                ? 'Duplicate Client' 
                : 'Edit Client'
              : 'New Client'
          }</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label htmlFor="client-name" className="block text-sm font-medium text-neutral-700 mb-1">Client Name *</label>
            <input
              {...register('name')}
              id="client-name"
              name="name"
              autoFocus
              type="text"
              className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                errors.name ? 'border-red-500' : 'border-neutral-300'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="client-email" className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
              <input
                {...register('email')}
                id="client-email"
                name="email"
                type="email"
                className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                  errors.email ? 'border-red-500' : 'border-neutral-300'
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="client-phone" className="block text-sm font-medium text-neutral-700 mb-1">Phone Number</label>
              <input
                {...register('phone')}
                id="client-phone"
                name="phone"
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                  errors.phone ? 'border-red-500' : 'border-neutral-300'
                }`}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="client-address" className="block text-sm font-medium text-neutral-700 mb-1">Billing Address</label>
            <textarea
              {...register('billingAddress')}
              id="client-address"
              name="billingAddress"
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                errors.billingAddress ? 'border-red-500' : 'border-neutral-300'
              }`}
            />
            {errors.billingAddress && <p className="mt-1 text-xs text-red-500">{errors.billingAddress.message}</p>}
          </div>

          <div>
            <label htmlFor="client-currency" className="block text-sm font-medium text-neutral-700 mb-1">Default Currency</label>
            <select
              {...register('currency')}
              id="client-currency"
              name="currency"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="INR">INR - Indian Rupee</option>
            </select>
          </div>

          <div className="p-6 border-t border-neutral-100 flex justify-end gap-3 bg-neutral-50/50">
            <Button type="button" intent="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>{
              client 
                ? isDuplicate 
                  ? 'Duplicate Client' 
                  : 'Save Changes'
                : 'Save Client'
            }</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
