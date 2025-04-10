--
-- PostgreSQL database dump
--

-- Dumped from database version 14.9
-- Dumped by pg_dump version 14.17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

COPY auth.users (operator_id, territory_id, email, firstname, lastname, phone, password, status, token, token_expires_at, role, ui_status, hidden) FROM stdin;
\N	327	territory@example.com	Territory	Registry	\N	$2a$10$j7uymt8YOuOo72/9RuHX5.V/Kh8mrAL6d/Aae0pS4Jt3z3FGgcr9a	active	\N	\N	territory.admin	\N	f
\N	\N	admin@example.com	Admin	Registry	\N	$2a$10$j7uymt8YOuOo72/9RuHX5.V/Kh8mrAL6d/Aae0pS4Jt3z3FGgcr9a	active	\N	\N	registry.admin	\N	f
9	\N	operator@example.com	Admin	Operator	\N	$2a$10$j7uymt8YOuOo72/9RuHX5.V/Kh8mrAL6d/Aae0pS4Jt3z3FGgcr9a	active	\N	\N	operator.admin	\N	f
\.
