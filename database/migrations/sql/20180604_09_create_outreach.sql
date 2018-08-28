/*
 * Outreach related tables
 */

CREATE TABLE outreach_type (
  outreach_type_id   SERIAL NOT NULL UNIQUE,
  outreach_type_name VARCHAR NOT NULL,

  CONSTRAINT outreach_type_pk PRIMARY KEY (outreach_type_id)
);


CREATE TABLE outreach_meeting_type (
  outreach_meeting_type_id   SERIAL NOT NULL UNIQUE,
  outreach_meeting_type_name VARCHAR NOT NULL UNIQUE,

  CONSTRAINT outreach_meeting_type_pk PRIMARY KEY (outreach_meeting_type_id)
);


CREATE TABLE outreach_campaign (
  outreach_campaign_id  SERIAL NOT NULL UNIQUE,
  outreach_type_id      INT NOT NULL,
  organisation_id       INT NOT NULL,
  created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified_at           TIMESTAMP WITH TIME ZONE,
  deleted_at            TIMESTAMP WITH TIME ZONE,

  CONSTRAINT outreach_campaign_pk                       PRIMARY KEY (outreach_campaign_id),
  CONSTRAINT outreach_campaign_to_community_business_fk FOREIGN KEY (organisation_id)       REFERENCES organisation ON DELETE CASCADE,
  CONSTRAINT outreach_campaign_to_outreach_type_fk      FOREIGN KEY (outreach_type_id)      REFERENCES outreach_type
);


CREATE TABLE outreach_meeting (
  outreach_meeting_id      SERIAL NOT NULL UNIQUE,
  user_account_id          INT NOT NULL,
  outreach_campaign_id     INT NOT NULL,
  outreach_meeting_type_id INT NOT NULL,
  outreach_partner         VARCHAR(100) NOT NULL,
  meeting_subject          VARCHAR(240) NOT NULL,
  scheduled_at             TIMESTAMP WITH TIME ZONE,
  created_at               TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified_at              TIMESTAMP WITH TIME ZONE,
  deleted_at               TIMESTAMP WITH TIME ZONE,

  CONSTRAINT outreach_meeting_pk                          PRIMARY KEY (outreach_meeting_id),
  CONSTRAINT outreach_meeting_to_user_fk                  FOREIGN KEY (user_account_id)          REFERENCES user_account ON DELETE CASCADE,
  CONSTRAINT outreach_meeting_to_outreach_campaign_fk     FOREIGN KEY (outreach_campaign_id)     REFERENCES outreach_campaign,
  CONSTRAINT outreach_meeting_to_outreach_meeting_type_fk FOREIGN KEY (outreach_meeting_type_id) REFERENCES outreach_meeting_type
);


CREATE TABLE outreach_campaign_target_type (
  outreach_campaign_target_type_id SERIAL NOT NULL UNIQUE,
  outreach_campaign_target_name    VARCHAR NOT NULL UNIQUE,

  CONSTRAINT outreach_campaign_target_type_pk PRIMARY KEY (outreach_campaign_target_type_id)
);


CREATE TABLE outreach_campaign_target (
  outreach_campaign_target_type_id INT NOT NULL,
  outreach_type_id                 INT NOT NULL,

  CONSTRAINT outreach_campaign_target_to_outreach_campaign_target_type_fk FOREIGN KEY (outreach_campaign_target_type_id) REFERENCES outreach_campaign_target_type ON DELETE CASCADE,
  CONSTRAINT outreach_campaign_target_to_outreach_type_fk                 FOREIGN KEY (outreach_type_id)                 REFERENCES outreach_type                 ON DELETE CASCADE,
  CONSTRAINT outreach_campaign_target_is_not_redundant                    UNIQUE      (outreach_campaign_target_type_id, outreach_type_id)
);



/*
 * Triggers
 */
CREATE TRIGGER update_outreach_campaign_modified_at BEFORE UPDATE ON outreach_campaign
  FOR EACH ROW EXECUTE PROCEDURE update_modified_at_column();

CREATE TRIGGER update_outreach_meeting_modified_at BEFORE UPDATE ON outreach_meeting
  FOR EACH ROW EXECUTE PROCEDURE update_modified_at_column();
