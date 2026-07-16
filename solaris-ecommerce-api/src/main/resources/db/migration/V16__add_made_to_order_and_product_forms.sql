ALTER TABLE products
    ADD COLUMN made_to_order BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE orders
    ALTER COLUMN customer_id DROP NOT NULL;

CREATE TABLE product_forms (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_form_fields (
    id BIGSERIAL PRIMARY KEY,
    product_form_id BIGINT NOT NULL REFERENCES product_forms(id) ON DELETE CASCADE,
    field_key VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    required BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    options TEXT,
    placeholder VARCHAR(255),
    CONSTRAINT uk_product_form_fields_key UNIQUE (product_form_id, field_key)
);

CREATE INDEX idx_product_form_fields_form ON product_form_fields(product_form_id);

CREATE TABLE product_order_details (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    order_item_id BIGINT NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    product_form_field_id BIGINT REFERENCES product_form_fields(id),
    field_key VARCHAR(100) NOT NULL,
    field_label VARCHAR(255) NOT NULL,
    field_value TEXT NOT NULL
);

CREATE INDEX idx_product_order_details_order ON product_order_details(order_id);
CREATE INDEX idx_product_order_details_order_item ON product_order_details(order_item_id);
CREATE INDEX idx_product_order_details_product ON product_order_details(product_id);
