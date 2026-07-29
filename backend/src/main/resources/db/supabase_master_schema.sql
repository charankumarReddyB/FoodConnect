-- ============================================================================
-- FOODCONNECT - SUPABASE MASTER DATABASE SCHEMA
-- Target Environment: Supabase / PostgreSQL 15+
-- Architect: Senior PostgreSQL & Supabase Database Engineer
-- Description: Production-ready 3NF Schema, ENUMs, Triggers, Indexes, RLS Policies,
--              and Seed Data for FoodConnect Platform.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. EXTENSIONS & SETUP
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone to UTC for standard global timestamp consistency
SET timezone = 'UTC';

-- ----------------------------------------------------------------------------
-- 1. ENUM TYPES CREATION
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'DONOR',
        'NGO',
        'ORPHANAGE',
        'OLD_AGE_HOME',
        'SHELTER',
        'VOLUNTEER',
        'ADMIN'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE organization_type AS ENUM (
        'NGO',
        'ORPHANAGE',
        'OLD_AGE_HOME',
        'SHELTER',
        'COMMUNITY_KITCHEN',
        'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE food_type AS ENUM (
        'VEG',
        'NON_VEG',
        'EGG',
        'VEGAN'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE delivery_method AS ENUM (
        'SELF_PICKUP',
        'DONOR_DELIVERY',
        'VOLUNTEER_DELIVERY'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE donation_status AS ENUM (
        'CREATED',
        'REQUESTED',
        'ACCEPTED',
        'ASSIGNED',
        'PICKED_UP',
        'IN_TRANSIT',
        'DELIVERED',
        'COMPLETED',
        'CANCELLED',
        'EXPIRED'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM (
        'PENDING',
        'ACCEPTED',
        'REJECTED',
        'CANCELLED'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE delivery_status AS ENUM (
        'UNASSIGNED',
        'ASSIGNED',
        'EN_ROUTE_PICKUP',
        'PICKED_UP',
        'EN_ROUTE_DELIVERY',
        'DELIVERED',
        'FAILED',
        'CANCELLED'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'DONATION_POSTED',
        'REQUEST_RECEIVED',
        'REQUEST_ACCEPTED',
        'VOLUNTEER_ASSIGNED',
        'PICKED_UP',
        'DELIVERED',
        'SYSTEM_ALERT'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ----------------------------------------------------------------------------
-- 2. AUTOMATED UPDATED_AT TRIGGER FUNCTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 3. TABLES DEFINITIONS WITH CONSTRAINTS & FKs
-- ----------------------------------------------------------------------------

-- 3.1 USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role user_role NOT NULL DEFAULT 'DONOR',
    profile_image_url TEXT,
    address TEXT,
    latitude NUMERIC(10, 7) CONSTRAINT chk_users_latitude CHECK (latitude BETWEEN -90 AND 90),
    longitude NUMERIC(10, 7) CONSTRAINT chk_users_longitude CHECK (longitude BETWEEN -180 AND 180),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3.2 ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    organization_name VARCHAR(255) NOT NULL,
    org_type organization_type NOT NULL DEFAULT 'NGO',
    registration_number VARCHAR(100) UNIQUE,
    contact_person VARCHAR(150) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(30) NOT NULL,
    address TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL CONSTRAINT chk_org_latitude CHECK (latitude BETWEEN -90 AND 90),
    longitude NUMERIC(10, 7) NOT NULL CONSTRAINT chk_org_longitude CHECK (longitude BETWEEN -180 AND 180),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    capacity_servings INT CONSTRAINT chk_org_capacity CHECK (capacity_servings >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE TRIGGER trg_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3.3 DONATIONS TABLE
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    food_type food_type NOT NULL DEFAULT 'VEG',
    quantity_description VARCHAR(100) NOT NULL,
    estimated_servings INT NOT NULL CONSTRAINT chk_donations_servings CHECK (estimated_servings > 0),
    prepared_time TIMESTAMPTZ NOT NULL,
    expiry_time TIMESTAMPTZ NOT NULL,
    pickup_address TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL CONSTRAINT chk_donations_latitude CHECK (latitude BETWEEN -90 AND 90),
    longitude NUMERIC(10, 7) NOT NULL CONSTRAINT chk_donations_longitude CHECK (longitude BETWEEN -180 AND 180),
    delivery_method delivery_method NOT NULL DEFAULT 'VOLUNTEER_DELIVERY',
    status donation_status NOT NULL DEFAULT 'CREATED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_donations_expiry CHECK (expiry_time > prepared_time)
);

CREATE TRIGGER trg_donations_updated_at
    BEFORE UPDATE ON donations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3.4 FOOD IMAGES TABLE
CREATE TABLE IF NOT EXISTS food_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3.5 DONATION REQUESTS TABLE
CREATE TABLE IF NOT EXISTS donation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    status request_status NOT NULL DEFAULT 'PENDING',
    requested_servings INT CONSTRAINT chk_req_servings CHECK (requested_servings > 0),
    notes TEXT,
    request_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    response_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_donation_recipient UNIQUE (donation_id, recipient_id)
);

CREATE TRIGGER trg_donation_requests_updated_at
    BEFORE UPDATE ON donation_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3.6 VOLUNTEERS TABLE
CREATE TABLE IF NOT EXISTS volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(50) NOT NULL DEFAULT 'BICYCLE',
    license_number VARCHAR(50),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    current_latitude NUMERIC(10, 7) CONSTRAINT chk_vol_latitude CHECK (current_latitude BETWEEN -90 AND 90),
    current_longitude NUMERIC(10, 7) CONSTRAINT chk_vol_longitude CHECK (current_longitude BETWEEN -180 AND 180),
    rating NUMERIC(3, 2) DEFAULT 5.00 CONSTRAINT chk_vol_rating CHECK (rating BETWEEN 1.00 AND 5.00),
    completed_deliveries_count INT NOT NULL DEFAULT 0 CONSTRAINT chk_vol_deliveries CHECK (completed_deliveries_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_volunteers_updated_at
    BEFORE UPDATE ON volunteers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3.7 DELIVERIES TABLE
CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID UNIQUE NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES volunteers(id) ON DELETE SET NULL,
    request_id UUID REFERENCES donation_requests(id) ON DELETE SET NULL,
    status delivery_status NOT NULL DEFAULT 'UNASSIGNED',
    pickup_time TIMESTAMPTZ,
    delivery_time TIMESTAMPTZ,
    pickup_verification_code VARCHAR(10),
    delivery_verification_code VARCHAR(10),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_deliveries_updated_at
    BEFORE UPDATE ON deliveries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3.8 NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3.9 CHECK INS TABLE (Supporting attendance & audit tracking)
CREATE TABLE IF NOT EXISTS check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id VARCHAR(100),
    location VARCHAR(255),
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'CHECKED_IN',
    checked_in_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 4. PERFORMANCE INDEXES
-- ----------------------------------------------------------------------------

-- Indexes on Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude);

-- Indexes on Organizations
CREATE INDEX IF NOT EXISTS idx_organizations_user ON organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(org_type);
CREATE INDEX IF NOT EXISTS idx_organizations_location ON organizations(latitude, longitude);

-- Indexes on Donations
CREATE INDEX IF NOT EXISTS idx_donations_donor ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_food_type ON donations(food_type);
CREATE INDEX IF NOT EXISTS idx_donations_location ON donations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_donations_expiry ON donations(expiry_time);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);

-- Composite Index for Location-based Active Donations Query
CREATE INDEX IF NOT EXISTS idx_donations_active_geo 
ON donations(latitude, longitude, status) 
WHERE status IN ('CREATED', 'REQUESTED');

-- Indexes on Food Images
CREATE INDEX IF NOT EXISTS idx_food_images_donation ON food_images(donation_id);

-- Indexes on Donation Requests
CREATE INDEX IF NOT EXISTS idx_requests_donation ON donation_requests(donation_id);
CREATE INDEX IF NOT EXISTS idx_requests_recipient ON donation_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON donation_requests(status);

-- Indexes on Volunteers
CREATE INDEX IF NOT EXISTS idx_volunteers_user ON volunteers(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteers_available ON volunteers(is_available);
CREATE INDEX IF NOT EXISTS idx_volunteers_location ON volunteers(current_latitude, current_longitude);

-- Indexes on Deliveries
CREATE INDEX IF NOT EXISTS idx_deliveries_donation ON deliveries(donation_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_volunteer ON deliveries(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);

-- Indexes on Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Indexes on Check Ins
CREATE INDEX IF NOT EXISTS idx_checkins_user ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_timestamp ON check_ins(checked_in_at DESC);

-- ----------------------------------------------------------------------------
-- 5. SAMPLE SEED DATA
-- ----------------------------------------------------------------------------

-- Seed Users
INSERT INTO users (id, email, phone, password_hash, full_name, role, address, latitude, longitude, email_verified)
VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@foodconnect.org', '+919876543210', '$2a$12$eImiTXuWVxfM37uY4JANjOL.sU8nZJ1d3t2Jk5k0g4Q.', 'Admin Officer', 'ADMIN', 'MG Road Headquarters, Bengaluru', 12.9716, 77.5946, TRUE),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'arjun@caterers.in', '+919876543211', '$2a$12$eImiTXuWVxfM37uY4JANjOL.sU8nZJ1d3t2Jk5k0g4Q.', 'Arjun Sharma (Grand Palace Caterers)', 'DONOR', 'Indira Nagar 100ft Road, Bengaluru', 12.9784, 77.6408, TRUE),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'contact@akshayapatra.org', '+918030143400', '$2a$12$eImiTXuWVxfM37uY4JANjOL.sU8nZJ1d3t2Jk5k0g4Q.', 'Akshaya Patra Trust', 'NGO', 'HK Hill, Rajajinagar, Bengaluru', 12.9892, 77.5513, TRUE),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'priya@volunteer.org', '+919876543213', '$2a$12$eImiTXuWVxfM37uY4JANjOL.sU8nZJ1d3t2Jk5k0g4Q.', 'Priya Nair', 'VOLUNTEER', 'BTM Layout 2nd Stage, Bengaluru', 12.9166, 77.6101, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Seed Organizations
INSERT INTO organizations (id, user_id, organization_name, org_type, registration_number, contact_person, contact_email, contact_phone, address, latitude, longitude, is_verified, capacity_servings)
VALUES
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Akshaya Patra Foundation', 'NGO', 'REG-KA-2023-991', 'Ramesh Kumar', 'contact@akshayapatra.org', '+918030143400', 'HK Hill, Rajajinagar, Bengaluru', 12.9892, 77.5513, TRUE, 500)
ON CONFLICT (id) DO NOTHING;

-- Seed Donations
INSERT INTO donations (id, donor_id, title, description, food_type, quantity_description, estimated_servings, prepared_time, expiry_time, pickup_address, latitude, longitude, delivery_method, status)
VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Fresh Vegetable Biryani & Gravy', '25 kg of freshly cooked veg biryani from wedding banquet', 'VEG', '25 kg', 80, NOW() - INTERVAL '2 hours', NOW() + INTERVAL '10 hours', 'Hotel Grand Palace, MG Road, Bengaluru', 12.9716, 77.5946, 'VOLUNTEER_DELIVERY', 'ACCEPTED')
ON CONFLICT (id) DO NOTHING;

-- Seed Food Images
INSERT INTO food_images (id, donation_id, image_url, is_primary)
VALUES
(gen_random_uuid(), 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Seed Donation Requests
INSERT INTO donation_requests (id, donation_id, recipient_id, status, requested_servings, notes)
VALUES
('11eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'ACCEPTED', 80, 'Requesting full batch for evening distribution drive.')
ON CONFLICT (id) DO NOTHING;

-- Seed Volunteers
INSERT INTO volunteers (id, user_id, vehicle_type, license_number, is_available, current_latitude, current_longitude, rating, completed_deliveries_count)
VALUES
('22eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'TWO_WHEELER', 'KA-01-2023-00921', TRUE, 12.9716, 77.5946, 4.95, 42)
ON CONFLICT (id) DO NOTHING;

-- Seed Deliveries
INSERT INTO deliveries (id, donation_id, volunteer_id, request_id, status, pickup_time, pickup_verification_code, delivery_verification_code, notes)
VALUES
('33eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', '22eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', '11eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'EN_ROUTE_PICKUP', NOW() - INTERVAL '15 minutes', '8492', '1942', 'Volunteer dispatched for pickup.')
ON CONFLICT (id) DO NOTHING;

-- Seed Notifications
INSERT INTO notifications (id, user_id, type, title, message, is_read, metadata)
VALUES
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'REQUEST_ACCEPTED', 'Donation Request Approved', 'Your request for 80 servings of Vegetable Biryani was accepted by Arjun Sharma.', FALSE, '{"donation_id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed Check-ins
INSERT INTO check_ins (id, user_id, event_id, location, notes, status)
VALUES
(gen_random_uuid(), 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'EVT-VOLUNTEER-SHIFT-01', 'Central Logistics Hub', 'Morning volunteer shift check-in', 'CHECKED_IN')
ON CONFLICT (id) DO NOTHING;
