-- FoodConnect India Seed Data

-- 1. Roles
INSERT INTO roles (id, name) VALUES (1, 'ADMIN') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (id, name) VALUES (2, 'DONOR') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (id, name) VALUES (3, 'RECIPIENT') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (id, name) VALUES (4, 'VOLUNTEER') ON CONFLICT (name) DO NOTHING;

-- 2. Platform Settings
INSERT INTO settings (key_name, value, description) VALUES ('DEFAULT_RADIUS_KM', '15.0', 'Default radius for nearby donation searches in KM') ON CONFLICT (key_name) DO NOTHING;
INSERT INTO settings (key_name, value, description) VALUES ('MAX_EXPIRATION_HOURS', '24', 'Maximum allowed shelf life for fresh donations in hours') ON CONFLICT (key_name) DO NOTHING;
INSERT INTO settings (key_name, value, description) VALUES ('PLATFORM_NAME', 'FoodConnect India', 'Platform branding name') ON CONFLICT (key_name) DO NOTHING;
INSERT INTO settings (key_name, value, description) VALUES ('CURRENCY_SYMBOL', '₹', 'Platform currency symbol') ON CONFLICT (key_name) DO NOTHING;
INSERT INTO settings (key_name, value, description) VALUES ('SUPPORT_HELPLINE', '+91 1800-123-FOOD', 'Indian Toll-Free Helpline') ON CONFLICT (key_name) DO NOTHING;

-- 3. Sample Organizations (NGOs & Shelters in India)
INSERT INTO organizations (id, organization_name, type, email, phone, address, latitude, longitude, verified)
VALUES 
(1, 'Akshaya Patra Foundation', 'NGO', 'contact@akshayapatra.org', '+918030143400', 'HK Hill, Rajajinagar, Bengaluru, Karnataka 560010', 12.9892, 77.5513, TRUE),
(2, 'Robin Hood Army India', 'VOLUNTEER_GROUP', 'contact@robinhoodarmy.com', '+919988776655', 'Koramangala 5th Block, Bengaluru, Karnataka 560095', 12.9352, 77.6245, TRUE),
(3, 'Feeding India by Zomato', 'NGO', 'info@feedingindia.org', '+919811223344', 'Connaught Place, New Delhi 110001', 28.6315, 77.2167, TRUE),
(4, 'No Food Waste India', 'NGO', 'feed@nofoodwaste.org', '+919444455555', 'T. Nagar, Chennai, Tamil Nadu 600017', 13.0418, 80.2341, TRUE)
ON CONFLICT (id) DO NOTHING;
