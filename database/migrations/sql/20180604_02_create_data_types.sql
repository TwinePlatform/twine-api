/*
 * Enumerations
 */

CREATE TYPE ENUM_gender              AS ENUM ('male', 'female', 'prefer not to say');
CREATE TYPE ENUM_turnover_band       AS ENUM ('<£100k', '£100k-£250k', '£250k-£500k', '£500k-£750k', '£750k-£1m', '£1m-£5m', '£5m-£10m', '>£10m');
CREATE TYPE ENUM_permission_type     AS ENUM ('own', 'own_organisation', 'own_beneficiaries');
CREATE TYPE ENUM_invitation_status   AS ENUM ('sent', 're-sent', 'accepted', 'revoked');
CREATE TYPE ENUM_organisation_type   AS ENUM ('cb', 'funder');
CREATE TYPE ENUM_subscription_status AS ENUM ('trial', 'active', 'frozen', 'closed');
