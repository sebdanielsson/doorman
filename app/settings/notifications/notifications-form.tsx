'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';

enum NotificationType {
  All = 'all',
  Mentions = 'mentions',
  None = 'none',
}

const notificationsFormSchema = z.object({
  type: z.enum(Object.values(NotificationType) as [string, ...string[]], {
    error: 'You need to select a notification type.',
  }),
  mobile: z.boolean().default(false).optional(),
  communication_emails: z.boolean().default(false).optional(),
  marketing_emails: z.boolean().default(false).optional(),
});

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

// This can come from your database or API.
const defaultValues: Partial<NotificationsFormValues> = {
  communication_emails: false,
  marketing_emails: false,
};

export function NotificationsForm() {
  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues,
  });

  function onSubmit(data: NotificationsFormValues) {
    toast.add({
      title: 'You submitted the following values:',
      description: JSON.stringify(data, null, 2),
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-medium">Påminnelser</h3>
        <div className="space-y-4">
          <Controller
            control={form.control}
            name="communication_emails"
            render={({ field }) => (
              <Field orientation="horizontal" className="rounded-lg border p-4">
                <FieldContent>
                  <FieldLabel htmlFor="notify-booking-start" className="text-base">
                    Start av bokning
                  </FieldLabel>
                  <FieldDescription>Få en notis när en bokning startar.</FieldDescription>
                </FieldContent>
                <Switch
                  id="notify-booking-start"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="marketing_emails"
            render={({ field }) => (
              <Field orientation="horizontal" className="rounded-lg border p-4">
                <FieldContent>
                  <FieldLabel htmlFor="notify-machine-done" className="text-base">
                    Maskin klar
                  </FieldLabel>
                  <FieldDescription>Få en notis när en maskin är klar.</FieldDescription>
                </FieldContent>
                <Switch
                  id="notify-machine-done"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Field>
            )}
          />
        </div>
      </div>
      <Button type="submit">Uppdatera inställningar</Button>
    </form>
  );
}
