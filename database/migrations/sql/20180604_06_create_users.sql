/*
 * User related tables
 */

CREATE TABLE user_account (
  user_account_id                  SERIAL NOT NULL UNIQUE,
  user_name                        VARCHAR(100) NOT NULL,
  user_secret                      VARCHAR(64) NOT NULL,
  gender                           ENUM_gender NOT NULL DEFAULT 'prefer not to say',
  email                            VARCHAR(100),
  phone_number                     VARCHAR(20),
  post_code                        VARCHAR(10),
  birth_year                       INT NOT NULL,
  is_email_contact_consent_granted BOOLEAN NOT NULL DEFAULT false,
  is_sms_contact_consent_granted   BOOLEAN NOT NULL DEFAULT false,
  created_at                       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified_at                      TIMESTAMP WITH TIME ZONE,
  deleted_at                       TIMESTAMP WITH TIME ZONE,

  CONSTRAINT user_account_pk                  PRIMARY KEY (user_account_id),
  CONSTRAINT user_account_sensible_birth_year CHECK       (birth_year > 1890)
);


CREATE TABLE user_role (
  user_role_id   SERIAL NOT NULL UNIQUE,
  user_role_name VARCHAR NOT NULL UNIQUE,

  CONSTRAINT user_role_pk PRIMARY KEY (user_role_id)
);


CREATE TABLE permission (
  permission_id SERIAL NOT NULL UNIQUE,
  entity        VARCHAR NOT NULL UNIQUE,
  read_access   ENUM_permission_type NOT NULL,
  write_access  ENUM_permission_type NOT NULL,
  delete_access ENUM_permission_type NOT NULL,

  CONSTRAINT permission_pk PRIMARY KEY (permission_id)
);


CREATE TABLE user_account_access_role (
  user_account_id INT NOT NULL,
  access_role_id  INT NOT NULL,
  organisation_id INT NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified_at     TIMESTAMP WITH TIME ZONE,
  deleted_at      TIMESTAMP WITH TIME ZONE,

  CONSTRAINT user_account_access_role_to_user_fk         FOREIGN KEY (user_account_id) REFERENCES user_account ON DELETE CASCADE,
  CONSTRAINT user_account_access_role_to_access_role_fk  FOREIGN KEY (access_role_id)  REFERENCES access_role  ON DELETE CASCADE,
  CONSTRAINT user_account_access_role_to_organisation_fk FOREIGN KEY (organisation_id) REFERENCES organisation ON DELETE CASCADE,
  CONSTRAINT user_account_access_role_unique_row         UNIQUE      (user_account_id, access_role_id, organisation_id)
);


CREATE TABLE access_role_permission (
  access_role_id INT NOT NULL,
  permission_id  INT NOT NULL,

  CONSTRAINT access_role_permission_to_access_role_fk FOREIGN KEY (access_role_id) REFERENCES access_role ON DELETE CASCADE,
  CONSTRAINT access_role_permission_to_permission_fk  FOREIGN KEY (permission_id)  REFERENCES permission  ON DELETE CASCADE,
  CONSTRAINT access_role_permission_unique_row        UNIQUE      (access_role_id, permission_id)
);



CREATE TABLE user_secret_reset (
  user_secret_reset_id SERIAL NOT NULL UNIQUE,
  user_account_id      INT NOT NULL,
  reset_token          VARCHAR NOT NULL UNIQUE,
  created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP + interval '1 day',
  modified_at          TIMESTAMP WITH TIME ZONE,
  deleted_at           TIMESTAMP WITH TIME ZONE,

  CONSTRAINT user_secret_reset_pk                 PRIMARY KEY (user_secret_reset_id),
  CONSTRAINT user_secret_reset_to_user_account_fk FOREIGN KEY (user_account_id) REFERENCES user_account ON DELETE CASCADE,
  CONSTRAINT user_secret_reset_valid_expiry       CHECK       (expires_at > created_at)
);


CREATE TABLE user_invitation (
  user_invitation_id SERIAL NOT NULL UNIQUE,
  invitation_status  ENUM_invitation_status NOT NULL,
  created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified_at        TIMESTAMP WITH TIME ZONE,
  deleted_at         TIMESTAMP WITH TIME ZONE,

  CONSTRAINT user_invitation_pk PRIMARY KEY (user_invitation_id)
);


CREATE TABLE login_event (
  login_event_id  SERIAL NOT NULL UNIQUE,
  user_account_id INT NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at      TIMESTAMP WITH TIME ZONE,

  CONSTRAINT login_event_pk         PRIMARY KEY (login_event_id),
  CONSTRAINT login_event_to_user_fk FOREIGN KEY (user_account_id) REFERENCES user_account ON DELETE CASCADE
);
