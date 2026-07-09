CREATE TABLE featured_products (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL UNIQUE REFERENCES products(id),
    card_type VARCHAR(50) NOT NULL DEFAULT 'BASIC',
    display_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_featured_products_active ON featured_products(active);
CREATE INDEX idx_featured_products_display_order ON featured_products(display_order);
