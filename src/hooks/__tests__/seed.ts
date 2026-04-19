/**
 * Test data seeding for hook tests that require DB state.
 * Seeds a test shop via the Supabase REST API (PostgREST).
 *
 * Requires environment variables:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (from root .env)
 */

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const TEST_SHOP = {
  slug: 'hook-test-shop',
  name: 'Hook Test Shop',
  cashierKey: 'test-hook-cashier-key',
  // bcrypt.hashSync('test-hook-cashier-key', 10)
  cashierKeyHash: '$2b$10$VpMrvkW33WdwWjBDyL1Qlu.hTWqXuHpAStTmW//U0s8ZNJvx0DE8S',
  stampThreshold: 10,
  id: '', // populated after seeding
}

export async function seedTestShop(): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
        'Ensure root .env is loaded.',
    )
  }

  // Check if shop already exists
  const checkRes = await fetch(
    `${SUPABASE_URL}/rest/v1/coffee_shops?slug=eq.${TEST_SHOP.slug}&select=id`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    },
  )
  const existing = (await checkRes.json()) as Array<{ id: string }>

  if (existing.length > 0) {
    TEST_SHOP.id = existing[0].id
    return
  }

  // Insert test shop
  const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/coffee_shops`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      name: TEST_SHOP.name,
      slug: TEST_SHOP.slug,
      cashier_key_hash: TEST_SHOP.cashierKeyHash,
      stamp_threshold: TEST_SHOP.stampThreshold,
    }),
  })

  if (insertRes.ok) {
    const [shop] = (await insertRes.json()) as Array<{ id: string }>
    TEST_SHOP.id = shop.id
    return
  }

  // Handle 409 conflict (parallel test files may race)
  if (insertRes.status === 409) {
    const retryRes = await fetch(
      `${SUPABASE_URL}/rest/v1/coffee_shops?slug=eq.${TEST_SHOP.slug}&select=id`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      },
    )
    const retryData = (await retryRes.json()) as Array<{ id: string }>
    if (retryData.length > 0) {
      TEST_SHOP.id = retryData[0].id
      return
    }
  }

  const body = await insertRes.text()
  throw new Error(`Failed to seed test shop: ${insertRes.status} ${body}`)
}

export async function cleanupTestShop(): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_KEY || !TEST_SHOP.id) return

  // Delete in dependency order: stamps → loyalty_cards → coffee_shops
  await fetch(
    `${SUPABASE_URL}/rest/v1/loyalty_cards?shop_id=eq.${TEST_SHOP.id}`,
    {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    },
  )

  await fetch(
    `${SUPABASE_URL}/rest/v1/coffee_shops?id=eq.${TEST_SHOP.id}`,
    {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    },
  )
}
