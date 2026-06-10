CREATE DATABASE taskflow_auth;

CREATE USER taskflow_user
WITH PASSWORD 'Taskflow123*';

ALTER DATABASE taskflow_auth
OWNER TO taskflow_user;

CREATE DATABASE taskflow_tasks;

CREATE USER taskflow_tasks_user
WITH PASSWORD 'Taskflow123*';

ALTER DATABASE taskflow_tasks
OWNER TO taskflow_tasks_user;