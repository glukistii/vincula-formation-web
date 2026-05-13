import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getOrdersByEmail } from '@/lib/woocommerce';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    // Fetch all available products (videos)
    const products = await getProducts();

    // If email provided, fetch user's purchased videos
    let purchasedVideoIds: number[] = [];
    if (email) {
      const orders = await getOrdersByEmail(email);
      // Extract product IDs from orders
      purchasedVideoIds = orders
        .flatMap((order: any) => order.line_items)
        .map((item: any) => item.product_id);
    }

    // Format response
    const response = {
      all_videos: products.map((product: any) => ({
        id: product.id,
        title: product.name,
        description: product.description,
        price: parseFloat(product.price),
        image: product.images?.[0]?.src || null,
        downloads: product.downloads || [], // Array of downloadable files (videos)
      })),
      purchased_ids: purchasedVideoIds,
      user_email: email || null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération des vidéos',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
