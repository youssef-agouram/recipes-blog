'use client';

import { CategoryForm } from '@/components/admin/CategoryForm';
import { useGetCategoryQuery, useUpdateCategoryMutation } from '@/store/api/categoryApi';
import { useRouter, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function EditCategoryPage() {
  const params = useParams();
  const id = Number(params.id);
  const router = useRouter();
  
  const { data: category, isLoading: isFetching } = useGetCategoryQuery(id, {
    skip: !id,
  });
  
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

  const handleSubmit = async (data: any) => {
    try {
      await updateCategory({ id, ...data }).unwrap();
      // Redirect is handled inside CategoryForm
    } catch (err: any) {
      throw err;
    }
  };

  if (isFetching) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <p className="text-lg font-bold text-muted-foreground">Category not found</p>
      </div>
    );
  }

  return <CategoryForm initialData={category} onSubmit={handleSubmit} isLoading={isUpdating} />;
}
