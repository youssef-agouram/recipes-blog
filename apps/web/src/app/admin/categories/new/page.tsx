'use client';

import { CategoryForm } from '@/components/admin/CategoryForm';
import { useCreateCategoryMutation } from '@/store/api/categoryApi';
import { useRouter } from 'next/navigation';

export default function NewCategoryPage() {
  const router = useRouter();
  const [createCategory, { isLoading }] = useCreateCategoryMutation();

  const handleSubmit = async (data: any) => {
    try {
      await createCategory(data).unwrap();
      // Redirect is handled inside CategoryForm on success, 
      // but we can also handle it here if needed.
    } catch (err: any) {
      throw err;
    }
  };

  return <CategoryForm onSubmit={handleSubmit} isLoading={isLoading} />;
}
