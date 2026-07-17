INSERT INTO store_config (config_key, config_value, description, category) VALUES
('appearance.store_name', 'Solaris', 'Nombre de la tienda mostrado en el header', 'appearance'),
('appearance.logo_image', '', 'Logo de la tienda en base64', 'appearance'),
('appearance.branding_mode', 'TEXT', 'Modo de marca: TEXT, LOGO, TEXT_AND_LOGO', 'appearance'),
('appearance.font_family', 'PLAYFAIR_DISPLAY', 'Tipografia de marca del header', 'appearance')
ON CONFLICT (config_key) DO NOTHING;
