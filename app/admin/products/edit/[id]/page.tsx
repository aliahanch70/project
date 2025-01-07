'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ProductForm from '@/components/admin/products/ProductForm';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductEditPageProps {
  params: {
    id: string;
  };
}

export default function ProductEditPage({ params }: ProductEditPageProps) {
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase
        .from('products')
        .select(`
          *,
          product_images (url, label, order),
          product_links (title, url)
        `)
        .eq('id', params.id)
        .single();

      if (data) {
        setInitialData(data);
      }
    };

    fetchProduct();
  }, [params.id, supabase]);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.get('name'),
          description: formData.get('description'),
          price: parseFloat(formData.get('price') as string),
          category: formData.get('category'),
          status: formData.get('status'),
        })
        .eq('id', params.id);

      if (error) throw error;

      // Handle links update
      const links = JSON.parse(formData.get('links') as string);
      await supabase
        .from('product_links')
        .delete()
        .eq('product_id', params.id);

      if (links.length > 0) {
        await supabase.from('product_links').insert(
          links.map((link: any) => ({
            product_id: params.id,
            title: link.title,
            url: link.url
          }))
        );
      }

      // Handle images update
      const images = JSON.parse(formData.get('images') as string);
      await supabase
        .from('product_images')
        .delete()
        .eq('product_id', params.id);

      if (images.length > 0) {
        await supabase.from('product_images').insert(
          images.map((image: any, index: number) => ({
            product_id: params.id,
            url: image.url.startsWith('/') ? image.url.substring(1) : image.url,
            label: image.label,
            order: index
          }))
        );
      }

      router.push('/admin/products/manage');
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!initialData) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Product</CardTitle>
          </CardHeader>
          <ProductForm 
            onSubmit={handleSubmit} 
            loading={loading}
            initialData={initialData}
          />
        </Card>
      </div>
    </div>
  );
}