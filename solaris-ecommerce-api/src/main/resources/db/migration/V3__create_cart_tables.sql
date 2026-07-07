-- Create carts table
CREATE TABLE carts (
    id BIGSERIAL PRIMARY KEY,
    cart_identifier VARCHAR(255) UNIQUE NOT NULL,
    user_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_items INTEGER NOT NULL DEFAULT 0
);

-- Create cart_items table
CREATE TABLE cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    product_name VARCHAR(1000),
    product_barcode VARCHAR(255)
);

-- Create indexes for better performance
CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_carts_identifier ON carts(cart_identifier);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);
