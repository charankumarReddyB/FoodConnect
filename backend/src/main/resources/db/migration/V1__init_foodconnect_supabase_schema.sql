-- ============================================================================
-- FOODCONNECT - FLYWAY V1 DATABASE MIGRATION SCRIPT
-- Target Environment: Supabase / PostgreSQL 15+
-- Java 21 & Spring Boot 3 Compatible Schema
-- ============================================================================

-- 0. EXTENSIONS & SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

SET timezone = 'UTC';

-- 1. ENUM TYPES CREATION
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

-- 2. AUTOMATED UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. TABLES DEFINITIONS

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

-- 3.9 CHECK INS TABLE
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

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_organizations_user ON organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(org_type);
CREATE INDEX IF NOT EXISTS idx_organizations_location ON organizations(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_donations_donor ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_food_type ON donations(food_type);
CREATE INDEX IF NOT EXISTS idx_donations_location ON donations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_donations_expiry ON donations(expiry_time);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_donations_active_geo 
ON donations(latitude, longitude, status) 
WHERE status IN ('CREATED', 'REQUESTED');

CREATE INDEX IF NOT EXISTS idx_food_images_donation ON food_images(donation_id);

CREATE INDEX IF NOT EXISTS idx_requests_donation ON donation_requests(donation_id);
CREATE INDEX IF NOT EXISTS idx_requests_recipient ON donation_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON donation_requests(status);

CREATE INDEX IF NOT EXISTS idx_volunteers_user ON volunteers(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteers_available ON volunteers(is_available);
CREATE INDEX IF NOT EXISTS idx_volunteers_location ON volunteers(current_latitude, current_longitude);

CREATE INDEX IF NOT EXISTS idx_deliveries_donation ON deliveries(donation_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_volunteer ON deliveries(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_checkins_user ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_timestamp ON check_ins(checked_in_at DESC);

-- 3.10 REFRESH TOKENS TABLE
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);

