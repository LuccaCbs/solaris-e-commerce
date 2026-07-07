-- Create users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    auth_provider VARCHAR(50) NOT NULL DEFAULT 'LOCAL',
    google_sub VARCHAR(255) UNIQUE,
    role VARCHAR(50),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    platform_operator BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create categories table
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    system_category BOOLEAN NOT NULL DEFAULT FALSE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    created_by_user_id BIGINT REFERENCES users(id)
);

-- Create customers table
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    document_type VARCHAR(50) NOT NULL,
    document_number VARCHAR(20) NOT NULL,
    razon_social VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(255),
    address VARCHAR(500),
    condicion_iva VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    created_by_user_id BIGINT REFERENCES users(id)
);

-- Create customer_documents table
CREATE TABLE customer_documents (
    id BIGSERIAL PRIMARY KEY,
    document_type VARCHAR(50) NOT NULL,
    document_number VARCHAR(20) NOT NULL,
    primary_doc BOOLEAN NOT NULL DEFAULT FALSE,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE
);

-- Create products table
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    barcode VARCHAR(255) NOT NULL,
    barcode_format VARCHAR(50) NOT NULL DEFAULT 'CODE_128',
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER NOT NULL,
    low_stock_threshold INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT NOT NULL REFERENCES users(id),
    created_by_user_id BIGINT REFERENCES users(id),
    category_id BIGINT REFERENCES categories(id),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    iva_rate VARCHAR(50) NOT NULL DEFAULT 'GENERAL_21',
    CONSTRAINT uk_products_barcode UNIQUE (barcode)
);

-- Create product_images table
CREATE TABLE product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id),
    encrypted_data TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_customers_user ON customers(user_id);
CREATE INDEX idx_customer_documents_customer ON customer_documents(customer_id);
CREATE INDEX idx_categories_user ON categories(user_id);
