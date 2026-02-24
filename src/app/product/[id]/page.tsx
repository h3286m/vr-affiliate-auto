import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import productsDataRaw from '@/data/products.json';
import { DmmItem } from '@/types/dmm';
import ProductDetail from '@/components/ProductDetail';

const productsData = productsDataRaw as unknown as DmmItem[];

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
    // Generate paths for ALL products in local data
    return productsData.map((product) => ({
        id: product.content_id,
    }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const params = await props.params;
    const { id } = params;
    const product = productsData.find(p => p.content_id === id);

    if (!product) return { title: 'Not Found' };

    const imageUrl = `https://pics.dmm.co.jp/digital/video/${product.content_id}/${product.content_id}pl.jpg`;
    const description = product.description || `${product.title}の魅力を深掘り！詳細な情報をチェック。`;

    return {
        title: `${product.title} - VR動画詳細`,
        description: description,
        openGraph: {
            title: product.title,
            description: description,
            images: [{ url: imageUrl }],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: product.title,
            description: description,
            images: [imageUrl],
        },
    };
}

export default async function ProductPage(props: Props) {
    const params = await props.params;
    const { id } = params;
    const normalizedId = id.toLowerCase();

    const product = productsData.find(p => p.content_id.toLowerCase() === normalizedId);

    if (!product) {
        notFound();
    }

    return <ProductDetail product={product} />;
}
