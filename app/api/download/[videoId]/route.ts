import { NextRequest, NextResponse } from 'next/server';
import { getProduct, getOrdersByEmail } from '@/lib/woocommerce';
import { createClient } from '@/lib/supabase/server';

// Check if purchase is still valid (less than 1 year old)
function isAccessValid(dateCreated: string): boolean {
  const purchaseDate = new Date(dateCreated);
  const expirationDate = new Date(purchaseDate);
  expirationDate.setFullYear(expirationDate.getFullYear() + 1);
  return new Date() < expirationDate;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const videoId = parseInt(params.videoId);

    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Get product details
    const product = await getProduct(videoId);
    if (!product) {
      return NextResponse.json(
        { error: 'Vidéo non trouvée' },
        { status: 404 }
      );
    }

    // Check if user purchased this product
    const orders = await getOrdersByEmail(user.email);
    let hasPurchased = false;
    let isExpired = false;

    for (const order of orders) {
      const hasPurchasedInOrder = order.line_items.some(
        (item: any) => item.product_id === videoId
      );

      if (hasPurchasedInOrder) {
        hasPurchased = true;
        isExpired = !isAccessValid(order.date_created);
        break;
      }
    }

    if (!hasPurchased) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas acheté cette formation' },
        { status: 403 }
      );
    }

    if (isExpired) {
      return NextResponse.json(
        { error: 'Votre accès à cette formation a expiré' },
        { status: 403 }
      );
    }

    // Return product details with download info
    return NextResponse.json({
      id: product.id,
      title: product.name,
      description: product.description,
      downloads: product.downloads || [],
      downloadUrl: product.downloads?.[0]?.file || null,
    });
  } catch (error) {
    console.error('Error processing download:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors du traitement du téléchargement',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
