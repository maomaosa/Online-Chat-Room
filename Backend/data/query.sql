/* psql connection : 
psql postgres://esndb_user:et7mC1o2lS6pkaqHFnT6eL1tu6unAwFo@dpg-cmu671uv3ddc738f944g-a.oregon-postgres.render.com/esndb
*/

CREATE TABLE esn_user (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255),
    password_hash VARCHAR(32),
    acknowledge_status SMALLINT DEFAULT 0,
    gender SMALLINT DEFAULT 0,/*0 is other, 1 is male, 2 is female*/
    phone_number VARCHAR(10),
    account_status SMALLINT DEFAULT 0, /* 0 is active, 1 is inactive */
    privilege_level SMALLINT CHECK (privilege_level IN (0, 1, 2)) DEFAULT 0 /* 0 is user, 1 is coordinator, 2 is admin */
);

CREATE TABLE esn_directory (
    id SERIAL PRIMARY KEY, user_id INTEGER, username VARCHAR(255), online_status SMALLINT DEFAULT 0 /* 0 is offline , 1 is online */
);

CREATE TABLE esn_message (
    message_id SERIAL PRIMARY KEY, sender_id INTEGER DEFAULT 0, receiver_id INTEGER, type SMALLINT DEFAULT 0, /* 0 is public message, 1 is private message, 2 is announcement */ content varchar(1024), timestamp BIGINT, message_status SMALLINT DEFAULT 0 /* 0 is undefined , 1 is ok, 2 is help, 3 is emergency  */, is_read SMALLINT DEFAULT 0
);

CREATE TABLE esn_user_share_status (
    id SERIAL PRIMARY KEY, user_id INTEGER, share_status SMALLINT DEFAULT 0 /* 0 is undefined , 1 is ok, 2 is help, 3 is emergency */
);

CREATE TABLE esn_user_share_status_history (
    id SERIAL PRIMARY KEY, user_id INTEGER, share_status SMALLINT DEFAULT 0 /* 0 is undefined , 1 is ok, 2 is help, 3 is emergency */, timestamp BIGINT
);

-- Create the "questionnaires" table
CREATE TABLE esn_questionnaire (
    questionnaire_id SERIAL PRIMARY KEY, questionnaires_name VARCHAR(255), question_1 VARCHAR(255), question_2 VARCHAR(255), question_3 VARCHAR(255), question_4 VARCHAR(255), question_5 VARCHAR(255)
);

CREATE TABLE esn_resource (
    id SERIAL PRIMARY KEY, user_id INTEGER, type SMALLINT DEFAULT 1 /* 0 is traffic , 1 is workplace, 2 is medical, 3 is home, 4 is missing*/, title VARCHAR(64), content VARCHAR(355), address POINT, amount Integer
);

CREATE TABLE esn_resource_request (
    id SERIAL PRIMARY KEY, resource_id INTEGER, user_id Integer, amount Integer, status SMALLINT DEFAULT 0, /* 0 is sent, 1 is approved, 2 is declined, 3 is closed */ timestamp BIGINT
);

CREATE TABLE esn_user_profession_profile (
    id SERIAL PRIMARY KEY, user_id INTEGER, job_type SMALLINT DEFAULT 0 /*0 is Null, 1 is Doctor, 2 is Dentist, 3 is Nurse, 4 is Psychologist, 5 is Police, 6 is FireFighter */, message_content VARCHAR(64)
);

CREATE TABLE esn_appointment (
    id SERIAL PRIMARY KEY, profession_profile_id INTEGER, reserver_id INTEGER,reservee_id INTEGER, start_schedule_date BIGINT,end_schedule_date BIGINT
);

CREATE TABLE esn_emergency_post (
    post_id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, accident_category VARCHAR(255) NOT NULL, address VARCHAR(255) NOT NULL, content TEXT NOT NULL, post_time TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP, user_id INTEGER NOT NULL, user_name VARCHAR(255), picture_url VARCHAR(255), FOREIGN KEY (user_id) REFERENCES esn_user (user_id)
);

CREATE TABLE esn_post_comment (
    comment_id SERIAL PRIMARY KEY, post_id INTEGER NOT NULL, user_id INTEGER NOT NULL, user_name VARCHAR(255), comment_content TEXT NOT NULL, comment_time TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (post_id) REFERENCES esn_emergency_post (post_id), FOREIGN KEY (user_id) REFERENCES esn_user (user_id)
);

CREATE TABLE esn_post_cleared (
    cleared_id SERIAL PRIMARY KEY, post_id INTEGER NOT NULL, user_id INTEGER NOT NULL, timestamp TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (post_id) REFERENCES esn_emergency_post (post_id), FOREIGN KEY (user_id) REFERENCES esn_user (user_id)
);

CREATE TABLE esn_post_can_help (
    can_help_id SERIAL PRIMARY KEY, post_id INTEGER NOT NULL, user_id INTEGER NOT NULL, timestamp TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (post_id) REFERENCES esn_emergency_post (post_id), FOREIGN KEY (user_id) REFERENCES esn_user (user_id)
);