// WooCommerce API client
const WP_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://www.vincula-formation.com';
const WC_KEY = process.env.WOOCOMMERCE_API_KEY || 'ck_edf1a3081f4b2146e543283b055892707fd9e3ca';
const WC_SECRET = process.env.WOOCOMMERCE_API_SECRET || 'cs_00ef159e24948984cf54bce9454b96ae74870d08';

// Create Basic Auth header
function getAuthHeader() {
  const credentials = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
  return `Basic ${credentials}`;
}

// Fetch products from WooCommerce
export async function getProducts(params: Record<string, string | number> = {}) {
  const query = new URLSearchParams({
    per_page: '100',
    ...params,
  }).toString();

  const response = await fetch(`${WP_URL}/wp-json/wc/v3/products?${query}`, {
    headers: {
      Authorization: getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  return response.json();
}

// Fetch orders for a customer by email
export async function getOrdersByEmail(email: string) {
  const response = await fetch(
    `${WP_URL}/wp-json/wc/v3/orders?customer_email=${email}&per_page=100`,
    {
      headers: {
        Authorization: getAuthHeader(),
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch orders: ${response.statusText}`);
  }

  return response.json();
}

// Fetch single product with details
export async function getProduct(id: number) {
  const response = await fetch(`${WP_URL}/wp-json/wc/v3/products/${id}`, {
    headers: {
      Authorization: getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.statusText}`);
  }

  return response.json();
}

// Fetch customer info
export async function getCustomerByEmail(email: string) {
  const response = await fetch(
    `${WP_URL}/wp-json/wc/v3/customers?email=${email}`,
    {
      headers: {
        Authorization: getAuthHeader(),
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch customer: ${response.statusText}`);
  }

  const data = await response.json();
  return data[0] || null;
}
