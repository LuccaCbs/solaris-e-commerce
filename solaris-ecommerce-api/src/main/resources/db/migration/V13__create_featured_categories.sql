CREATE TABLE featured_categories (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL UNIQUE REFERENCES categories(id),
    display_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_featured_categories_active ON featured_categories(active);
CREATE INDEX idx_featured_categories_display_order ON featured_categories(display_order);
