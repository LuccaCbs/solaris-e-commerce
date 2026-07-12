-- Allow menu ITEM entries to reference a product
ALTER TABLE categories ADD COLUMN product_id BIGINT REFERENCES products(id);

CREATE INDEX idx_categories_product ON categories(product_id);
