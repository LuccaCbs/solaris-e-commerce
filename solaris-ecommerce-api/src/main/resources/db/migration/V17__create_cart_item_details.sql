CREATE TABLE cart_item_details (
    id BIGSERIAL PRIMARY KEY,
    cart_item_id BIGINT NOT NULL REFERENCES cart_items(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    product_form_field_id BIGINT REFERENCES product_form_fields(id),
    field_key VARCHAR(100) NOT NULL,
    field_label VARCHAR(255) NOT NULL,
    field_value TEXT NOT NULL
);

CREATE INDEX idx_cart_item_details_cart_item ON cart_item_details(cart_item_id);
