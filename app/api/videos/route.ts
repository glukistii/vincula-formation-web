import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getOrdersByEmail } from '@/lib/woocommerce';

// Calculate if purchase is still valid (less than 1 year old)
function isAccessValid(dateCreated: string): boolean {
  const purchaseDate = new Date(dateCreated);
  const expirationDate = new Date(purchaseDate);
  expirationDate.setFullYear(expirationDate.getFullYear() + 1);
  return new Date() < expirationDate;
}

// Get expiration date for a purchase
function getExpirationDate(dateCreated: string): Date {
  const purchaseDate = new Date(dateCreated);
  const expirationDate = new Date(purchaseDate);
  expirationDate.setFullYear(expirationDate.getFullYear() + 1);
  return expirationDate;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    // Fetch all available products (videos)
    const products = await getProducts();

    // If email provided, fetch user's purchased videos
    let purchasedVideoIds: number[] = [];
    let videoExpirations: Record<number, { expireAt: string; isExpired: boolean }> = {};

    if (email) {
      const orders = await getOrdersByEmail(email);

      // Process each order and check expiration
      orders.forEach((order: any) => {
        const isValid = isAccessValid(order.date_created);
        const expirationDate = getExpirationDate(order.date_created);

        order.line_items.forEach((item: any) => {
          purchasedVideoIds.push(item.product_id);
          videoExpirations[item.product_id] = {
            expireAt: expirationDate.toISOString(),
            isExpired: !isValid,
          };
        });
      });

      // Remove duplicates
      purchasedVideoIds = [...new Set(purchasedVideoIds)];
    }

    // Format response
    const response = {
      all_videos: products.map((product: any) => ({
        id: product.id,
        title: product.name,
        description: product.description,
        price: parseFloat(product.price),
        image: product.images?.[0]?.src || null,
        downloads: product.downloads || [],
        accessInfo: purchasedVideoIds.includes(product.id)
          ? videoExpirations[product.id]
          : null,
      })),
      purchased_ids: purchasedVideoIds.filter((id) => !videoExpirations[id]?.isExpired),
      expired_ids: purchasedVideoIds.filter((id) => videoExpirations[id]?.isExpired),
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
