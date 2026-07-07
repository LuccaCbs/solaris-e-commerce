CREATE TABLE store_config (
    id BIGSERIAL PRIMARY KEY,
    config_key VARCHAR(255) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    description VARCHAR(255),
    category VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_store_config_key ON store_config(config_key);
CREATE INDEX idx_store_config_category ON store_config(category);
CREATE INDEX idx_store_config_active ON store_config(active);

-- Insertar configuraciones por defecto
INSERT INTO store_config (config_key, config_value, description, category) VALUES
('store.name', 'Solaris E-Commerce', 'Nombre de la tienda', 'general'),
('store.email', 'contact@solaris.com', 'Email de contacto', 'general'),
('store.phone', '+54 11 1234-5678', 'Teléfono de contacto', 'general'),
('store.currency', 'ARS', 'Moneda predeterminada', 'general'),
('store.tax_rate', '21', 'Tasa de impuestos predeterminada', 'tax'),
('payment.mercadopago.enabled', 'false', 'Habilitar MercadoPago', 'payment'),
('payment.stripe.enabled', 'false', 'Habilitar Stripe', 'payment'),
('shipping.default_cost', '0', 'Costo de envío predeterminado', 'shipping'),
('shipping.free_shipping_threshold', '10000', 'Monto para envío gratis', 'shipping');
