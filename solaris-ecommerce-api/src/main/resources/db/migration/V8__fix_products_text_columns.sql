-- Fix products text columns if they were incorrectly created as bytea (causes lower(bytea) errors)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'products'
          AND column_name = 'name' AND udt_name = 'bytea'
    ) THEN
        ALTER TABLE products
            ALTER COLUMN name TYPE VARCHAR(255) USING convert_from(name, 'UTF8');
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'products'
          AND column_name = 'description' AND udt_name = 'bytea'
    ) THEN
        ALTER TABLE products
            ALTER COLUMN description TYPE TEXT
            USING CASE WHEN description IS NULL THEN NULL ELSE convert_from(description, 'UTF8') END;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'products'
          AND column_name = 'barcode' AND udt_name = 'bytea'
    ) THEN
        ALTER TABLE products
            ALTER COLUMN barcode TYPE VARCHAR(255) USING convert_from(barcode, 'UTF8');
    END IF;
END $$;
