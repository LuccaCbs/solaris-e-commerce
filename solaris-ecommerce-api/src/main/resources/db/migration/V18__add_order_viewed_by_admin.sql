ALTER TABLE orders ADD COLUMN viewed_by_admin BOOLEAN NOT NULL DEFAULT false;

UPDATE orders SET viewed_by_admin = true;
