'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

const accountFormSchema = z.object({
  email: z
    .email({ error: 'Måste vara en giltig e-postadress.' })
    .nonempty({ error: 'E-post är obligatoriskt.' }),
  phone: z.string().regex(/^07[0-9]{8}$/, {
    error: 'Måste vara ett giltigt telefonnummer.',
  }),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

// This can come from your database or API.
const defaultValues: Partial<AccountFormValues> = {
  email: '',
  phone: '',
};

export function AccountForm() {
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues,
  });

  function onSubmit(data: AccountFormValues) {
    toast.add({
      title: 'You submitted the following values:',
      description: JSON.stringify(data, null, 2),
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <FieldGroup>
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="account-email">E-post</FieldLabel>
              <Input
                id="account-email"
                placeholder="elon@tesla.com"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="phone"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="account-phone">Telefonnummer</FieldLabel>
              <Input
                id="account-phone"
                placeholder="0701234567"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>
      <Button type="submit">Uppdatera konto</Button>
    </form>
  );
}
