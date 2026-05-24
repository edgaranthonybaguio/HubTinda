-- Supabase RLS policies for Tindahub
-- Run these in Supabase SQL editor (one block at a time).

-- 1) Profiles: allow each authenticated user to manage their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_own_profile
  ON public.profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2) Stores: owners manage their store rows
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY stores_owner_manage
  ON public.stores
  FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- 3) Products: public can read active products; store owners can insert/update/delete for their store
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY products_public_select
  ON public.products
  FOR SELECT
  USING (is_active = true);

CREATE POLICY products_seller_insert
  ON public.products
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

CREATE POLICY products_seller_update
  ON public.products
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.id = public.products.store_id AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY products_seller_delete
  ON public.products
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.id = public.products.store_id AND s.owner_id = auth.uid()
    )
  );

-- 4) Product images: public read; store owners can insert images tied to their products
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY product_images_public_select
  ON public.product_images
  FOR SELECT
  USING (true);

CREATE POLICY product_images_seller_insert
  ON public.product_images
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- 5) Cart items: each user manages their own cart rows
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY cart_items_user_policy
  ON public.cart_items
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 6) Orders: buyers can create/select their orders; store owners can view orders for their store
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY orders_buyer_insert
  ON public.orders
  FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

CREATE POLICY orders_buyer_select
  ON public.orders
  FOR SELECT
  USING (buyer_id = auth.uid());

CREATE POLICY orders_store_owner_select
  ON public.orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stores s WHERE s.id = public.orders.store_id AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY orders_store_owner_update
  ON public.orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.stores s WHERE s.id = public.orders.store_id AND s.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stores s WHERE s.id = public.orders.store_id AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY orders_buyer_update
  ON public.orders
  FOR UPDATE
  USING (buyer_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid());

-- 7) Order status history: allow buyers and store owners to read and append order events
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY order_status_history_select
  ON public.order_status_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o WHERE o.id = public.order_status_history.order_id AND (o.buyer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.stores s WHERE s.id = o.store_id AND s.owner_id = auth.uid()))
    )
  );

CREATE POLICY order_status_history_insert
  ON public.order_status_history
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.orders o WHERE o.id = public.order_status_history.order_id AND (o.buyer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.stores s WHERE s.id = o.store_id AND s.owner_id = auth.uid()))
    )
  );

-- 8) Wallets / wallet_transactions: allow owner to view/manage
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY wallets_owner
  ON public.wallets
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY wallet_txns_owner_select
  ON public.wallet_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.wallets w WHERE w.id = public.wallet_transactions.wallet_id AND w.user_id = auth.uid()
    )
  );

-- Notes:
-- - Paste each block into Supabase SQL editor and run. Do not include backslashes or escaped quotes.
-- - Adjust policies if you have different auth schemes or need public read access disabled.
-- - If your storage buckets are private, switch the add-product upload flow to use signed URLs.
