ALTER TABLE categories ADD COLUMN parent_id BIGINT NULL;
ALTER TABLE categories ADD COLUMN image_data TEXT NULL;

ALTER TABLE categories
    ADD CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);

INSERT INTO store_config (config_key, config_value, description, category) VALUES
('appearance.theme', 'LIGHT_YELLOW', 'Preset de estética seleccionado', 'appearance'),
('appearance.primary_color', '#facc15', 'Color primario de la tienda', 'appearance'),
('appearance.secondary_color', '#111827', 'Color secundario / texto de la tienda', 'appearance'),
('appearance.accent_color', '#ffffff', 'Color de fondo / acento de la tienda', 'appearance'),
('appearance.hero_title', 'Bienvenido a nuestra tienda', 'Titulo principal del banner', 'appearance'),
('appearance.hero_subtitle', '', 'Subtitulo del banner principal', 'appearance'),
('appearance.hero_images', '[]', 'Imagenes del banner principal (JSON array base64)', 'appearance'),
('appearance.layout_style', 'STORE', 'Estilo de layout de la tienda (STORE, etc.)', 'appearance');
