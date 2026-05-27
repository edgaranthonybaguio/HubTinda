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

-- 5.1) Delivery addresses: users can manage their own shipping addresses
ALTER TABLE public.delivery_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY delivery_addresses_owner
  ON public.delivery_addresses
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

CREATE POLICY wallet_txns_owner_insert
  ON public.wallet_transactions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.wallets w WHERE w.id = public.wallet_transactions.wallet_id AND w.user_id = auth.uid()
    )
  );

-- Notes:
-- - Paste each block into Supabase SQL editor and run. Do not include backslashes or escaped quotes.
-- - Adjust policies if you have different auth schemes or need public read access disabled.
-- - If your storage buckets are private, switch the add-product upload flow to use signed URLs.

-- 9) Wallet checkout transaction: create order, order items, deduct wallet, record transaction, and clear cart in one atomic request.
ALTER TYPE public.payment_method ADD VALUE IF NOT EXISTS 'wallet';
ALTER TYPE public.transaction_type ADD VALUE IF NOT EXISTS 'credit';
ALTER TYPE public.transaction_type ADD VALUE IF NOT EXISTS 'debit';
ALTER TYPE public.transaction_status ADD VALUE IF NOT EXISTS 'completed';

CREATE OR REPLACE FUNCTION public.create_wallet_order(
  store_id uuid,
  delivery_address_id uuid,
  payment_method text,
  subtotal numeric,
  delivery_fee numeric,
  total numeric,
  estimated_delivery text,
  product_items jsonb
)
RETURNS TABLE(order_id uuid, order_number text)
LANGUAGE plpgsql
SECURITY DEFINER
SET row_security = off
AS $$
DECLARE
  v_wallet public.wallets%ROWTYPE;
  v_seller_wallet public.wallets%ROWTYPE;
  v_order public.orders%ROWTYPE;
  v_seller_id uuid;
  item jsonb;
BEGIN
  SELECT * INTO v_wallet
  FROM public.wallets
  WHERE user_id = auth.uid()
  FOR UPDATE;

  IF v_wallet IS NULL THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;

  IF v_wallet.balance < total THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;

  SELECT owner_id INTO v_seller_id
  FROM public.stores
  WHERE id = store_id;

  IF v_seller_id IS NULL THEN
    RAISE EXCEPTION 'Store not found';
  END IF;

  SELECT * INTO v_seller_wallet
  FROM public.wallets
  WHERE user_id = v_seller_id
  FOR UPDATE;

  IF v_seller_wallet IS NULL THEN
    INSERT INTO public.wallets(user_id, balance, currency)
    VALUES (v_seller_id, 0, 'PHP')
    RETURNING * INTO v_seller_wallet;
  END IF;

  UPDATE public.wallets
  SET balance = v_wallet.balance - total
  WHERE id = v_wallet.id;

  UPDATE public.wallets
  SET balance = v_seller_wallet.balance + total
  WHERE id = v_seller_wallet.id;

  INSERT INTO public.orders(
    buyer_id, store_id, delivery_address_id,
    payment_method, payment_status, subtotal,
    delivery_fee, total, estimated_delivery
  ) VALUES (
    auth.uid(), store_id, delivery_address_id,
    payment_method::public.payment_method, 'paid', subtotal,
    delivery_fee, total, estimated_delivery
  ) RETURNING * INTO v_order;

  FOR item IN SELECT * FROM jsonb_array_elements(product_items) LOOP
    INSERT INTO public.order_items(
      order_id, product_id, product_name, product_image,
      unit_price, quantity
    ) VALUES (
      v_order.id,
      (item->>'product_id')::uuid,
      item->>'product_name',
      NULLIF(item->>'product_image',''),
      (item->>'unit_price')::numeric,
      (item->>'quantity')::integer
    );

    UPDATE public.products
    SET stock = GREATEST(stock - (item->>'quantity')::integer, 0)
    WHERE id = (item->>'product_id')::uuid;
  END LOOP;

  INSERT INTO public.wallet_transactions(
    wallet_id, type, status,
    amount, balance_before, balance_after,
    reference, description, order_id
  ) VALUES (
    v_wallet.id,
    'debit'::public.transaction_type,
    'completed'::public.transaction_status,
    total,
    v_wallet.balance,
    v_wallet.balance - total,
    concat('order_', v_order.id),
    concat('Payment for order ', v_order.order_number),
    v_order.id
  );

  INSERT INTO public.wallet_transactions(
    wallet_id, type, status,
    amount, balance_before, balance_after,
    reference, description, order_id
  ) VALUES (
    v_seller_wallet.id,
    'credit'::public.transaction_type,
    'completed'::public.transaction_status,
    total,
    v_seller_wallet.balance,
    v_seller_wallet.balance + total,
    concat('order_', v_order.id, '_seller'),
    concat('Seller payout for order ', v_order.order_number),
    v_order.id
  );

  INSERT INTO public.order_status_history(order_id, status)
  VALUES (v_order.id, 'pending');

  DELETE FROM public.cart_items WHERE user_id = auth.uid();

  RETURN QUERY SELECT v_order.id, v_order.order_number;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_wallet_order(uuid, uuid, text, numeric, numeric, numeric, text, jsonb) TO authenticated;
