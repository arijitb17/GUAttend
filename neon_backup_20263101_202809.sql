--
-- PostgreSQL database dump
--

\restrict apX2gaj2f3ZWdE0ZlJKbWgSLRj0hkI8HnD8gb4OX5Sf5Wpf3KAsphIU1gEwcHNd

-- Dumped from database version 17.7 (bdd1736)
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO neondb_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: neondb_owner
--

COMMENT ON SCHEMA public IS '';


--
-- Name: Role; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'TEACHER',
    'STUDENT'
);


ALTER TYPE public."Role" OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AcademicYear; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."AcademicYear" (
    id text NOT NULL,
    name text NOT NULL,
    "programId" text NOT NULL
);


ALTER TABLE public."AcademicYear" OWNER TO neondb_owner;

--
-- Name: Attendance; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Attendance" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "courseId" text NOT NULL,
    status boolean DEFAULT false NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "photoPath" text
);


ALTER TABLE public."Attendance" OWNER TO neondb_owner;

--
-- Name: Course; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Course" (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    "entryCode" text NOT NULL,
    "teacherId" text NOT NULL,
    "semesterId" text NOT NULL
);


ALTER TABLE public."Course" OWNER TO neondb_owner;

--
-- Name: Department; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Department" (
    id text NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."Department" OWNER TO neondb_owner;

--
-- Name: Program; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Program" (
    id text NOT NULL,
    name text NOT NULL,
    "departmentId" text NOT NULL
);


ALTER TABLE public."Program" OWNER TO neondb_owner;

--
-- Name: Semester; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Semester" (
    id text NOT NULL,
    name text NOT NULL,
    "academicYearId" text NOT NULL
);


ALTER TABLE public."Semester" OWNER TO neondb_owner;

--
-- Name: Student; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Student" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "programId" text NOT NULL,
    "faceEmbedding" bytea,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text DEFAULT 'active'::text NOT NULL
);


ALTER TABLE public."Student" OWNER TO neondb_owner;

--
-- Name: Teacher; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Teacher" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "departmentId" text NOT NULL
);


ALTER TABLE public."Teacher" OWNER TO neondb_owner;

--
-- Name: User; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO neondb_owner;

--
-- Name: _CourseStudents; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."_CourseStudents" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_CourseStudents" OWNER TO neondb_owner;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO neondb_owner;

--
-- Data for Name: AcademicYear; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."AcademicYear" (id, name, "programId") FROM stdin;
cmjhfamg7000juwp4vb5xkji4	2025(Aug-Sep)	cmjhf5lbn000buwp4ldob8nzk
cmjhffw0a000tuwp4edwu77v4	2025(Aug-Sep)	cmjhf864m000fuwp44amopano
cmjhfi4zg000zuwp4rmdwr2l7	2025(Aug-Sep)	cmjhf8tpt000huwp4bch0j5nn
\.


--
-- Data for Name: Attendance; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Attendance" (id, "studentId", "courseId", status, "timestamp", "photoPath") FROM stdin;
cmjn2vw5q0001uwkcl25dm7r9	cmjmoth65000huw68ccd5lcum	cmjhfan4k000nuwp4vne02gie	t	2024-11-11 10:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1731319200000.jpg
cmjn2vwa90003uwkci5csfqod	cmjmoth65000huw68ccd5lcum	cmjhfan4k000nuwp4vne02gie	t	2024-11-13 14:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1731506400000.jpg
cmjn2vwcd0005uwkcjznhyj7f	cmjmoth65000huw68ccd5lcum	cmjhfan4k000nuwp4vne02gie	t	2024-11-15 16:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1731686400000.jpg
cmjn2vwej0007uwkc40ivqlxz	cmjmoth65000huw68ccd5lcum	cmjhfan4k000nuwp4vne02gie	t	2024-11-18 10:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1731924000000.jpg
cmjn2vwgp0009uwkc32rnfceh	cmjmoth65000huw68ccd5lcum	cmjhfan4k000nuwp4vne02gie	t	2024-11-20 14:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1732111200000.jpg
cmjn2vwiw000buwkcosu2g6lk	cmjmoth65000huw68ccd5lcum	cmjhfan4k000nuwp4vne02gie	t	2024-11-22 16:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1732291200000.jpg
cmjn2vwl1000duwkcyz00jbwh	cmjmoth65000huw68ccd5lcum	cmjhfan4k000nuwp4vne02gie	t	2024-11-25 10:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1732528800000.jpg
cmjn2vwn8000fuwkcp6wltaxk	cmjmoth65000huw68ccd5lcum	cmjhfan4k000nuwp4vne02gie	t	2024-11-27 14:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1732716000000.jpg
cmjn2vwpf000huwkcc1x8qtqz	cmjmoth65000huw68ccd5lcum	cmjhfan4k000nuwp4vne02gie	t	2024-11-29 16:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1732896000000.jpg
cmjn2vwrl000juwkcjwgrl8i7	cmjmoth65000huw68ccd5lcum	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-11 10:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1731319200000.jpg
cmjn2vwts000luwkcv3kgfn4o	cmjmoth65000huw68ccd5lcum	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-13 14:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1731506400000.jpg
cmjn2vwvy000nuwkc0klxzwuu	cmjmoth65000huw68ccd5lcum	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-15 16:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1731686400000.jpg
cmjn2vwy4000puwkcx2uxqtcb	cmjmoth65000huw68ccd5lcum	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-18 10:00:00	\N
cmjn2vx09000ruwkc9fd0folp	cmjmoth65000huw68ccd5lcum	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-20 14:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1732111200000.jpg
cmjn2vx2h000tuwkcmobskqwq	cmjmoth65000huw68ccd5lcum	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-22 16:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1732291200000.jpg
cmjn2vx4o000vuwkctgnk0y6d	cmjmoth65000huw68ccd5lcum	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-25 10:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1732528800000.jpg
cmjn2vx6u000xuwkc9yixcxau	cmjmoth65000huw68ccd5lcum	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-27 14:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1732716000000.jpg
cmjn2vx8z000zuwkckx9ybvn6	cmjmoth65000huw68ccd5lcum	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-29 16:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1732896000000.jpg
cmjn2vxb50011uwkcq0mazepz	cmjmoth65000huw68ccd5lcum	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-11 10:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1731319200000.jpg
cmjn2vxdb0013uwkci0wx4ym8	cmjmoth65000huw68ccd5lcum	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-13 14:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1731506400000.jpg
cmjn2vxfi0015uwkcsd5u1b8u	cmjmoth65000huw68ccd5lcum	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-15 16:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1731686400000.jpg
cmjn2vxho0017uwkcj9apc83g	cmjmoth65000huw68ccd5lcum	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-18 10:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1731924000000.jpg
cmjn2vxly0019uwkc5ey2n8vx	cmjmoth65000huw68ccd5lcum	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-20 14:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1732111200000.jpg
cmjn2vxo5001buwkc0bz4o3iy	cmjmoth65000huw68ccd5lcum	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-22 16:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1732291200000.jpg
cmjn2vxrm001duwkcu9ecrefr	cmjmoth65000huw68ccd5lcum	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-25 10:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1732528800000.jpg
cmjn2vxtw001fuwkccbp6qdaq	cmjmoth65000huw68ccd5lcum	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-27 14:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1732716000000.jpg
cmjn2vxw2001huwkc7pj7mkt4	cmjmoth65000huw68ccd5lcum	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-29 16:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1732896000000.jpg
cmjn2vxym001juwkcivlgivcn	cmjmoth65000huw68ccd5lcum	cmjhfi59p0013uwp4phh6bazf	t	2024-11-11 10:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1731319200000.jpg
cmjn2vy16001luwkcjyrnsko6	cmjmoth65000huw68ccd5lcum	cmjhfi59p0013uwp4phh6bazf	t	2024-11-13 14:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1731506400000.jpg
cmjn2vy3w001nuwkcov2no13e	cmjmoth65000huw68ccd5lcum	cmjhfi59p0013uwp4phh6bazf	t	2024-11-15 16:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1731686400000.jpg
cmjn2vy66001puwkcgdmalph0	cmjmoth65000huw68ccd5lcum	cmjhfi59p0013uwp4phh6bazf	t	2024-11-18 10:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1731924000000.jpg
cmjn2vya5001ruwkccipp9k0u	cmjmoth65000huw68ccd5lcum	cmjhfi59p0013uwp4phh6bazf	t	2024-11-20 14:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1732111200000.jpg
cmjn2vyef001tuwkc85darw4m	cmjmoth65000huw68ccd5lcum	cmjhfi59p0013uwp4phh6bazf	t	2024-11-22 16:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1732291200000.jpg
cmjn2vygq001vuwkckw6lyvb7	cmjmoth65000huw68ccd5lcum	cmjhfi59p0013uwp4phh6bazf	t	2024-11-25 10:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1732528800000.jpg
cmjn2vyk3001xuwkcf0fmew7h	cmjmoth65000huw68ccd5lcum	cmjhfi59p0013uwp4phh6bazf	t	2024-11-27 14:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1732716000000.jpg
cmjn2vym8001zuwkcnng462xq	cmjmoth65000huw68ccd5lcum	cmjhfi59p0013uwp4phh6bazf	t	2024-11-29 16:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1732896000000.jpg
cmjn2vyps0021uwkckhuc7tqt	cmjmoth65000huw68ccd5lcum	cmjhfjbal0017uwp4f068vsfb	t	2024-11-11 10:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1731319200000.jpg
cmjn2vyrx0023uwkcq30b2wd4	cmjmoth65000huw68ccd5lcum	cmjhfjbal0017uwp4f068vsfb	t	2024-11-13 14:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1731506400000.jpg
cmjn2vyvg0025uwkc5gx1xrne	cmjmoth65000huw68ccd5lcum	cmjhfjbal0017uwp4f068vsfb	t	2024-11-15 16:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1731686400000.jpg
cmjn2vyxn0027uwkcw3goiezn	cmjmoth65000huw68ccd5lcum	cmjhfjbal0017uwp4f068vsfb	t	2024-11-18 10:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1731924000000.jpg
cmjn2vz160029uwkcmyzwkh67	cmjmoth65000huw68ccd5lcum	cmjhfjbal0017uwp4f068vsfb	t	2024-11-20 14:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1732111200000.jpg
cmjn2vz3c002buwkcrea6ru4l	cmjmoth65000huw68ccd5lcum	cmjhfjbal0017uwp4f068vsfb	t	2024-11-22 16:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1732291200000.jpg
cmjn2vz5i002duwkc9n1au4dc	cmjmoth65000huw68ccd5lcum	cmjhfjbal0017uwp4f068vsfb	t	2024-11-25 10:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1732528800000.jpg
cmjn2vz7o002fuwkcbz4xenvl	cmjmoth65000huw68ccd5lcum	cmjhfjbal0017uwp4f068vsfb	t	2024-11-27 14:00:00	uploads/attendance/cmjmoth65000huw68ccd5lcum_1732716000000.jpg
cmjn2vz9v002huwkc1u6hctny	cmjmoth65000huw68ccd5lcum	cmjhfjbal0017uwp4f068vsfb	f	2024-11-29 16:00:00	\N
cmjn2vzc1002juwkcl4ka2435	cmjmoti6n000kuw6833e9g8fr	cmjhfan4k000nuwp4vne02gie	t	2024-11-11 10:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1731319200000.jpg
cmjn2vze8002luwkc7yv3xzyd	cmjmoti6n000kuw6833e9g8fr	cmjhfan4k000nuwp4vne02gie	t	2024-11-13 14:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1731506400000.jpg
cmjn2vzgf002nuwkc0fk58pqs	cmjmoti6n000kuw6833e9g8fr	cmjhfan4k000nuwp4vne02gie	t	2024-11-15 16:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1731686400000.jpg
cmjn2vzil002puwkcx8odnlll	cmjmoti6n000kuw6833e9g8fr	cmjhfan4k000nuwp4vne02gie	t	2024-11-18 10:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1731924000000.jpg
cmjn2vzkr002ruwkcx88czjf8	cmjmoti6n000kuw6833e9g8fr	cmjhfan4k000nuwp4vne02gie	t	2024-11-20 14:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1732111200000.jpg
cmjn2vzmz002tuwkc5l5tqahb	cmjmoti6n000kuw6833e9g8fr	cmjhfan4k000nuwp4vne02gie	t	2024-11-22 16:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1732291200000.jpg
cmjn2vzp5002vuwkck22itlzj	cmjmoti6n000kuw6833e9g8fr	cmjhfan4k000nuwp4vne02gie	t	2024-11-25 10:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1732528800000.jpg
cmjn2vzrc002xuwkcsx7cop6h	cmjmoti6n000kuw6833e9g8fr	cmjhfan4k000nuwp4vne02gie	t	2024-11-27 14:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1732716000000.jpg
cmjn2vzti002zuwkco0daj9ms	cmjmoti6n000kuw6833e9g8fr	cmjhfan4k000nuwp4vne02gie	t	2024-11-29 16:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1732896000000.jpg
cmjn2vzvo0031uwkcreoybmmm	cmjmoti6n000kuw6833e9g8fr	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-11 10:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1731319200000.jpg
cmjn2vzxu0033uwkcqzt2cxor	cmjmoti6n000kuw6833e9g8fr	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-13 14:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1731506400000.jpg
cmjn2vzzz0035uwkcipt0umkc	cmjmoti6n000kuw6833e9g8fr	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-15 16:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1731686400000.jpg
cmjn2w0250037uwkctbk20zav	cmjmoti6n000kuw6833e9g8fr	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-18 10:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1731924000000.jpg
cmjn2w04c0039uwkc5vfh8z54	cmjmoti6n000kuw6833e9g8fr	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-20 14:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1732111200000.jpg
cmjn2w06h003buwkc8zyeh82j	cmjmoti6n000kuw6833e9g8fr	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-22 16:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1732291200000.jpg
cmjn2w08p003duwkcm4ro44z0	cmjmoti6n000kuw6833e9g8fr	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-25 10:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1732528800000.jpg
cmjn2w0av003fuwkc24byk2h2	cmjmoti6n000kuw6833e9g8fr	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-27 14:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1732716000000.jpg
cmjn2w0d0003huwkcsih4co5s	cmjmoti6n000kuw6833e9g8fr	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-29 16:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1732896000000.jpg
cmjn2w0f6003juwkctvauuyp8	cmjmoti6n000kuw6833e9g8fr	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-11 10:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1731319200000.jpg
cmjn2w0hc003luwkcn1961q04	cmjmoti6n000kuw6833e9g8fr	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-13 14:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1731506400000.jpg
cmjn2w0ji003nuwkcg8cgicb9	cmjmoti6n000kuw6833e9g8fr	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-15 16:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1731686400000.jpg
cmjn2w0lo003puwkcwnhv074r	cmjmoti6n000kuw6833e9g8fr	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-18 10:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1731924000000.jpg
cmjn2w0nv003ruwkcb5ns4ogk	cmjmoti6n000kuw6833e9g8fr	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-20 14:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1732111200000.jpg
cmjn2w0q1003tuwkcd95v0d8q	cmjmoti6n000kuw6833e9g8fr	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-22 16:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1732291200000.jpg
cmjn2w0s6003vuwkcezl8s9eq	cmjmoti6n000kuw6833e9g8fr	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-25 10:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1732528800000.jpg
cmjn2w0uc003xuwkcnb5bp4mt	cmjmoti6n000kuw6833e9g8fr	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-27 14:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1732716000000.jpg
cmjn2w0wi003zuwkciiz74y5p	cmjmoti6n000kuw6833e9g8fr	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-29 16:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1732896000000.jpg
cmjn2w0yo0041uwkc0xjkf3a1	cmjmoti6n000kuw6833e9g8fr	cmjhfi59p0013uwp4phh6bazf	t	2024-11-11 10:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1731319200000.jpg
cmjn2w10w0043uwkcfusyz81o	cmjmoti6n000kuw6833e9g8fr	cmjhfi59p0013uwp4phh6bazf	t	2024-11-13 14:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1731506400000.jpg
cmjn2w1310045uwkcwp8vx7fo	cmjmoti6n000kuw6833e9g8fr	cmjhfi59p0013uwp4phh6bazf	t	2024-11-15 16:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1731686400000.jpg
cmjn2w1580047uwkcquetyk4g	cmjmoti6n000kuw6833e9g8fr	cmjhfi59p0013uwp4phh6bazf	t	2024-11-18 10:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1731924000000.jpg
cmjn2w17e0049uwkc063feoae	cmjmoti6n000kuw6833e9g8fr	cmjhfi59p0013uwp4phh6bazf	t	2024-11-20 14:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1732111200000.jpg
cmjn2w19l004buwkcr4q52lxp	cmjmoti6n000kuw6833e9g8fr	cmjhfi59p0013uwp4phh6bazf	t	2024-11-22 16:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1732291200000.jpg
cmjn2w1bx004duwkc225g5uwm	cmjmoti6n000kuw6833e9g8fr	cmjhfi59p0013uwp4phh6bazf	t	2024-11-25 10:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1732528800000.jpg
cmjn2w1e3004fuwkcpzbzj4yl	cmjmoti6n000kuw6833e9g8fr	cmjhfi59p0013uwp4phh6bazf	t	2024-11-27 14:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1732716000000.jpg
cmjn2w1g9004huwkcnfb1qfdv	cmjmoti6n000kuw6833e9g8fr	cmjhfi59p0013uwp4phh6bazf	t	2024-11-29 16:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1732896000000.jpg
cmjn2w1ig004juwkcxo8khvun	cmjmoti6n000kuw6833e9g8fr	cmjhfjbal0017uwp4f068vsfb	t	2024-11-11 10:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1731319200000.jpg
cmjn2w1kn004luwkc51ajy9xk	cmjmoti6n000kuw6833e9g8fr	cmjhfjbal0017uwp4f068vsfb	t	2024-11-13 14:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1731506400000.jpg
cmjn2w1mt004nuwkcpaf0v86p	cmjmoti6n000kuw6833e9g8fr	cmjhfjbal0017uwp4f068vsfb	t	2024-11-15 16:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1731686400000.jpg
cmjn2w1p0004puwkco8145akz	cmjmoti6n000kuw6833e9g8fr	cmjhfjbal0017uwp4f068vsfb	t	2024-11-18 10:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1731924000000.jpg
cmjn2w1r7004ruwkcravdsdn3	cmjmoti6n000kuw6833e9g8fr	cmjhfjbal0017uwp4f068vsfb	t	2024-11-20 14:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1732111200000.jpg
cmjn2w1td004tuwkcn1klq9ks	cmjmoti6n000kuw6833e9g8fr	cmjhfjbal0017uwp4f068vsfb	f	2024-11-22 16:00:00	\N
cmjn2w1vj004vuwkcq9qf5q0w	cmjmoti6n000kuw6833e9g8fr	cmjhfjbal0017uwp4f068vsfb	t	2024-11-25 10:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1732528800000.jpg
cmjn2w1xo004xuwkc16qsrz2x	cmjmoti6n000kuw6833e9g8fr	cmjhfjbal0017uwp4f068vsfb	f	2024-11-27 14:00:00	\N
cmjn2w1zu004zuwkcjtcihsru	cmjmoti6n000kuw6833e9g8fr	cmjhfjbal0017uwp4f068vsfb	t	2024-11-29 16:00:00	uploads/attendance/cmjmoti6n000kuw6833e9g8fr_1732896000000.jpg
cmjn2w2200051uwkcw93k6gal	cmjmotirp000nuw68id39qyhh	cmjhfan4k000nuwp4vne02gie	t	2024-11-11 10:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1731319200000.jpg
cmjn2w2460053uwkcscoyqj3m	cmjmotirp000nuw68id39qyhh	cmjhfan4k000nuwp4vne02gie	t	2024-11-13 14:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1731506400000.jpg
cmjn2w26c0055uwkc7qgj4m9l	cmjmotirp000nuw68id39qyhh	cmjhfan4k000nuwp4vne02gie	t	2024-11-15 16:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1731686400000.jpg
cmjn2w28i0057uwkcezsmwhm5	cmjmotirp000nuw68id39qyhh	cmjhfan4k000nuwp4vne02gie	t	2024-11-18 10:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1731924000000.jpg
cmjn2w2ap0059uwkc3g7wzx1v	cmjmotirp000nuw68id39qyhh	cmjhfan4k000nuwp4vne02gie	t	2024-11-20 14:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1732111200000.jpg
cmjn2w2cv005buwkcjb11qh06	cmjmotirp000nuw68id39qyhh	cmjhfan4k000nuwp4vne02gie	t	2024-11-22 16:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1732291200000.jpg
cmjn2w2f1005duwkc3xdyg0l9	cmjmotirp000nuw68id39qyhh	cmjhfan4k000nuwp4vne02gie	t	2024-11-25 10:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1732528800000.jpg
cmjn2w2h6005fuwkcz0y9mnlx	cmjmotirp000nuw68id39qyhh	cmjhfan4k000nuwp4vne02gie	t	2024-11-27 14:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1732716000000.jpg
cmjn2w2jc005huwkc87z6e16b	cmjmotirp000nuw68id39qyhh	cmjhfan4k000nuwp4vne02gie	t	2024-11-29 16:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1732896000000.jpg
cmjn2w2lj005juwkc6ooidh48	cmjmotirp000nuw68id39qyhh	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-11 10:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1731319200000.jpg
cmjn2w2np005luwkc7it02lwx	cmjmotirp000nuw68id39qyhh	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-13 14:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1731506400000.jpg
cmjn2w2pw005nuwkcy7sf3pof	cmjmotirp000nuw68id39qyhh	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-15 16:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1731686400000.jpg
cmjn2w2tn005puwkchbwlom16	cmjmotirp000nuw68id39qyhh	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-18 10:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1731924000000.jpg
cmjn2w2vs005ruwkc9nlh3bsv	cmjmotirp000nuw68id39qyhh	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-20 14:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1732111200000.jpg
cmjn2w2zc005tuwkca8cfiv8s	cmjmotirp000nuw68id39qyhh	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-22 16:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1732291200000.jpg
cmjn2w31h005vuwkc4v7kw14g	cmjmotirp000nuw68id39qyhh	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-25 10:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1732528800000.jpg
cmjn2w33q005xuwkcudu9q74n	cmjmotirp000nuw68id39qyhh	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-27 14:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1732716000000.jpg
cmjn2w36i005zuwkcr8nlkzux	cmjmotirp000nuw68id39qyhh	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-29 16:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1732896000000.jpg
cmjn2w38x0061uwkcwcbpnly6	cmjmotirp000nuw68id39qyhh	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-11 10:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1731319200000.jpg
cmjn2w3bm0063uwkc2u5yti1f	cmjmotirp000nuw68id39qyhh	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-13 14:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1731506400000.jpg
cmjn2w3dw0065uwkcaupbn0gt	cmjmotirp000nuw68id39qyhh	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-15 16:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1731686400000.jpg
cmjn2w3hw0067uwkctir0a0sj	cmjmotirp000nuw68id39qyhh	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-18 10:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1731924000000.jpg
cmjn2w3m50069uwkc1ohifflv	cmjmotirp000nuw68id39qyhh	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-20 14:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1732111200000.jpg
cmjn2w3ob006buwkcd7fje41o	cmjmotirp000nuw68id39qyhh	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-22 16:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1732291200000.jpg
cmjn2w3ru006duwkcc8xww4gl	cmjmotirp000nuw68id39qyhh	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-25 10:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1732528800000.jpg
cmjn2w3u2006fuwkc2zr6jh8i	cmjmotirp000nuw68id39qyhh	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-27 14:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1732716000000.jpg
cmjn2w3xj006huwkcnbn3an2p	cmjmotirp000nuw68id39qyhh	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-29 16:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1732896000000.jpg
cmjn2w3zp006juwkccfyo29uo	cmjmotirp000nuw68id39qyhh	cmjhfi59p0013uwp4phh6bazf	t	2024-11-11 10:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1731319200000.jpg
cmjn2w437006luwkc52fdswh7	cmjmotirp000nuw68id39qyhh	cmjhfi59p0013uwp4phh6bazf	t	2024-11-13 14:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1731506400000.jpg
cmjn2w45d006nuwkcpio64x87	cmjmotirp000nuw68id39qyhh	cmjhfi59p0013uwp4phh6bazf	f	2024-11-15 16:00:00	\N
cmjn2w47j006puwkcksrq2hiu	cmjmotirp000nuw68id39qyhh	cmjhfi59p0013uwp4phh6bazf	t	2024-11-18 10:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1731924000000.jpg
cmjn2w49p006ruwkc2jut4a5o	cmjmotirp000nuw68id39qyhh	cmjhfi59p0013uwp4phh6bazf	t	2024-11-20 14:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1732111200000.jpg
cmjn2w4bw006tuwkckcdz9km6	cmjmotirp000nuw68id39qyhh	cmjhfi59p0013uwp4phh6bazf	t	2024-11-22 16:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1732291200000.jpg
cmjn2w4e1006vuwkczki0sqjh	cmjmotirp000nuw68id39qyhh	cmjhfi59p0013uwp4phh6bazf	t	2024-11-25 10:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1732528800000.jpg
cmjn2w4g8006xuwkclp6izww7	cmjmotirp000nuw68id39qyhh	cmjhfi59p0013uwp4phh6bazf	t	2024-11-27 14:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1732716000000.jpg
cmjn2w4id006zuwkcnkyjvcti	cmjmotirp000nuw68id39qyhh	cmjhfi59p0013uwp4phh6bazf	t	2024-11-29 16:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1732896000000.jpg
cmjn2w4kj0071uwkct3lob2yb	cmjmotirp000nuw68id39qyhh	cmjhfjbal0017uwp4f068vsfb	t	2024-11-11 10:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1731319200000.jpg
cmjn2w4mp0073uwkcke5xrzw2	cmjmotirp000nuw68id39qyhh	cmjhfjbal0017uwp4f068vsfb	t	2024-11-13 14:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1731506400000.jpg
cmjn2w4ow0075uwkcaa2q3tq7	cmjmotirp000nuw68id39qyhh	cmjhfjbal0017uwp4f068vsfb	t	2024-11-15 16:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1731686400000.jpg
cmjn2w4r20077uwkc0jljg9nw	cmjmotirp000nuw68id39qyhh	cmjhfjbal0017uwp4f068vsfb	t	2024-11-18 10:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1731924000000.jpg
cmjn2w4t70079uwkc93pah1cz	cmjmotirp000nuw68id39qyhh	cmjhfjbal0017uwp4f068vsfb	t	2024-11-20 14:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1732111200000.jpg
cmjn2w4ve007buwkclgfrzcem	cmjmotirp000nuw68id39qyhh	cmjhfjbal0017uwp4f068vsfb	t	2024-11-22 16:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1732291200000.jpg
cmjn2w4xk007duwkcnsf87iq2	cmjmotirp000nuw68id39qyhh	cmjhfjbal0017uwp4f068vsfb	t	2024-11-25 10:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1732528800000.jpg
cmjn2w4zv007fuwkcikuzsc9g	cmjmotirp000nuw68id39qyhh	cmjhfjbal0017uwp4f068vsfb	t	2024-11-27 14:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1732716000000.jpg
cmjn2w521007huwkcqaripiw8	cmjmotirp000nuw68id39qyhh	cmjhfjbal0017uwp4f068vsfb	t	2024-11-29 16:00:00	uploads/attendance/cmjmotirp000nuw68id39qyhh_1732896000000.jpg
cmjn2w547007juwkc1n4m0jt3	cmjmotjb8000quw68xhfdwm78	cmjhfan4k000nuwp4vne02gie	t	2024-11-11 10:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1731319200000.jpg
cmjn2w56d007luwkchyrijg78	cmjmotjb8000quw68xhfdwm78	cmjhfan4k000nuwp4vne02gie	t	2024-11-13 14:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1731506400000.jpg
cmjn2wlix00lduwkcfjyky1iq	cmjmotm1v0015uw68sq6vm3kl	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-25 10:00:00	\N
cmjn2w58j007nuwkc3yxv7le8	cmjmotjb8000quw68xhfdwm78	cmjhfan4k000nuwp4vne02gie	t	2024-11-15 16:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1731686400000.jpg
cmjn2w5ap007puwkchav7ev0n	cmjmotjb8000quw68xhfdwm78	cmjhfan4k000nuwp4vne02gie	t	2024-11-18 10:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1731924000000.jpg
cmjn2w5cv007ruwkcy8gpkf1a	cmjmotjb8000quw68xhfdwm78	cmjhfan4k000nuwp4vne02gie	t	2024-11-20 14:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1732111200000.jpg
cmjn2w5f1007tuwkcxbr742mk	cmjmotjb8000quw68xhfdwm78	cmjhfan4k000nuwp4vne02gie	f	2024-11-22 16:00:00	\N
cmjn2w5h7007vuwkc3036mv7u	cmjmotjb8000quw68xhfdwm78	cmjhfan4k000nuwp4vne02gie	t	2024-11-25 10:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1732528800000.jpg
cmjn2w5jd007xuwkc5ca3k2um	cmjmotjb8000quw68xhfdwm78	cmjhfan4k000nuwp4vne02gie	t	2024-11-27 14:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1732716000000.jpg
cmjn2w5li007zuwkcojbvsnm1	cmjmotjb8000quw68xhfdwm78	cmjhfan4k000nuwp4vne02gie	f	2024-11-29 16:00:00	\N
cmjn2w5nn0081uwkcy1dsqamu	cmjmotjb8000quw68xhfdwm78	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-11 10:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1731319200000.jpg
cmjn2w5pt0083uwkc6u3m8ys0	cmjmotjb8000quw68xhfdwm78	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-13 14:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1731506400000.jpg
cmjn2w5rz0085uwkce4n9uw33	cmjmotjb8000quw68xhfdwm78	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-15 16:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1731686400000.jpg
cmjn2w5u50087uwkckkj30470	cmjmotjb8000quw68xhfdwm78	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-18 10:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1731924000000.jpg
cmjn2w5wc0089uwkc4wzb69un	cmjmotjb8000quw68xhfdwm78	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-20 14:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1732111200000.jpg
cmjn2w5yi008buwkcmi0c3viq	cmjmotjb8000quw68xhfdwm78	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-22 16:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1732291200000.jpg
cmjn2w60o008duwkcs82xdli5	cmjmotjb8000quw68xhfdwm78	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-25 10:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1732528800000.jpg
cmjn2w62u008fuwkc0udzidy8	cmjmotjb8000quw68xhfdwm78	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-27 14:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1732716000000.jpg
cmjn2w650008huwkcjhd1gh68	cmjmotjb8000quw68xhfdwm78	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-29 16:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1732896000000.jpg
cmjn2w676008juwkc4qxu7bh2	cmjmotjb8000quw68xhfdwm78	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-11 10:00:00	\N
cmjn2w69b008luwkcmh96ck6e	cmjmotjb8000quw68xhfdwm78	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-13 14:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1731506400000.jpg
cmjn2w6bh008nuwkc4msj5rbb	cmjmotjb8000quw68xhfdwm78	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-15 16:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1731686400000.jpg
cmjn2w6dm008puwkcdjbq0nfk	cmjmotjb8000quw68xhfdwm78	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-18 10:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1731924000000.jpg
cmjn2w6ft008ruwkcnmvqej3m	cmjmotjb8000quw68xhfdwm78	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-20 14:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1732111200000.jpg
cmjn2w6hz008tuwkcfgvx9ajr	cmjmotjb8000quw68xhfdwm78	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-22 16:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1732291200000.jpg
cmjn2w6k6008vuwkc118md2ub	cmjmotjb8000quw68xhfdwm78	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-25 10:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1732528800000.jpg
cmjn2w6md008xuwkczvn4r6gt	cmjmotjb8000quw68xhfdwm78	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-27 14:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1732716000000.jpg
cmjn2w6oj008zuwkclu06i5sm	cmjmotjb8000quw68xhfdwm78	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-29 16:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1732896000000.jpg
cmjn2w6qs0091uwkcnftvyiwz	cmjmotjb8000quw68xhfdwm78	cmjhfi59p0013uwp4phh6bazf	t	2024-11-11 10:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1731319200000.jpg
cmjn2w6sy0093uwkczga000gm	cmjmotjb8000quw68xhfdwm78	cmjhfi59p0013uwp4phh6bazf	t	2024-11-13 14:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1731506400000.jpg
cmjn2w6v40095uwkcqe8iohll	cmjmotjb8000quw68xhfdwm78	cmjhfi59p0013uwp4phh6bazf	t	2024-11-15 16:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1731686400000.jpg
cmjn2w6xa0097uwkcjn407hyo	cmjmotjb8000quw68xhfdwm78	cmjhfi59p0013uwp4phh6bazf	t	2024-11-18 10:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1731924000000.jpg
cmjn2w6zf0099uwkccig5akbq	cmjmotjb8000quw68xhfdwm78	cmjhfi59p0013uwp4phh6bazf	t	2024-11-20 14:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1732111200000.jpg
cmjn2w71m009buwkcor0wxo6a	cmjmotjb8000quw68xhfdwm78	cmjhfi59p0013uwp4phh6bazf	t	2024-11-22 16:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1732291200000.jpg
cmjn2w73s009duwkcej76apgx	cmjmotjb8000quw68xhfdwm78	cmjhfi59p0013uwp4phh6bazf	t	2024-11-25 10:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1732528800000.jpg
cmjn2w75y009fuwkc6959tu56	cmjmotjb8000quw68xhfdwm78	cmjhfi59p0013uwp4phh6bazf	t	2024-11-27 14:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1732716000000.jpg
cmjn2w784009huwkcx0xfjeuw	cmjmotjb8000quw68xhfdwm78	cmjhfi59p0013uwp4phh6bazf	t	2024-11-29 16:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1732896000000.jpg
cmjn2w7ab009juwkcn5tmr51i	cmjmotjb8000quw68xhfdwm78	cmjhfjbal0017uwp4f068vsfb	t	2024-11-11 10:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1731319200000.jpg
cmjn2w7ch009luwkc1udyaw4n	cmjmotjb8000quw68xhfdwm78	cmjhfjbal0017uwp4f068vsfb	t	2024-11-13 14:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1731506400000.jpg
cmjn2w7en009nuwkc1vns56i2	cmjmotjb8000quw68xhfdwm78	cmjhfjbal0017uwp4f068vsfb	f	2024-11-15 16:00:00	\N
cmjn2w7gt009puwkc3l744zwy	cmjmotjb8000quw68xhfdwm78	cmjhfjbal0017uwp4f068vsfb	t	2024-11-18 10:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1731924000000.jpg
cmjn2w7iz009ruwkcupf9m2m4	cmjmotjb8000quw68xhfdwm78	cmjhfjbal0017uwp4f068vsfb	t	2024-11-20 14:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1732111200000.jpg
cmjn2w7l5009tuwkchixssd5y	cmjmotjb8000quw68xhfdwm78	cmjhfjbal0017uwp4f068vsfb	t	2024-11-22 16:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1732291200000.jpg
cmjn2w7nf009vuwkc75c3eaqg	cmjmotjb8000quw68xhfdwm78	cmjhfjbal0017uwp4f068vsfb	t	2024-11-25 10:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1732528800000.jpg
cmjn2w7pl009xuwkcgpajpqvj	cmjmotjb8000quw68xhfdwm78	cmjhfjbal0017uwp4f068vsfb	t	2024-11-27 14:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1732716000000.jpg
cmjn2w7tv009zuwkcmdq1xrru	cmjmotjb8000quw68xhfdwm78	cmjhfjbal0017uwp4f068vsfb	t	2024-11-29 16:00:00	uploads/attendance/cmjmotjb8000quw68xhfdwm78_1732896000000.jpg
cmjn2w7w100a1uwkcopjqbwra	cmjmotjvx000tuw68op9coyz1	cmjhfan4k000nuwp4vne02gie	t	2024-11-11 10:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1731319200000.jpg
cmjn2w86b00a3uwkcskhb4ojl	cmjmotjvx000tuw68op9coyz1	cmjhfan4k000nuwp4vne02gie	t	2024-11-13 14:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1731506400000.jpg
cmjn2w88k00a5uwkcfonjynrl	cmjmotjvx000tuw68op9coyz1	cmjhfan4k000nuwp4vne02gie	t	2024-11-15 16:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1731686400000.jpg
cmjn2wll300lfuwkcd5kj2bpb	cmjmotm1v0015uw68sq6vm3kl	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-27 14:00:00	\N
cmjn2w8aq00a7uwkca2flxn4s	cmjmotjvx000tuw68op9coyz1	cmjhfan4k000nuwp4vne02gie	t	2024-11-18 10:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1731924000000.jpg
cmjn2w8d900a9uwkctaur9c78	cmjmotjvx000tuw68op9coyz1	cmjhfan4k000nuwp4vne02gie	t	2024-11-20 14:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1732111200000.jpg
cmjn2w8fm00abuwkc9a68qlla	cmjmotjvx000tuw68op9coyz1	cmjhfan4k000nuwp4vne02gie	t	2024-11-22 16:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1732291200000.jpg
cmjn2w8hw00aduwkcp8ukcnbe	cmjmotjvx000tuw68op9coyz1	cmjhfan4k000nuwp4vne02gie	f	2024-11-25 10:00:00	\N
cmjn2w8k100afuwkcnvm7pvxu	cmjmotjvx000tuw68op9coyz1	cmjhfan4k000nuwp4vne02gie	t	2024-11-27 14:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1732716000000.jpg
cmjn2w8mu00ahuwkclsdibzls	cmjmotjvx000tuw68op9coyz1	cmjhfan4k000nuwp4vne02gie	t	2024-11-29 16:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1732896000000.jpg
cmjn2w8p100ajuwkcnu94rab0	cmjmotjvx000tuw68op9coyz1	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-11 10:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1731319200000.jpg
cmjn2w8r900aluwkcabiuezf4	cmjmotjvx000tuw68op9coyz1	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-13 14:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1731506400000.jpg
cmjn2w8tg00anuwkcc0t3xb7h	cmjmotjvx000tuw68op9coyz1	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-15 16:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1731686400000.jpg
cmjn2w8vm00apuwkcxhv482xl	cmjmotjvx000tuw68op9coyz1	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-18 10:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1731924000000.jpg
cmjn2w8yf00aruwkci67j5mcl	cmjmotjvx000tuw68op9coyz1	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-20 14:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1732111200000.jpg
cmjn2w90l00atuwkcat5y8lmn	cmjmotjvx000tuw68op9coyz1	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-22 16:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1732291200000.jpg
cmjn2w93x00avuwkcbapkt4wz	cmjmotjvx000tuw68op9coyz1	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-25 10:00:00	\N
cmjn2w96300axuwkccy6hkxy7	cmjmotjvx000tuw68op9coyz1	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-27 14:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1732716000000.jpg
cmjn2w98900azuwkcmfjtiwpx	cmjmotjvx000tuw68op9coyz1	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-29 16:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1732896000000.jpg
cmjn2w9af00b1uwkcshri3j3g	cmjmotjvx000tuw68op9coyz1	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-11 10:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1731319200000.jpg
cmjn2w9dx00b3uwkcl5jjvct8	cmjmotjvx000tuw68op9coyz1	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-13 14:00:00	\N
cmjn2w9ge00b5uwkc9tesjwic	cmjmotjvx000tuw68op9coyz1	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-15 16:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1731686400000.jpg
cmjn2w9ik00b7uwkcpv2b9nkv	cmjmotjvx000tuw68op9coyz1	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-18 10:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1731924000000.jpg
cmjn2w9kz00b9uwkciymap2x0	cmjmotjvx000tuw68op9coyz1	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-20 14:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1732111200000.jpg
cmjn2w9n600bbuwkcspb23kt0	cmjmotjvx000tuw68op9coyz1	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-22 16:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1732291200000.jpg
cmjn2w9pc00bduwkck2rybxzl	cmjmotjvx000tuw68op9coyz1	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-25 10:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1732528800000.jpg
cmjn2w9sv00bfuwkcmd0yzhlw	cmjmotjvx000tuw68op9coyz1	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-27 14:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1732716000000.jpg
cmjn2w9v200bhuwkcwvelod17	cmjmotjvx000tuw68op9coyz1	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-29 16:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1732896000000.jpg
cmjn2w9xh00bjuwkcj4438nbr	cmjmotjvx000tuw68op9coyz1	cmjhfi59p0013uwp4phh6bazf	t	2024-11-11 10:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1731319200000.jpg
cmjn2w9zn00bluwkckcppcyfl	cmjmotjvx000tuw68op9coyz1	cmjhfi59p0013uwp4phh6bazf	t	2024-11-13 14:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1731506400000.jpg
cmjn2wa2100bnuwkcse3n23xt	cmjmotjvx000tuw68op9coyz1	cmjhfi59p0013uwp4phh6bazf	t	2024-11-15 16:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1731686400000.jpg
cmjn2wa4700bpuwkc0rjsi30x	cmjmotjvx000tuw68op9coyz1	cmjhfi59p0013uwp4phh6bazf	f	2024-11-18 10:00:00	\N
cmjn2wa6d00bruwkczyry9ahx	cmjmotjvx000tuw68op9coyz1	cmjhfi59p0013uwp4phh6bazf	t	2024-11-20 14:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1732111200000.jpg
cmjn2wa8j00btuwkcr87nknzm	cmjmotjvx000tuw68op9coyz1	cmjhfi59p0013uwp4phh6bazf	f	2024-11-22 16:00:00	\N
cmjn2wac100bvuwkctig494y8	cmjmotjvx000tuw68op9coyz1	cmjhfi59p0013uwp4phh6bazf	t	2024-11-25 10:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1732528800000.jpg
cmjn2waej00bxuwkcghr4qhhk	cmjmotjvx000tuw68op9coyz1	cmjhfi59p0013uwp4phh6bazf	t	2024-11-27 14:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1732716000000.jpg
cmjn2wagp00bzuwkcpls6w9aq	cmjmotjvx000tuw68op9coyz1	cmjhfi59p0013uwp4phh6bazf	t	2024-11-29 16:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1732896000000.jpg
cmjn2waj300c1uwkc27s9pg2v	cmjmotjvx000tuw68op9coyz1	cmjhfjbal0017uwp4f068vsfb	f	2024-11-11 10:00:00	\N
cmjn2wal900c3uwkcndn0uuwa	cmjmotjvx000tuw68op9coyz1	cmjhfjbal0017uwp4f068vsfb	f	2024-11-13 14:00:00	\N
cmjn2wang00c5uwkcq1i99gfr	cmjmotjvx000tuw68op9coyz1	cmjhfjbal0017uwp4f068vsfb	t	2024-11-15 16:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1731686400000.jpg
cmjn2wapm00c7uwkc15tscoe7	cmjmotjvx000tuw68op9coyz1	cmjhfjbal0017uwp4f068vsfb	t	2024-11-18 10:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1731924000000.jpg
cmjn2wat500c9uwkc0jd9agv3	cmjmotjvx000tuw68op9coyz1	cmjhfjbal0017uwp4f068vsfb	f	2024-11-20 14:00:00	\N
cmjn2wavl00cbuwkckb4pf3jf	cmjmotjvx000tuw68op9coyz1	cmjhfjbal0017uwp4f068vsfb	t	2024-11-22 16:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1732291200000.jpg
cmjn2waxr00cduwkcim4yv04b	cmjmotjvx000tuw68op9coyz1	cmjhfjbal0017uwp4f068vsfb	t	2024-11-25 10:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1732528800000.jpg
cmjn2wb0600cfuwkc72hyr3hk	cmjmotjvx000tuw68op9coyz1	cmjhfjbal0017uwp4f068vsfb	t	2024-11-27 14:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1732716000000.jpg
cmjn2wb2d00chuwkc6reuv7es	cmjmotjvx000tuw68op9coyz1	cmjhfjbal0017uwp4f068vsfb	t	2024-11-29 16:00:00	uploads/attendance/cmjmotjvx000tuw68op9coyz1_1732896000000.jpg
cmjn2wb4k00cjuwkchnbn36j8	cmjmotkfp000wuw68qz9bsq2s	cmjhfan4k000nuwp4vne02gie	t	2024-11-11 10:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1731319200000.jpg
cmjn2wb8200cluwkcnqe05rj9	cmjmotkfp000wuw68qz9bsq2s	cmjhfan4k000nuwp4vne02gie	f	2024-11-13 14:00:00	\N
cmjn2wba800cnuwkc7gv2ukrd	cmjmotkfp000wuw68qz9bsq2s	cmjhfan4k000nuwp4vne02gie	f	2024-11-15 16:00:00	\N
cmjn2wbco00cpuwkcqg7rvrtu	cmjmotkfp000wuw68qz9bsq2s	cmjhfan4k000nuwp4vne02gie	t	2024-11-18 10:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1731924000000.jpg
cmjn2wbeu00cruwkc9dfumm09	cmjmotkfp000wuw68qz9bsq2s	cmjhfan4k000nuwp4vne02gie	t	2024-11-20 14:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1732111200000.jpg
cmjn2wbh000ctuwkcnhbnvgd2	cmjmotkfp000wuw68qz9bsq2s	cmjhfan4k000nuwp4vne02gie	t	2024-11-22 16:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1732291200000.jpg
cmjn2x1b000yvuwkc2qca5vlr	cmjmozt8s001kuw682c5ohejr	cmjhfjbal0017uwp4f068vsfb	f	2024-11-25 10:00:00	\N
cmjn2wbj600cvuwkcdqj9rwku	cmjmotkfp000wuw68qz9bsq2s	cmjhfan4k000nuwp4vne02gie	t	2024-11-25 10:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1732528800000.jpg
cmjn2wblb00cxuwkcanmyki7b	cmjmotkfp000wuw68qz9bsq2s	cmjhfan4k000nuwp4vne02gie	t	2024-11-27 14:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1732716000000.jpg
cmjn2wbnh00czuwkcnlxddals	cmjmotkfp000wuw68qz9bsq2s	cmjhfan4k000nuwp4vne02gie	f	2024-11-29 16:00:00	\N
cmjn2wbpn00d1uwkcztxdu62x	cmjmotkfp000wuw68qz9bsq2s	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-11 10:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1731319200000.jpg
cmjn2wbru00d3uwkc3pmsjn2q	cmjmotkfp000wuw68qz9bsq2s	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-13 14:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1731506400000.jpg
cmjn2wbu000d5uwkc56a4kz6c	cmjmotkfp000wuw68qz9bsq2s	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-15 16:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1731686400000.jpg
cmjn2wbw600d7uwkcr0kmwurc	cmjmotkfp000wuw68qz9bsq2s	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-18 10:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1731924000000.jpg
cmjn2wbyc00d9uwkcya1owniz	cmjmotkfp000wuw68qz9bsq2s	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-20 14:00:00	\N
cmjn2wc0h00dbuwkcchhm3tr7	cmjmotkfp000wuw68qz9bsq2s	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-22 16:00:00	\N
cmjn2wc2n00dduwkcv9wd9jjq	cmjmotkfp000wuw68qz9bsq2s	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-25 10:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1732528800000.jpg
cmjn2wc4t00dfuwkcrek6aq6t	cmjmotkfp000wuw68qz9bsq2s	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-27 14:00:00	\N
cmjn2wc7k00dhuwkcpdfomdya	cmjmotkfp000wuw68qz9bsq2s	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-29 16:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1732896000000.jpg
cmjn2wc9p00djuwkc8ovmlpym	cmjmotkfp000wuw68qz9bsq2s	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-11 10:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1731319200000.jpg
cmjn2wcbv00dluwkc9ru39cax	cmjmotkfp000wuw68qz9bsq2s	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-13 14:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1731506400000.jpg
cmjn2wce200dnuwkchpxc0fbg	cmjmotkfp000wuw68qz9bsq2s	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-15 16:00:00	\N
cmjn2wcg800dpuwkcxxwzjc1v	cmjmotkfp000wuw68qz9bsq2s	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-18 10:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1731924000000.jpg
cmjn2wcie00druwkcno7kub8d	cmjmotkfp000wuw68qz9bsq2s	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-20 14:00:00	\N
cmjn2wckk00dtuwkczuu14axu	cmjmotkfp000wuw68qz9bsq2s	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-22 16:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1732291200000.jpg
cmjn2wcmr00dvuwkcc9oea2c2	cmjmotkfp000wuw68qz9bsq2s	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-25 10:00:00	\N
cmjn2wcp100dxuwkcr1on8wn9	cmjmotkfp000wuw68qz9bsq2s	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-27 14:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1732716000000.jpg
cmjn2wcr600dzuwkccu157f2j	cmjmotkfp000wuw68qz9bsq2s	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-29 16:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1732896000000.jpg
cmjn2wctc00e1uwkcjovkzn49	cmjmotkfp000wuw68qz9bsq2s	cmjhfi59p0013uwp4phh6bazf	t	2024-11-11 10:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1731319200000.jpg
cmjn2wcvi00e3uwkc5l9f6vlx	cmjmotkfp000wuw68qz9bsq2s	cmjhfi59p0013uwp4phh6bazf	t	2024-11-13 14:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1731506400000.jpg
cmjn2wcxo00e5uwkc7blia8i5	cmjmotkfp000wuw68qz9bsq2s	cmjhfi59p0013uwp4phh6bazf	t	2024-11-15 16:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1731686400000.jpg
cmjn2wczv00e7uwkcg6egi7o4	cmjmotkfp000wuw68qz9bsq2s	cmjhfi59p0013uwp4phh6bazf	t	2024-11-18 10:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1731924000000.jpg
cmjn2wd2000e9uwkcu3k95lcn	cmjmotkfp000wuw68qz9bsq2s	cmjhfi59p0013uwp4phh6bazf	t	2024-11-20 14:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1732111200000.jpg
cmjn2wd4j00ebuwkci8iip9m4	cmjmotkfp000wuw68qz9bsq2s	cmjhfi59p0013uwp4phh6bazf	t	2024-11-22 16:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1732291200000.jpg
cmjn2wd7200eduwkckptsbo2c	cmjmotkfp000wuw68qz9bsq2s	cmjhfi59p0013uwp4phh6bazf	f	2024-11-25 10:00:00	\N
cmjn2wd9w00efuwkcucdgmlih	cmjmotkfp000wuw68qz9bsq2s	cmjhfi59p0013uwp4phh6bazf	t	2024-11-27 14:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1732716000000.jpg
cmjn2wdc600ehuwkcht2m7byo	cmjmotkfp000wuw68qz9bsq2s	cmjhfi59p0013uwp4phh6bazf	f	2024-11-29 16:00:00	\N
cmjn2wdec00ejuwkcaiuwc1xp	cmjmotkfp000wuw68qz9bsq2s	cmjhfjbal0017uwp4f068vsfb	t	2024-11-11 10:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1731319200000.jpg
cmjn2wdgz00eluwkcegcodesq	cmjmotkfp000wuw68qz9bsq2s	cmjhfjbal0017uwp4f068vsfb	t	2024-11-13 14:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1731506400000.jpg
cmjn2wdjh00enuwkcmwgw9rwu	cmjmotkfp000wuw68qz9bsq2s	cmjhfjbal0017uwp4f068vsfb	t	2024-11-15 16:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1731686400000.jpg
cmjn2wdlm00epuwkciow99v7s	cmjmotkfp000wuw68qz9bsq2s	cmjhfjbal0017uwp4f068vsfb	t	2024-11-18 10:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1731924000000.jpg
cmjn2wdq900eruwkcv840ywkg	cmjmotkfp000wuw68qz9bsq2s	cmjhfjbal0017uwp4f068vsfb	t	2024-11-20 14:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1732111200000.jpg
cmjn2wdsf00etuwkcz8puzi77	cmjmotkfp000wuw68qz9bsq2s	cmjhfjbal0017uwp4f068vsfb	t	2024-11-22 16:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1732291200000.jpg
cmjn2wdvy00evuwkcfu44t8at	cmjmotkfp000wuw68qz9bsq2s	cmjhfjbal0017uwp4f068vsfb	t	2024-11-25 10:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1732528800000.jpg
cmjn2wdy300exuwkc7gd064ry	cmjmotkfp000wuw68qz9bsq2s	cmjhfjbal0017uwp4f068vsfb	t	2024-11-27 14:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1732716000000.jpg
cmjn2we1m00ezuwkcxb3hx7bj	cmjmotkfp000wuw68qz9bsq2s	cmjhfjbal0017uwp4f068vsfb	t	2024-11-29 16:00:00	uploads/attendance/cmjmotkfp000wuw68qz9bsq2s_1732896000000.jpg
cmjn2we3s00f1uwkcwmeo8412	cmjmotkz8000zuw68ill1bls5	cmjhfan4k000nuwp4vne02gie	f	2024-11-11 10:00:00	\N
cmjn2we7c00f3uwkcwbs66nh0	cmjmotkz8000zuw68ill1bls5	cmjhfan4k000nuwp4vne02gie	t	2024-11-13 14:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1731506400000.jpg
cmjn2we9h00f5uwkcwlng46p2	cmjmotkz8000zuw68ill1bls5	cmjhfan4k000nuwp4vne02gie	t	2024-11-15 16:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1731686400000.jpg
cmjn2wed000f7uwkc6o5bmf2u	cmjmotkz8000zuw68ill1bls5	cmjhfan4k000nuwp4vne02gie	t	2024-11-18 10:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1731924000000.jpg
cmjn2wef500f9uwkc0dii6ey8	cmjmotkz8000zuw68ill1bls5	cmjhfan4k000nuwp4vne02gie	t	2024-11-20 14:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1732111200000.jpg
cmjn2weip00fbuwkcui3ckgw1	cmjmotkz8000zuw68ill1bls5	cmjhfan4k000nuwp4vne02gie	t	2024-11-22 16:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1732291200000.jpg
cmjn2wekw00fduwkckr4odfuk	cmjmotkz8000zuw68ill1bls5	cmjhfan4k000nuwp4vne02gie	f	2024-11-25 10:00:00	\N
cmjn2weod00ffuwkcrojxdlhf	cmjmotkz8000zuw68ill1bls5	cmjhfan4k000nuwp4vne02gie	t	2024-11-27 14:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1732716000000.jpg
cmjn2weqk00fhuwkcga51n5cb	cmjmotkz8000zuw68ill1bls5	cmjhfan4k000nuwp4vne02gie	f	2024-11-29 16:00:00	\N
cmjn2weu200fjuwkcjmcbrisb	cmjmotkz8000zuw68ill1bls5	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-11 10:00:00	\N
cmjn2wew900fluwkcx9j334yi	cmjmotkz8000zuw68ill1bls5	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-13 14:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1731506400000.jpg
cmjn2wezr00fnuwkcx0bxwj39	cmjmotkz8000zuw68ill1bls5	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-15 16:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1731686400000.jpg
cmjn2wf1x00fpuwkciz7sqbea	cmjmotkz8000zuw68ill1bls5	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-18 10:00:00	\N
cmjn2wf5g00fruwkcydugtiu4	cmjmotkz8000zuw68ill1bls5	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-20 14:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1732111200000.jpg
cmjn2wf7m00ftuwkcovgtor2s	cmjmotkz8000zuw68ill1bls5	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-22 16:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1732291200000.jpg
cmjn2wfb500fvuwkcpvqp7n5q	cmjmotkz8000zuw68ill1bls5	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-25 10:00:00	\N
cmjn2wfdb00fxuwkchgh7m561	cmjmotkz8000zuw68ill1bls5	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-27 14:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1732716000000.jpg
cmjn2wfgu00fzuwkcbx2gz541	cmjmotkz8000zuw68ill1bls5	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-29 16:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1732896000000.jpg
cmjn2wfj100g1uwkc1y9s4wxv	cmjmotkz8000zuw68ill1bls5	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-11 10:00:00	\N
cmjn2wfl600g3uwkc888ffvah	cmjmotkz8000zuw68ill1bls5	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-13 14:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1731506400000.jpg
cmjn2wfnb00g5uwkce6vl7q8e	cmjmotkz8000zuw68ill1bls5	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-15 16:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1731686400000.jpg
cmjn2wfpg00g7uwkck5vwhh9d	cmjmotkz8000zuw68ill1bls5	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-18 10:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1731924000000.jpg
cmjn2wfrm00g9uwkcjje0jpp8	cmjmotkz8000zuw68ill1bls5	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-20 14:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1732111200000.jpg
cmjn2wfts00gbuwkchpylyuj6	cmjmotkz8000zuw68ill1bls5	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-22 16:00:00	\N
cmjn2wfvy00gduwkc72buhlpu	cmjmotkz8000zuw68ill1bls5	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-25 10:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1732528800000.jpg
cmjn2wfy300gfuwkcm58cj04n	cmjmotkz8000zuw68ill1bls5	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-27 14:00:00	\N
cmjn2wg0a00ghuwkcpu7mvxqb	cmjmotkz8000zuw68ill1bls5	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-29 16:00:00	\N
cmjn2wg2g00gjuwkcxbcwujav	cmjmotkz8000zuw68ill1bls5	cmjhfi59p0013uwp4phh6bazf	t	2024-11-11 10:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1731319200000.jpg
cmjn2wg4m00gluwkcaq3kziu4	cmjmotkz8000zuw68ill1bls5	cmjhfi59p0013uwp4phh6bazf	t	2024-11-13 14:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1731506400000.jpg
cmjn2wg6u00gnuwkcc97ehvo6	cmjmotkz8000zuw68ill1bls5	cmjhfi59p0013uwp4phh6bazf	t	2024-11-15 16:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1731686400000.jpg
cmjn2wg9300gpuwkcy3d7et6q	cmjmotkz8000zuw68ill1bls5	cmjhfi59p0013uwp4phh6bazf	t	2024-11-18 10:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1731924000000.jpg
cmjn2wgba00gruwkclqzeocz5	cmjmotkz8000zuw68ill1bls5	cmjhfi59p0013uwp4phh6bazf	t	2024-11-20 14:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1732111200000.jpg
cmjn2wgdg00gtuwkctkhvpkaj	cmjmotkz8000zuw68ill1bls5	cmjhfi59p0013uwp4phh6bazf	t	2024-11-22 16:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1732291200000.jpg
cmjn2wgfm00gvuwkcu8oq7cuy	cmjmotkz8000zuw68ill1bls5	cmjhfi59p0013uwp4phh6bazf	t	2024-11-25 10:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1732528800000.jpg
cmjn2wghs00gxuwkcn5liqv4d	cmjmotkz8000zuw68ill1bls5	cmjhfi59p0013uwp4phh6bazf	t	2024-11-27 14:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1732716000000.jpg
cmjn2wgjz00gzuwkcsn0cnkd6	cmjmotkz8000zuw68ill1bls5	cmjhfi59p0013uwp4phh6bazf	t	2024-11-29 16:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1732896000000.jpg
cmjn2wgm600h1uwkcza342rk0	cmjmotkz8000zuw68ill1bls5	cmjhfjbal0017uwp4f068vsfb	t	2024-11-11 10:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1731319200000.jpg
cmjn2wgoc00h3uwkccjusdqmq	cmjmotkz8000zuw68ill1bls5	cmjhfjbal0017uwp4f068vsfb	t	2024-11-13 14:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1731506400000.jpg
cmjn2wgqi00h5uwkc6lklo739	cmjmotkz8000zuw68ill1bls5	cmjhfjbal0017uwp4f068vsfb	t	2024-11-15 16:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1731686400000.jpg
cmjn2wgsn00h7uwkcafmigl6d	cmjmotkz8000zuw68ill1bls5	cmjhfjbal0017uwp4f068vsfb	t	2024-11-18 10:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1731924000000.jpg
cmjn2wgut00h9uwkcdef4wb7o	cmjmotkz8000zuw68ill1bls5	cmjhfjbal0017uwp4f068vsfb	f	2024-11-20 14:00:00	\N
cmjn2wgwz00hbuwkcc4v2ceay	cmjmotkz8000zuw68ill1bls5	cmjhfjbal0017uwp4f068vsfb	t	2024-11-22 16:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1732291200000.jpg
cmjn2wgz500hduwkcv97l025c	cmjmotkz8000zuw68ill1bls5	cmjhfjbal0017uwp4f068vsfb	t	2024-11-25 10:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1732528800000.jpg
cmjn2wh1c00hfuwkcy0rueq9p	cmjmotkz8000zuw68ill1bls5	cmjhfjbal0017uwp4f068vsfb	t	2024-11-27 14:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1732716000000.jpg
cmjn2wh3j00hhuwkcvd9j667i	cmjmotkz8000zuw68ill1bls5	cmjhfjbal0017uwp4f068vsfb	t	2024-11-29 16:00:00	uploads/attendance/cmjmotkz8000zuw68ill1bls5_1732896000000.jpg
cmjn2wh5o00hjuwkchd19dn2w	cmjmotlii0012uw6852e1cgvs	cmjhfan4k000nuwp4vne02gie	f	2024-11-11 10:00:00	\N
cmjn2wh7u00hluwkcw18a88xj	cmjmotlii0012uw6852e1cgvs	cmjhfan4k000nuwp4vne02gie	t	2024-11-13 14:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1731506400000.jpg
cmjn2wha100hnuwkcx3b41xwc	cmjmotlii0012uw6852e1cgvs	cmjhfan4k000nuwp4vne02gie	t	2024-11-15 16:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1731686400000.jpg
cmjn2whc600hpuwkc1jh71shz	cmjmotlii0012uw6852e1cgvs	cmjhfan4k000nuwp4vne02gie	f	2024-11-18 10:00:00	\N
cmjn2whed00hruwkckelx9f56	cmjmotlii0012uw6852e1cgvs	cmjhfan4k000nuwp4vne02gie	t	2024-11-20 14:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1732111200000.jpg
cmjn2whgj00htuwkcr8ojwman	cmjmotlii0012uw6852e1cgvs	cmjhfan4k000nuwp4vne02gie	f	2024-11-22 16:00:00	\N
cmjn2whip00hvuwkcioh18lj4	cmjmotlii0012uw6852e1cgvs	cmjhfan4k000nuwp4vne02gie	f	2024-11-25 10:00:00	\N
cmjn2whl300hxuwkc0xhm4bp5	cmjmotlii0012uw6852e1cgvs	cmjhfan4k000nuwp4vne02gie	f	2024-11-27 14:00:00	\N
cmjn2whn900hzuwkc7kc81tct	cmjmotlii0012uw6852e1cgvs	cmjhfan4k000nuwp4vne02gie	t	2024-11-29 16:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1732896000000.jpg
cmjn2whpg00i1uwkctq3jg63q	cmjmotlii0012uw6852e1cgvs	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-11 10:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1731319200000.jpg
cmjn2whrl00i3uwkc79nvpb9a	cmjmotlii0012uw6852e1cgvs	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-13 14:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1731506400000.jpg
cmjn2whtr00i5uwkchxqot5gq	cmjmotlii0012uw6852e1cgvs	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-15 16:00:00	\N
cmjn2whvw00i7uwkcxr01gjb0	cmjmotlii0012uw6852e1cgvs	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-18 10:00:00	\N
cmjn2why200i9uwkci8dpngc5	cmjmotlii0012uw6852e1cgvs	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-20 14:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1732111200000.jpg
cmjn2wi0900ibuwkct5qqt2go	cmjmotlii0012uw6852e1cgvs	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-22 16:00:00	\N
cmjn2wi2f00iduwkc7jdtr64r	cmjmotlii0012uw6852e1cgvs	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-25 10:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1732528800000.jpg
cmjn2wi4l00ifuwkcwsiq66gf	cmjmotlii0012uw6852e1cgvs	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-27 14:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1732716000000.jpg
cmjn2wi6q00ihuwkc3prf712s	cmjmotlii0012uw6852e1cgvs	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-29 16:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1732896000000.jpg
cmjn2wi8v00ijuwkcnpnoqlhn	cmjmotlii0012uw6852e1cgvs	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-11 10:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1731319200000.jpg
cmjn2wicn00iluwkcjqvcxphw	cmjmotlii0012uw6852e1cgvs	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-13 14:00:00	\N
cmjn2wigv00inuwkcv7xtdodh	cmjmotlii0012uw6852e1cgvs	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-15 16:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1731686400000.jpg
cmjn2wij100ipuwkcaqowo93u	cmjmotlii0012uw6852e1cgvs	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-18 10:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1731924000000.jpg
cmjn2wilb00iruwkcfkt4doo2	cmjmotlii0012uw6852e1cgvs	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-20 14:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1732111200000.jpg
cmjn2wio200ituwkcco1lbhmn	cmjmotlii0012uw6852e1cgvs	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-22 16:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1732291200000.jpg
cmjn2wiqk00ivuwkcxofsc2i2	cmjmotlii0012uw6852e1cgvs	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-25 10:00:00	\N
cmjn2wit500ixuwkca2x96kxc	cmjmotlii0012uw6852e1cgvs	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-27 14:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1732716000000.jpg
cmjn2wivf00izuwkcoyzqh298	cmjmotlii0012uw6852e1cgvs	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-29 16:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1732896000000.jpg
cmjn2wixm00j1uwkcamo1lxmo	cmjmotlii0012uw6852e1cgvs	cmjhfi59p0013uwp4phh6bazf	t	2024-11-11 10:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1731319200000.jpg
cmjn2wizq00j3uwkczvn69fx7	cmjmotlii0012uw6852e1cgvs	cmjhfi59p0013uwp4phh6bazf	t	2024-11-13 14:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1731506400000.jpg
cmjn2wj1w00j5uwkcjdj9xoy8	cmjmotlii0012uw6852e1cgvs	cmjhfi59p0013uwp4phh6bazf	t	2024-11-15 16:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1731686400000.jpg
cmjn2wj4200j7uwkci7qbae3h	cmjmotlii0012uw6852e1cgvs	cmjhfi59p0013uwp4phh6bazf	f	2024-11-18 10:00:00	\N
cmjn2wj6800j9uwkc5v1go4zl	cmjmotlii0012uw6852e1cgvs	cmjhfi59p0013uwp4phh6bazf	f	2024-11-20 14:00:00	\N
cmjn2wj8f00jbuwkc5vk8va9d	cmjmotlii0012uw6852e1cgvs	cmjhfi59p0013uwp4phh6bazf	t	2024-11-22 16:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1732291200000.jpg
cmjn2wjal00jduwkcfrx75x04	cmjmotlii0012uw6852e1cgvs	cmjhfi59p0013uwp4phh6bazf	t	2024-11-25 10:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1732528800000.jpg
cmjn2wjcs00jfuwkc2rp0r6v8	cmjmotlii0012uw6852e1cgvs	cmjhfi59p0013uwp4phh6bazf	t	2024-11-27 14:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1732716000000.jpg
cmjn2wjh400jhuwkc7wez4zfr	cmjmotlii0012uw6852e1cgvs	cmjhfi59p0013uwp4phh6bazf	t	2024-11-29 16:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1732896000000.jpg
cmjn2wjja00jjuwkc5k6h88dj	cmjmotlii0012uw6852e1cgvs	cmjhfjbal0017uwp4f068vsfb	t	2024-11-11 10:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1731319200000.jpg
cmjn2wjlg00jluwkchdojaby2	cmjmotlii0012uw6852e1cgvs	cmjhfjbal0017uwp4f068vsfb	t	2024-11-13 14:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1731506400000.jpg
cmjn2wjnn00jnuwkcyal3hvsn	cmjmotlii0012uw6852e1cgvs	cmjhfjbal0017uwp4f068vsfb	t	2024-11-15 16:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1731686400000.jpg
cmjn2wjpx00jpuwkcod4i73h7	cmjmotlii0012uw6852e1cgvs	cmjhfjbal0017uwp4f068vsfb	t	2024-11-18 10:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1731924000000.jpg
cmjn2wjs200jruwkcpcbeu928	cmjmotlii0012uw6852e1cgvs	cmjhfjbal0017uwp4f068vsfb	f	2024-11-20 14:00:00	\N
cmjn2wju800jtuwkcttnyoj6f	cmjmotlii0012uw6852e1cgvs	cmjhfjbal0017uwp4f068vsfb	t	2024-11-22 16:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1732291200000.jpg
cmjn2wjwe00jvuwkc8gcvs9pq	cmjmotlii0012uw6852e1cgvs	cmjhfjbal0017uwp4f068vsfb	t	2024-11-25 10:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1732528800000.jpg
cmjn2wjyk00jxuwkcx61hq3pm	cmjmotlii0012uw6852e1cgvs	cmjhfjbal0017uwp4f068vsfb	t	2024-11-27 14:00:00	uploads/attendance/cmjmotlii0012uw6852e1cgvs_1732716000000.jpg
cmjn2wk0p00jzuwkcwrmo4lo5	cmjmotlii0012uw6852e1cgvs	cmjhfjbal0017uwp4f068vsfb	f	2024-11-29 16:00:00	\N
cmjn2wk2w00k1uwkcserg7f5g	cmjmotm1v0015uw68sq6vm3kl	cmjhfan4k000nuwp4vne02gie	t	2024-11-11 10:00:00	uploads/attendance/cmjmotm1v0015uw68sq6vm3kl_1731319200000.jpg
cmjn2wk5300k3uwkcup7qszyi	cmjmotm1v0015uw68sq6vm3kl	cmjhfan4k000nuwp4vne02gie	f	2024-11-13 14:00:00	\N
cmjn2wk7900k5uwkcd8hjogq6	cmjmotm1v0015uw68sq6vm3kl	cmjhfan4k000nuwp4vne02gie	t	2024-11-15 16:00:00	uploads/attendance/cmjmotm1v0015uw68sq6vm3kl_1731686400000.jpg
cmjn2wk9f00k7uwkc9sc5mgnd	cmjmotm1v0015uw68sq6vm3kl	cmjhfan4k000nuwp4vne02gie	t	2024-11-18 10:00:00	uploads/attendance/cmjmotm1v0015uw68sq6vm3kl_1731924000000.jpg
cmjn2wkbl00k9uwkc1wuobf4a	cmjmotm1v0015uw68sq6vm3kl	cmjhfan4k000nuwp4vne02gie	f	2024-11-20 14:00:00	\N
cmjn2wkdr00kbuwkcx6qwx8rc	cmjmotm1v0015uw68sq6vm3kl	cmjhfan4k000nuwp4vne02gie	t	2024-11-22 16:00:00	uploads/attendance/cmjmotm1v0015uw68sq6vm3kl_1732291200000.jpg
cmjn2wkfw00kduwkcrjpk273t	cmjmotm1v0015uw68sq6vm3kl	cmjhfan4k000nuwp4vne02gie	t	2024-11-25 10:00:00	uploads/attendance/cmjmotm1v0015uw68sq6vm3kl_1732528800000.jpg
cmjn2wki100kfuwkc3a8eo7lx	cmjmotm1v0015uw68sq6vm3kl	cmjhfan4k000nuwp4vne02gie	f	2024-11-27 14:00:00	\N
cmjn2wkke00khuwkcbgwsaq0i	cmjmotm1v0015uw68sq6vm3kl	cmjhfan4k000nuwp4vne02gie	t	2024-11-29 16:00:00	uploads/attendance/cmjmotm1v0015uw68sq6vm3kl_1732896000000.jpg
cmjn2wkmk00kjuwkcfqde26t0	cmjmotm1v0015uw68sq6vm3kl	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-11 10:00:00	uploads/attendance/cmjmotm1v0015uw68sq6vm3kl_1731319200000.jpg
cmjn2wkoq00kluwkcpbwxespe	cmjmotm1v0015uw68sq6vm3kl	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-13 14:00:00	\N
cmjn2wkqw00knuwkcahu6v4nx	cmjmotm1v0015uw68sq6vm3kl	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-15 16:00:00	\N
cmjn2wkt200kpuwkchzcjqw76	cmjmotm1v0015uw68sq6vm3kl	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-18 10:00:00	\N
cmjn2wkv700kruwkcort4fx5v	cmjmotm1v0015uw68sq6vm3kl	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-20 14:00:00	\N
cmjn2wkxc00ktuwkcherc88fe	cmjmotm1v0015uw68sq6vm3kl	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-22 16:00:00	uploads/attendance/cmjmotm1v0015uw68sq6vm3kl_1732291200000.jpg
cmjn2wkzi00kvuwkcozx27pr7	cmjmotm1v0015uw68sq6vm3kl	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-25 10:00:00	\N
cmjn2wl1o00kxuwkcbek2fjlw	cmjmotm1v0015uw68sq6vm3kl	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-27 14:00:00	\N
cmjn2wl3u00kzuwkczyqb6dmg	cmjmotm1v0015uw68sq6vm3kl	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-29 16:00:00	\N
cmjn2wl5z00l1uwkc68kphff5	cmjmotm1v0015uw68sq6vm3kl	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-11 10:00:00	\N
cmjn2wl8500l3uwkcg8lra732	cmjmotm1v0015uw68sq6vm3kl	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-13 14:00:00	\N
cmjn2wlab00l5uwkc0j6d8rxc	cmjmotm1v0015uw68sq6vm3kl	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-15 16:00:00	\N
cmjn2wlch00l7uwkcmcmcwsam	cmjmotm1v0015uw68sq6vm3kl	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-18 10:00:00	\N
cmjn2wlel00l9uwkcfv7bn9gp	cmjmotm1v0015uw68sq6vm3kl	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-20 14:00:00	\N
cmjn2wlgr00lbuwkcocnxsmqs	cmjmotm1v0015uw68sq6vm3kl	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-22 16:00:00	\N
cmjn2wln900lhuwkcax6tz6ex	cmjmotm1v0015uw68sq6vm3kl	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-29 16:00:00	uploads/attendance/cmjmotm1v0015uw68sq6vm3kl_1732896000000.jpg
cmjn2wlpf00ljuwkcbnc5jtbh	cmjmotm1v0015uw68sq6vm3kl	cmjhfi59p0013uwp4phh6bazf	t	2024-11-11 10:00:00	uploads/attendance/cmjmotm1v0015uw68sq6vm3kl_1731319200000.jpg
cmjn2wlrl00lluwkct07uksfi	cmjmotm1v0015uw68sq6vm3kl	cmjhfi59p0013uwp4phh6bazf	f	2024-11-13 14:00:00	\N
cmjn2wltr00lnuwkcjyhkn6ex	cmjmotm1v0015uw68sq6vm3kl	cmjhfi59p0013uwp4phh6bazf	t	2024-11-15 16:00:00	uploads/attendance/cmjmotm1v0015uw68sq6vm3kl_1731686400000.jpg
cmjn2wlvx00lpuwkc77rizahc	cmjmotm1v0015uw68sq6vm3kl	cmjhfi59p0013uwp4phh6bazf	f	2024-11-18 10:00:00	\N
cmjn2wly300lruwkc6x2tne8b	cmjmotm1v0015uw68sq6vm3kl	cmjhfi59p0013uwp4phh6bazf	t	2024-11-20 14:00:00	uploads/attendance/cmjmotm1v0015uw68sq6vm3kl_1732111200000.jpg
cmjn2wm0900ltuwkcobhvu1kl	cmjmotm1v0015uw68sq6vm3kl	cmjhfi59p0013uwp4phh6bazf	t	2024-11-22 16:00:00	uploads/attendance/cmjmotm1v0015uw68sq6vm3kl_1732291200000.jpg
cmjn2wm2f00lvuwkcyf1aylwm	cmjmotm1v0015uw68sq6vm3kl	cmjhfi59p0013uwp4phh6bazf	t	2024-11-25 10:00:00	uploads/attendance/cmjmotm1v0015uw68sq6vm3kl_1732528800000.jpg
cmjn2wm4l00lxuwkcfsb24tah	cmjmotm1v0015uw68sq6vm3kl	cmjhfi59p0013uwp4phh6bazf	f	2024-11-27 14:00:00	\N
cmjn2wm6r00lzuwkcga5gvu6s	cmjmotm1v0015uw68sq6vm3kl	cmjhfi59p0013uwp4phh6bazf	f	2024-11-29 16:00:00	\N
cmjn2wm8w00m1uwkc7dc68324	cmjmotm1v0015uw68sq6vm3kl	cmjhfjbal0017uwp4f068vsfb	t	2024-11-11 10:00:00	uploads/attendance/cmjmotm1v0015uw68sq6vm3kl_1731319200000.jpg
cmjn2wmb200m3uwkcehxkk0rv	cmjmotm1v0015uw68sq6vm3kl	cmjhfjbal0017uwp4f068vsfb	t	2024-11-13 14:00:00	uploads/attendance/cmjmotm1v0015uw68sq6vm3kl_1731506400000.jpg
cmjn2wmd800m5uwkcbetdke76	cmjmotm1v0015uw68sq6vm3kl	cmjhfjbal0017uwp4f068vsfb	f	2024-11-15 16:00:00	\N
cmjn2wmfe00m7uwkcrvnrpdo2	cmjmotm1v0015uw68sq6vm3kl	cmjhfjbal0017uwp4f068vsfb	t	2024-11-18 10:00:00	uploads/attendance/cmjmotm1v0015uw68sq6vm3kl_1731924000000.jpg
cmjn2wmhk00m9uwkcm02a9xhs	cmjmotm1v0015uw68sq6vm3kl	cmjhfjbal0017uwp4f068vsfb	t	2024-11-20 14:00:00	uploads/attendance/cmjmotm1v0015uw68sq6vm3kl_1732111200000.jpg
cmjn2wmjr00mbuwkcx4qhxy4i	cmjmotm1v0015uw68sq6vm3kl	cmjhfjbal0017uwp4f068vsfb	f	2024-11-22 16:00:00	\N
cmjn2wmlw00mduwkcznowz9jh	cmjmotm1v0015uw68sq6vm3kl	cmjhfjbal0017uwp4f068vsfb	f	2024-11-25 10:00:00	\N
cmjn2wmo300mfuwkciapu4p16	cmjmotm1v0015uw68sq6vm3kl	cmjhfjbal0017uwp4f068vsfb	t	2024-11-27 14:00:00	uploads/attendance/cmjmotm1v0015uw68sq6vm3kl_1732716000000.jpg
cmjn2wmq900mhuwkceyx1dq95	cmjmotm1v0015uw68sq6vm3kl	cmjhfjbal0017uwp4f068vsfb	t	2024-11-29 16:00:00	uploads/attendance/cmjmotm1v0015uw68sq6vm3kl_1732896000000.jpg
cmjn2wmsf00mjuwkcarcfmefc	cmjmotmli0018uw6849d5t2tg	cmjhfan4k000nuwp4vne02gie	t	2024-11-11 10:00:00	uploads/attendance/cmjmotmli0018uw6849d5t2tg_1731319200000.jpg
cmjn2wmv100mluwkcpyveo2lt	cmjmotmli0018uw6849d5t2tg	cmjhfan4k000nuwp4vne02gie	t	2024-11-13 14:00:00	uploads/attendance/cmjmotmli0018uw6849d5t2tg_1731506400000.jpg
cmjn2wmx800mnuwkcaer11nww	cmjmotmli0018uw6849d5t2tg	cmjhfan4k000nuwp4vne02gie	f	2024-11-15 16:00:00	\N
cmjn2wmze00mpuwkc4wgzb9n5	cmjmotmli0018uw6849d5t2tg	cmjhfan4k000nuwp4vne02gie	t	2024-11-18 10:00:00	uploads/attendance/cmjmotmli0018uw6849d5t2tg_1731924000000.jpg
cmjn2wn1j00mruwkc33dkjalu	cmjmotmli0018uw6849d5t2tg	cmjhfan4k000nuwp4vne02gie	t	2024-11-20 14:00:00	uploads/attendance/cmjmotmli0018uw6849d5t2tg_1732111200000.jpg
cmjn2wn3o00mtuwkc6re5b4uk	cmjmotmli0018uw6849d5t2tg	cmjhfan4k000nuwp4vne02gie	f	2024-11-22 16:00:00	\N
cmjn2wn5v00mvuwkcdfemh4i4	cmjmotmli0018uw6849d5t2tg	cmjhfan4k000nuwp4vne02gie	f	2024-11-25 10:00:00	\N
cmjn2wn8100mxuwkc29ubf7x6	cmjmotmli0018uw6849d5t2tg	cmjhfan4k000nuwp4vne02gie	f	2024-11-27 14:00:00	\N
cmjn2wna700mzuwkcbcjlflpr	cmjmotmli0018uw6849d5t2tg	cmjhfan4k000nuwp4vne02gie	t	2024-11-29 16:00:00	uploads/attendance/cmjmotmli0018uw6849d5t2tg_1732896000000.jpg
cmjn2wnce00n1uwkci175vuat	cmjmotmli0018uw6849d5t2tg	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-11 10:00:00	\N
cmjn2wnej00n3uwkcmgnlx2os	cmjmotmli0018uw6849d5t2tg	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-13 14:00:00	\N
cmjn2wngq00n5uwkcz8f1uacp	cmjmotmli0018uw6849d5t2tg	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-15 16:00:00	uploads/attendance/cmjmotmli0018uw6849d5t2tg_1731686400000.jpg
cmjn2wnkm00n7uwkcojx19w3w	cmjmotmli0018uw6849d5t2tg	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-18 10:00:00	uploads/attendance/cmjmotmli0018uw6849d5t2tg_1731924000000.jpg
cmjn2wnom00n9uwkcz14xxsy9	cmjmotmli0018uw6849d5t2tg	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-20 14:00:00	\N
cmjn2wnqr00nbuwkcimlfv48t	cmjmotmli0018uw6849d5t2tg	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-22 16:00:00	uploads/attendance/cmjmotmli0018uw6849d5t2tg_1732291200000.jpg
cmjn2wnt200nduwkck2vgkevu	cmjmotmli0018uw6849d5t2tg	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-25 10:00:00	\N
cmjn2wnvm00nfuwkcpihlk67c	cmjmotmli0018uw6849d5t2tg	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-27 14:00:00	uploads/attendance/cmjmotmli0018uw6849d5t2tg_1732716000000.jpg
cmjn2wnya00nhuwkc83oe2t7n	cmjmotmli0018uw6849d5t2tg	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-29 16:00:00	uploads/attendance/cmjmotmli0018uw6849d5t2tg_1732896000000.jpg
cmjn2wo0v00njuwkco9w89ita	cmjmotmli0018uw6849d5t2tg	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-11 10:00:00	\N
cmjn2wo3600nluwkcd35lf33o	cmjmotmli0018uw6849d5t2tg	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-13 14:00:00	uploads/attendance/cmjmotmli0018uw6849d5t2tg_1731506400000.jpg
cmjn2wo7600nnuwkcj38wn9nf	cmjmotmli0018uw6849d5t2tg	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-15 16:00:00	\N
cmjn2wobf00npuwkchpxcvcik	cmjmotmli0018uw6849d5t2tg	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-18 10:00:00	\N
cmjn2wodl00nruwkckckg0v5d	cmjmotmli0018uw6849d5t2tg	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-20 14:00:00	uploads/attendance/cmjmotmli0018uw6849d5t2tg_1732111200000.jpg
cmjn2woh400ntuwkckd0ke66r	cmjmotmli0018uw6849d5t2tg	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-22 16:00:00	uploads/attendance/cmjmotmli0018uw6849d5t2tg_1732291200000.jpg
cmjn2woj900nvuwkc4t7f53hc	cmjmotmli0018uw6849d5t2tg	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-25 10:00:00	\N
cmjn2womt00nxuwkc5t177aqo	cmjmotmli0018uw6849d5t2tg	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-27 14:00:00	\N
cmjn2wooy00nzuwkc9yrqai0u	cmjmotmli0018uw6849d5t2tg	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-29 16:00:00	\N
cmjn2wor300o1uwkcq4nk6nvm	cmjmotmli0018uw6849d5t2tg	cmjhfi59p0013uwp4phh6bazf	t	2024-11-11 10:00:00	uploads/attendance/cmjmotmli0018uw6849d5t2tg_1731319200000.jpg
cmjn2wota00o3uwkc5967iija	cmjmotmli0018uw6849d5t2tg	cmjhfi59p0013uwp4phh6bazf	f	2024-11-13 14:00:00	\N
cmjn2wovg00o5uwkcucaroxos	cmjmotmli0018uw6849d5t2tg	cmjhfi59p0013uwp4phh6bazf	t	2024-11-15 16:00:00	uploads/attendance/cmjmotmli0018uw6849d5t2tg_1731686400000.jpg
cmjn2woxm00o7uwkcqthws64w	cmjmotmli0018uw6849d5t2tg	cmjhfi59p0013uwp4phh6bazf	f	2024-11-18 10:00:00	\N
cmjn2wozs00o9uwkcgb9t9jre	cmjmotmli0018uw6849d5t2tg	cmjhfi59p0013uwp4phh6bazf	t	2024-11-20 14:00:00	uploads/attendance/cmjmotmli0018uw6849d5t2tg_1732111200000.jpg
cmjn2wp1z00obuwkcazdxjnlg	cmjmotmli0018uw6849d5t2tg	cmjhfi59p0013uwp4phh6bazf	t	2024-11-22 16:00:00	uploads/attendance/cmjmotmli0018uw6849d5t2tg_1732291200000.jpg
cmjn2wp4400oduwkc2z578s1f	cmjmotmli0018uw6849d5t2tg	cmjhfi59p0013uwp4phh6bazf	f	2024-11-25 10:00:00	\N
cmjn2wp6900ofuwkc50dopqe8	cmjmotmli0018uw6849d5t2tg	cmjhfi59p0013uwp4phh6bazf	f	2024-11-27 14:00:00	\N
cmjn2wp8f00ohuwkc44kljhtt	cmjmotmli0018uw6849d5t2tg	cmjhfi59p0013uwp4phh6bazf	t	2024-11-29 16:00:00	uploads/attendance/cmjmotmli0018uw6849d5t2tg_1732896000000.jpg
cmjn2wpam00ojuwkcne9ttgri	cmjmotmli0018uw6849d5t2tg	cmjhfjbal0017uwp4f068vsfb	f	2024-11-11 10:00:00	\N
cmjn2wpcr00oluwkco16jpc7h	cmjmotmli0018uw6849d5t2tg	cmjhfjbal0017uwp4f068vsfb	t	2024-11-13 14:00:00	uploads/attendance/cmjmotmli0018uw6849d5t2tg_1731506400000.jpg
cmjn2wpex00onuwkccf89vbhh	cmjmotmli0018uw6849d5t2tg	cmjhfjbal0017uwp4f068vsfb	f	2024-11-15 16:00:00	\N
cmjn2wph300opuwkcjvp2gdzz	cmjmotmli0018uw6849d5t2tg	cmjhfjbal0017uwp4f068vsfb	t	2024-11-18 10:00:00	uploads/attendance/cmjmotmli0018uw6849d5t2tg_1731924000000.jpg
cmjn2wpj900oruwkci7hcmuu0	cmjmotmli0018uw6849d5t2tg	cmjhfjbal0017uwp4f068vsfb	t	2024-11-20 14:00:00	uploads/attendance/cmjmotmli0018uw6849d5t2tg_1732111200000.jpg
cmjn2wplh00otuwkcjm7lxnmh	cmjmotmli0018uw6849d5t2tg	cmjhfjbal0017uwp4f068vsfb	f	2024-11-22 16:00:00	\N
cmjn2wpnp00ovuwkcrlw844zz	cmjmotmli0018uw6849d5t2tg	cmjhfjbal0017uwp4f068vsfb	f	2024-11-25 10:00:00	\N
cmjn2wppu00oxuwkc7kyc3ag1	cmjmotmli0018uw6849d5t2tg	cmjhfjbal0017uwp4f068vsfb	f	2024-11-27 14:00:00	\N
cmjn2wprz00ozuwkczj04pw17	cmjmotmli0018uw6849d5t2tg	cmjhfjbal0017uwp4f068vsfb	t	2024-11-29 16:00:00	uploads/attendance/cmjmotmli0018uw6849d5t2tg_1732896000000.jpg
cmjn2wpu400p1uwkcxc1oigst	cmjmozqoi001buw68v2kq5vkq	cmjhfan4k000nuwp4vne02gie	t	2024-11-11 10:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1731319200000.jpg
cmjn2wpw900p3uwkc0n0xo56y	cmjmozqoi001buw68v2kq5vkq	cmjhfan4k000nuwp4vne02gie	t	2024-11-13 14:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1731506400000.jpg
cmjn2wpye00p5uwkcnstgdwle	cmjmozqoi001buw68v2kq5vkq	cmjhfan4k000nuwp4vne02gie	t	2024-11-15 16:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1731686400000.jpg
cmjn2wq0i00p7uwkc46ztnf0e	cmjmozqoi001buw68v2kq5vkq	cmjhfan4k000nuwp4vne02gie	t	2024-11-18 10:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1731924000000.jpg
cmjn2wq2o00p9uwkcz2xzujms	cmjmozqoi001buw68v2kq5vkq	cmjhfan4k000nuwp4vne02gie	t	2024-11-20 14:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1732111200000.jpg
cmjn2wq4t00pbuwkcxbynazdp	cmjmozqoi001buw68v2kq5vkq	cmjhfan4k000nuwp4vne02gie	t	2024-11-22 16:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1732291200000.jpg
cmjn2wq6z00pduwkcd8dqjtvd	cmjmozqoi001buw68v2kq5vkq	cmjhfan4k000nuwp4vne02gie	t	2024-11-25 10:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1732528800000.jpg
cmjn2wq9400pfuwkc2v9555x8	cmjmozqoi001buw68v2kq5vkq	cmjhfan4k000nuwp4vne02gie	t	2024-11-27 14:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1732716000000.jpg
cmjn2wqb900phuwkcdt1i32kj	cmjmozqoi001buw68v2kq5vkq	cmjhfan4k000nuwp4vne02gie	t	2024-11-29 16:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1732896000000.jpg
cmjn2wqde00pjuwkcldhqffge	cmjmozqoi001buw68v2kq5vkq	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-11 10:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1731319200000.jpg
cmjn2wqfj00pluwkcil4sjh66	cmjmozqoi001buw68v2kq5vkq	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-13 14:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1731506400000.jpg
cmjn2wqhq00pnuwkcsha7kmcq	cmjmozqoi001buw68v2kq5vkq	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-15 16:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1731686400000.jpg
cmjn2wqjw00ppuwkchjk59bnn	cmjmozqoi001buw68v2kq5vkq	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-18 10:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1731924000000.jpg
cmjn2wqm100pruwkch5139pq5	cmjmozqoi001buw68v2kq5vkq	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-20 14:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1732111200000.jpg
cmjn2wqo800ptuwkcklen950k	cmjmozqoi001buw68v2kq5vkq	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-22 16:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1732291200000.jpg
cmjn2wqqf00pvuwkcxrk5pwub	cmjmozqoi001buw68v2kq5vkq	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-25 10:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1732528800000.jpg
cmjn2wqsl00pxuwkcr89p1jkr	cmjmozqoi001buw68v2kq5vkq	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-27 14:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1732716000000.jpg
cmjn2wqur00pzuwkcr93bm0bf	cmjmozqoi001buw68v2kq5vkq	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-29 16:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1732896000000.jpg
cmjn2wqwx00q1uwkctyyt50my	cmjmozqoi001buw68v2kq5vkq	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-11 10:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1731319200000.jpg
cmjn2wqz300q3uwkcvv5juecq	cmjmozqoi001buw68v2kq5vkq	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-13 14:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1731506400000.jpg
cmjn2wr1900q5uwkcclt02rsi	cmjmozqoi001buw68v2kq5vkq	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-15 16:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1731686400000.jpg
cmjn2wr3g00q7uwkcb3jx6n6i	cmjmozqoi001buw68v2kq5vkq	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-18 10:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1731924000000.jpg
cmjn2wr5n00q9uwkc1s3vh48b	cmjmozqoi001buw68v2kq5vkq	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-20 14:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1732111200000.jpg
cmjn2wr7t00qbuwkc4qra3pfj	cmjmozqoi001buw68v2kq5vkq	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-22 16:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1732291200000.jpg
cmjn2wr9z00qduwkcfizh7p9p	cmjmozqoi001buw68v2kq5vkq	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-25 10:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1732528800000.jpg
cmjn2wrc600qfuwkcuftevcv2	cmjmozqoi001buw68v2kq5vkq	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-27 14:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1732716000000.jpg
cmjn2wrec00qhuwkc9ojjgajx	cmjmozqoi001buw68v2kq5vkq	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-29 16:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1732896000000.jpg
cmjn2wrgi00qjuwkckwag3shq	cmjmozqoi001buw68v2kq5vkq	cmjhfi59p0013uwp4phh6bazf	t	2024-11-11 10:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1731319200000.jpg
cmjn2wrin00qluwkcktvnptm1	cmjmozqoi001buw68v2kq5vkq	cmjhfi59p0013uwp4phh6bazf	t	2024-11-13 14:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1731506400000.jpg
cmjn2wrku00qnuwkc1p2y6ubc	cmjmozqoi001buw68v2kq5vkq	cmjhfi59p0013uwp4phh6bazf	t	2024-11-15 16:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1731686400000.jpg
cmjn2wrn100qpuwkcsq0htwxw	cmjmozqoi001buw68v2kq5vkq	cmjhfi59p0013uwp4phh6bazf	t	2024-11-18 10:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1731924000000.jpg
cmjn2wrp800qruwkce6xg8rvl	cmjmozqoi001buw68v2kq5vkq	cmjhfi59p0013uwp4phh6bazf	t	2024-11-20 14:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1732111200000.jpg
cmjn2wrre00qtuwkcboiuyn63	cmjmozqoi001buw68v2kq5vkq	cmjhfi59p0013uwp4phh6bazf	t	2024-11-22 16:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1732291200000.jpg
cmjn2wrtj00qvuwkc8s65zo65	cmjmozqoi001buw68v2kq5vkq	cmjhfi59p0013uwp4phh6bazf	t	2024-11-25 10:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1732528800000.jpg
cmjn2wrvs00qxuwkct146urr5	cmjmozqoi001buw68v2kq5vkq	cmjhfi59p0013uwp4phh6bazf	t	2024-11-27 14:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1732716000000.jpg
cmjn2wrxy00qzuwkckjo9jqc4	cmjmozqoi001buw68v2kq5vkq	cmjhfi59p0013uwp4phh6bazf	t	2024-11-29 16:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1732896000000.jpg
cmjn2ws0600r1uwkclgh3er2p	cmjmozqoi001buw68v2kq5vkq	cmjhfjbal0017uwp4f068vsfb	t	2024-11-11 10:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1731319200000.jpg
cmjn2ws2d00r3uwkc10lwkvng	cmjmozqoi001buw68v2kq5vkq	cmjhfjbal0017uwp4f068vsfb	t	2024-11-13 14:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1731506400000.jpg
cmjn2ws4r00r5uwkcnjcvh7ic	cmjmozqoi001buw68v2kq5vkq	cmjhfjbal0017uwp4f068vsfb	t	2024-11-15 16:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1731686400000.jpg
cmjn2ws6y00r7uwkcw7dpk05v	cmjmozqoi001buw68v2kq5vkq	cmjhfjbal0017uwp4f068vsfb	t	2024-11-18 10:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1731924000000.jpg
cmjn2ws9500r9uwkcy51wby98	cmjmozqoi001buw68v2kq5vkq	cmjhfjbal0017uwp4f068vsfb	t	2024-11-20 14:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1732111200000.jpg
cmjn2wsbb00rbuwkcq3w0sz6o	cmjmozqoi001buw68v2kq5vkq	cmjhfjbal0017uwp4f068vsfb	t	2024-11-22 16:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1732291200000.jpg
cmjn2wsdh00rduwkc0kyctwf0	cmjmozqoi001buw68v2kq5vkq	cmjhfjbal0017uwp4f068vsfb	t	2024-11-25 10:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1732528800000.jpg
cmjn2wsfn00rfuwkcc6ruum4x	cmjmozqoi001buw68v2kq5vkq	cmjhfjbal0017uwp4f068vsfb	t	2024-11-27 14:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1732716000000.jpg
cmjn2wsht00rhuwkch6ytwgno	cmjmozqoi001buw68v2kq5vkq	cmjhfjbal0017uwp4f068vsfb	t	2024-11-29 16:00:00	uploads/attendance/cmjmozqoi001buw68v2kq5vkq_1732896000000.jpg
cmjn2wsjz00rjuwkcak67755g	cmjmozs79001euw68l7msny2x	cmjhfan4k000nuwp4vne02gie	t	2024-11-11 10:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1731319200000.jpg
cmjn2wsm500rluwkcrhizfgbq	cmjmozs79001euw68l7msny2x	cmjhfan4k000nuwp4vne02gie	t	2024-11-13 14:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1731506400000.jpg
cmjn2wsoa00rnuwkcdseqehsv	cmjmozs79001euw68l7msny2x	cmjhfan4k000nuwp4vne02gie	t	2024-11-15 16:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1731686400000.jpg
cmjn2wsrs00rpuwkc472qavpt	cmjmozs79001euw68l7msny2x	cmjhfan4k000nuwp4vne02gie	t	2024-11-18 10:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1731924000000.jpg
cmjn2wswc00rruwkc6wnb83ex	cmjmozs79001euw68l7msny2x	cmjhfan4k000nuwp4vne02gie	t	2024-11-20 14:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1732111200000.jpg
cmjn2wsyi00rtuwkcr8qvx7u2	cmjmozs79001euw68l7msny2x	cmjhfan4k000nuwp4vne02gie	t	2024-11-22 16:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1732291200000.jpg
cmjn2wt0n00rvuwkc92ovz154	cmjmozs79001euw68l7msny2x	cmjhfan4k000nuwp4vne02gie	t	2024-11-25 10:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1732528800000.jpg
cmjn2wt3i00rxuwkckgavakin	cmjmozs79001euw68l7msny2x	cmjhfan4k000nuwp4vne02gie	t	2024-11-27 14:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1732716000000.jpg
cmjn2wt6200rzuwkczsv1unbb	cmjmozs79001euw68l7msny2x	cmjhfan4k000nuwp4vne02gie	t	2024-11-29 16:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1732896000000.jpg
cmjn2wt8900s1uwkc2vmqhkms	cmjmozs79001euw68l7msny2x	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-11 10:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1731319200000.jpg
cmjn2wtax00s3uwkcqinfcxwb	cmjmozs79001euw68l7msny2x	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-13 14:00:00	\N
cmjn2wtew00s5uwkcqm5vfur2	cmjmozs79001euw68l7msny2x	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-15 16:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1731686400000.jpg
cmjn2wtj600s7uwkccgyg156b	cmjmozs79001euw68l7msny2x	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-18 10:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1731924000000.jpg
cmjn2wtlc00s9uwkc4ufampm2	cmjmozs79001euw68l7msny2x	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-20 14:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1732111200000.jpg
cmjn2wtou00sbuwkcfxessbda	cmjmozs79001euw68l7msny2x	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-22 16:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1732291200000.jpg
cmjn2wtr100sduwkcmu003xy4	cmjmozs79001euw68l7msny2x	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-25 10:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1732528800000.jpg
cmjn2wtuj00sfuwkco39u31up	cmjmozs79001euw68l7msny2x	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-27 14:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1732716000000.jpg
cmjn2wtwp00shuwkcygh4rw7p	cmjmozs79001euw68l7msny2x	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-29 16:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1732896000000.jpg
cmjn2wtyv00sjuwkclt2czsoe	cmjmozs79001euw68l7msny2x	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-11 10:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1731319200000.jpg
cmjn2wu1200sluwkcttrrbkz3	cmjmozs79001euw68l7msny2x	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-13 14:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1731506400000.jpg
cmjn2wu3700snuwkcuraambm4	cmjmozs79001euw68l7msny2x	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-15 16:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1731686400000.jpg
cmjn2wu5d00spuwkcof7ewppy	cmjmozs79001euw68l7msny2x	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-18 10:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1731924000000.jpg
cmjn2wu7j00sruwkc8e0o3lcd	cmjmozs79001euw68l7msny2x	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-20 14:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1732111200000.jpg
cmjn2wu9r00stuwkcrh5j1swm	cmjmozs79001euw68l7msny2x	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-22 16:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1732291200000.jpg
cmjn2wubx00svuwkcpcubwyf4	cmjmozs79001euw68l7msny2x	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-25 10:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1732528800000.jpg
cmjn2wue300sxuwkc41uuda6f	cmjmozs79001euw68l7msny2x	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-27 14:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1732716000000.jpg
cmjn2wug800szuwkcs3d0b53z	cmjmozs79001euw68l7msny2x	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-29 16:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1732896000000.jpg
cmjn2wuie00t1uwkcesahfbdl	cmjmozs79001euw68l7msny2x	cmjhfi59p0013uwp4phh6bazf	t	2024-11-11 10:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1731319200000.jpg
cmjn2wukk00t3uwkc86pvnrxv	cmjmozs79001euw68l7msny2x	cmjhfi59p0013uwp4phh6bazf	t	2024-11-13 14:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1731506400000.jpg
cmjn2wumr00t5uwkc2hj4s2vv	cmjmozs79001euw68l7msny2x	cmjhfi59p0013uwp4phh6bazf	t	2024-11-15 16:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1731686400000.jpg
cmjn2wuox00t7uwkch19p8szo	cmjmozs79001euw68l7msny2x	cmjhfi59p0013uwp4phh6bazf	t	2024-11-18 10:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1731924000000.jpg
cmjn2wur300t9uwkcfur0x49q	cmjmozs79001euw68l7msny2x	cmjhfi59p0013uwp4phh6bazf	t	2024-11-20 14:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1732111200000.jpg
cmjn2wut900tbuwkcadhs3q0h	cmjmozs79001euw68l7msny2x	cmjhfi59p0013uwp4phh6bazf	t	2024-11-22 16:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1732291200000.jpg
cmjn2wuvf00tduwkcgvwk9rs9	cmjmozs79001euw68l7msny2x	cmjhfi59p0013uwp4phh6bazf	t	2024-11-25 10:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1732528800000.jpg
cmjn2wuxn00tfuwkct9h9xmsh	cmjmozs79001euw68l7msny2x	cmjhfi59p0013uwp4phh6bazf	t	2024-11-27 14:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1732716000000.jpg
cmjn2wuzt00thuwkc8ajacg9s	cmjmozs79001euw68l7msny2x	cmjhfi59p0013uwp4phh6bazf	t	2024-11-29 16:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1732896000000.jpg
cmjn2wv4300tjuwkcah75d6tb	cmjmozs79001euw68l7msny2x	cmjhfjbal0017uwp4f068vsfb	t	2024-11-11 10:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1731319200000.jpg
cmjn2wv6900tluwkc99ejaes4	cmjmozs79001euw68l7msny2x	cmjhfjbal0017uwp4f068vsfb	f	2024-11-13 14:00:00	\N
cmjn2wv8f00tnuwkcfgczrdz2	cmjmozs79001euw68l7msny2x	cmjhfjbal0017uwp4f068vsfb	t	2024-11-15 16:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1731686400000.jpg
cmjn2wvap00tpuwkcti1e2rwi	cmjmozs79001euw68l7msny2x	cmjhfjbal0017uwp4f068vsfb	t	2024-11-18 10:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1731924000000.jpg
cmjn2wvcv00truwkcbjsbb0og	cmjmozs79001euw68l7msny2x	cmjhfjbal0017uwp4f068vsfb	t	2024-11-20 14:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1732111200000.jpg
cmjn2wvf200ttuwkcsx2d86cf	cmjmozs79001euw68l7msny2x	cmjhfjbal0017uwp4f068vsfb	t	2024-11-22 16:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1732291200000.jpg
cmjn2wvh800tvuwkcdmq4l9oo	cmjmozs79001euw68l7msny2x	cmjhfjbal0017uwp4f068vsfb	t	2024-11-25 10:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1732528800000.jpg
cmjn2wvje00txuwkc42zq540z	cmjmozs79001euw68l7msny2x	cmjhfjbal0017uwp4f068vsfb	t	2024-11-27 14:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1732716000000.jpg
cmjn2wvll00tzuwkcqpw9uafr	cmjmozs79001euw68l7msny2x	cmjhfjbal0017uwp4f068vsfb	t	2024-11-29 16:00:00	uploads/attendance/cmjmozs79001euw68l7msny2x_1732896000000.jpg
cmjn2wvns00u1uwkcj5uqg79u	cmjmozspz001huw6865e7z8ja	cmjhfan4k000nuwp4vne02gie	t	2024-11-11 10:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1731319200000.jpg
cmjn2wvpy00u3uwkcno4g2sal	cmjmozspz001huw6865e7z8ja	cmjhfan4k000nuwp4vne02gie	t	2024-11-13 14:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1731506400000.jpg
cmjn2wvs400u5uwkcootmj5ra	cmjmozspz001huw6865e7z8ja	cmjhfan4k000nuwp4vne02gie	t	2024-11-15 16:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1731686400000.jpg
cmjn2wvub00u7uwkc0k831rcu	cmjmozspz001huw6865e7z8ja	cmjhfan4k000nuwp4vne02gie	t	2024-11-18 10:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1731924000000.jpg
cmjn2wvwh00u9uwkcpynewswu	cmjmozspz001huw6865e7z8ja	cmjhfan4k000nuwp4vne02gie	f	2024-11-20 14:00:00	\N
cmjn2wvyn00ubuwkcpiyg1zma	cmjmozspz001huw6865e7z8ja	cmjhfan4k000nuwp4vne02gie	t	2024-11-22 16:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1732291200000.jpg
cmjn2ww0s00uduwkcpit5yo2f	cmjmozspz001huw6865e7z8ja	cmjhfan4k000nuwp4vne02gie	t	2024-11-25 10:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1732528800000.jpg
cmjn2ww2y00ufuwkczqxbnwiq	cmjmozspz001huw6865e7z8ja	cmjhfan4k000nuwp4vne02gie	t	2024-11-27 14:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1732716000000.jpg
cmjn2ww5700uhuwkcx8an8t3q	cmjmozspz001huw6865e7z8ja	cmjhfan4k000nuwp4vne02gie	t	2024-11-29 16:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1732896000000.jpg
cmjn2ww7f00ujuwkc10adnde2	cmjmozspz001huw6865e7z8ja	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-11 10:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1731319200000.jpg
cmjn2ww9l00uluwkcwmqlezwl	cmjmozspz001huw6865e7z8ja	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-13 14:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1731506400000.jpg
cmjn2wwbs00unuwkczzpacco9	cmjmozspz001huw6865e7z8ja	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-15 16:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1731686400000.jpg
cmjn2wwdy00upuwkcxkr8c670	cmjmozspz001huw6865e7z8ja	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-18 10:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1731924000000.jpg
cmjn2wwg400uruwkc4uvmnet7	cmjmozspz001huw6865e7z8ja	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-20 14:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1732111200000.jpg
cmjn2wwia00utuwkc905hzz1b	cmjmozspz001huw6865e7z8ja	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-22 16:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1732291200000.jpg
cmjn2wwkg00uvuwkc17kqmwjl	cmjmozspz001huw6865e7z8ja	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-25 10:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1732528800000.jpg
cmjn2wwmm00uxuwkcitpadovm	cmjmozspz001huw6865e7z8ja	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-27 14:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1732716000000.jpg
cmjn2wwot00uzuwkc6hqq21e5	cmjmozspz001huw6865e7z8ja	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-29 16:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1732896000000.jpg
cmjn2wwqy00v1uwkc1j45ytr0	cmjmozspz001huw6865e7z8ja	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-11 10:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1731319200000.jpg
cmjn2wwt400v3uwkc60uvrkn8	cmjmozspz001huw6865e7z8ja	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-13 14:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1731506400000.jpg
cmjn2wwvb00v5uwkczmgbdgqh	cmjmozspz001huw6865e7z8ja	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-15 16:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1731686400000.jpg
cmjn2wwxh00v7uwkcde752bk7	cmjmozspz001huw6865e7z8ja	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-18 10:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1731924000000.jpg
cmjn2wwzm00v9uwkc86670u1d	cmjmozspz001huw6865e7z8ja	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-20 14:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1732111200000.jpg
cmjn2wx1s00vbuwkc1fkizsuc	cmjmozspz001huw6865e7z8ja	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-22 16:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1732291200000.jpg
cmjn2wx3z00vduwkcxw6tfqj5	cmjmozspz001huw6865e7z8ja	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-25 10:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1732528800000.jpg
cmjn2wx6500vfuwkc76347ee4	cmjmozspz001huw6865e7z8ja	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-27 14:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1732716000000.jpg
cmjn2wx8f00vhuwkc4jqzdrk7	cmjmozspz001huw6865e7z8ja	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-29 16:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1732896000000.jpg
cmjn2wxal00vjuwkccmansj0o	cmjmozspz001huw6865e7z8ja	cmjhfi59p0013uwp4phh6bazf	f	2024-11-11 10:00:00	\N
cmjn2wxcr00vluwkcov2remem	cmjmozspz001huw6865e7z8ja	cmjhfi59p0013uwp4phh6bazf	t	2024-11-13 14:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1731506400000.jpg
cmjn2wxex00vnuwkcnf9fsvrh	cmjmozspz001huw6865e7z8ja	cmjhfi59p0013uwp4phh6bazf	t	2024-11-15 16:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1731686400000.jpg
cmjn2wxh400vpuwkc816o4r4z	cmjmozspz001huw6865e7z8ja	cmjhfi59p0013uwp4phh6bazf	t	2024-11-18 10:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1731924000000.jpg
cmjn2wxj800vruwkcotz656md	cmjmozspz001huw6865e7z8ja	cmjhfi59p0013uwp4phh6bazf	t	2024-11-20 14:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1732111200000.jpg
cmjn2wxld00vtuwkcb57qiihl	cmjmozspz001huw6865e7z8ja	cmjhfi59p0013uwp4phh6bazf	t	2024-11-22 16:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1732291200000.jpg
cmjn2wxnj00vvuwkcgdw8e7kh	cmjmozspz001huw6865e7z8ja	cmjhfi59p0013uwp4phh6bazf	f	2024-11-25 10:00:00	\N
cmjn2wxpp00vxuwkcxu6atfqm	cmjmozspz001huw6865e7z8ja	cmjhfi59p0013uwp4phh6bazf	t	2024-11-27 14:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1732716000000.jpg
cmjn2wxrv00vzuwkcjdp1xjlm	cmjmozspz001huw6865e7z8ja	cmjhfi59p0013uwp4phh6bazf	t	2024-11-29 16:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1732896000000.jpg
cmjn2wxu100w1uwkcg1f27y5p	cmjmozspz001huw6865e7z8ja	cmjhfjbal0017uwp4f068vsfb	t	2024-11-11 10:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1731319200000.jpg
cmjn2wxzc00w3uwkcmdz0nuic	cmjmozspz001huw6865e7z8ja	cmjhfjbal0017uwp4f068vsfb	f	2024-11-13 14:00:00	\N
cmjn2wy4200w5uwkcjdf4ss89	cmjmozspz001huw6865e7z8ja	cmjhfjbal0017uwp4f068vsfb	t	2024-11-15 16:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1731686400000.jpg
cmjn2x1d600yxuwkc09ii7y17	cmjmozt8s001kuw682c5ohejr	cmjhfjbal0017uwp4f068vsfb	f	2024-11-27 14:00:00	\N
cmjn2wy6800w7uwkcpp3b22cy	cmjmozspz001huw6865e7z8ja	cmjhfjbal0017uwp4f068vsfb	t	2024-11-18 10:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1731924000000.jpg
cmjn2wy8f00w9uwkce9dd8agq	cmjmozspz001huw6865e7z8ja	cmjhfjbal0017uwp4f068vsfb	t	2024-11-20 14:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1732111200000.jpg
cmjn2wyb900wbuwkctdh6ftsq	cmjmozspz001huw6865e7z8ja	cmjhfjbal0017uwp4f068vsfb	t	2024-11-22 16:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1732291200000.jpg
cmjn2wydw00wduwkcazjp1qh9	cmjmozspz001huw6865e7z8ja	cmjhfjbal0017uwp4f068vsfb	t	2024-11-25 10:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1732528800000.jpg
cmjn2wyg200wfuwkc6t5ibznx	cmjmozspz001huw6865e7z8ja	cmjhfjbal0017uwp4f068vsfb	t	2024-11-27 14:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1732716000000.jpg
cmjn2wyio00whuwkc5mkl1lj0	cmjmozspz001huw6865e7z8ja	cmjhfjbal0017uwp4f068vsfb	t	2024-11-29 16:00:00	uploads/attendance/cmjmozspz001huw6865e7z8ja_1732896000000.jpg
cmjn2wymn00wjuwkc23fses5y	cmjmozt8s001kuw682c5ohejr	cmjhfan4k000nuwp4vne02gie	t	2024-11-11 10:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1731319200000.jpg
cmjn2wyqw00wluwkcor7nooua	cmjmozt8s001kuw682c5ohejr	cmjhfan4k000nuwp4vne02gie	t	2024-11-13 14:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1731506400000.jpg
cmjn2wyt200wnuwkc1njvyu0g	cmjmozt8s001kuw682c5ohejr	cmjhfan4k000nuwp4vne02gie	t	2024-11-15 16:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1731686400000.jpg
cmjn2wywl00wpuwkc33jj6ks4	cmjmozt8s001kuw682c5ohejr	cmjhfan4k000nuwp4vne02gie	t	2024-11-18 10:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1731924000000.jpg
cmjn2wyyq00wruwkcth60ta3r	cmjmozt8s001kuw682c5ohejr	cmjhfan4k000nuwp4vne02gie	t	2024-11-20 14:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1732111200000.jpg
cmjn2wz2a00wtuwkcm34s3qxs	cmjmozt8s001kuw682c5ohejr	cmjhfan4k000nuwp4vne02gie	t	2024-11-22 16:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1732291200000.jpg
cmjn2wz4g00wvuwkcoqupyvci	cmjmozt8s001kuw682c5ohejr	cmjhfan4k000nuwp4vne02gie	t	2024-11-25 10:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1732528800000.jpg
cmjn2wz6m00wxuwkc89ika65o	cmjmozt8s001kuw682c5ohejr	cmjhfan4k000nuwp4vne02gie	t	2024-11-27 14:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1732716000000.jpg
cmjn2wz8u00wzuwkc9j7qoyg6	cmjmozt8s001kuw682c5ohejr	cmjhfan4k000nuwp4vne02gie	t	2024-11-29 16:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1732896000000.jpg
cmjn2wzb000x1uwkc9aqmgezl	cmjmozt8s001kuw682c5ohejr	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-11 10:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1731319200000.jpg
cmjn2wzd600x3uwkc00y80uwc	cmjmozt8s001kuw682c5ohejr	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-13 14:00:00	\N
cmjn2wzfb00x5uwkc2liy2ey8	cmjmozt8s001kuw682c5ohejr	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-15 16:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1731686400000.jpg
cmjn2wzhh00x7uwkc60nstjy2	cmjmozt8s001kuw682c5ohejr	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-18 10:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1731924000000.jpg
cmjn2wzjn00x9uwkc8hbk29s3	cmjmozt8s001kuw682c5ohejr	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-20 14:00:00	\N
cmjn2wzlt00xbuwkccdr3cnql	cmjmozt8s001kuw682c5ohejr	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-22 16:00:00	\N
cmjn2wzo000xduwkcqqgbwft0	cmjmozt8s001kuw682c5ohejr	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-25 10:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1732528800000.jpg
cmjn2wzq600xfuwkc5shaa6g3	cmjmozt8s001kuw682c5ohejr	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-27 14:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1732716000000.jpg
cmjn2wzsc00xhuwkcrirm5830	cmjmozt8s001kuw682c5ohejr	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-29 16:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1732896000000.jpg
cmjn2wzuj00xjuwkcyus6oob9	cmjmozt8s001kuw682c5ohejr	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-11 10:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1731319200000.jpg
cmjn2wzwp00xluwkc8w886cxp	cmjmozt8s001kuw682c5ohejr	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-13 14:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1731506400000.jpg
cmjn2wzyu00xnuwkcxasy1vrw	cmjmozt8s001kuw682c5ohejr	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-15 16:00:00	\N
cmjn2x01000xpuwkcpvfx4wa5	cmjmozt8s001kuw682c5ohejr	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-18 10:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1731924000000.jpg
cmjn2x03700xruwkcvgn5x6o0	cmjmozt8s001kuw682c5ohejr	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-20 14:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1732111200000.jpg
cmjn2x05d00xtuwkcjoqwn2ze	cmjmozt8s001kuw682c5ohejr	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-22 16:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1732291200000.jpg
cmjn2x07i00xvuwkchwmod135	cmjmozt8s001kuw682c5ohejr	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-25 10:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1732528800000.jpg
cmjn2x09o00xxuwkcmxanrev2	cmjmozt8s001kuw682c5ohejr	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-27 14:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1732716000000.jpg
cmjn2x0bv00xzuwkc819aff3p	cmjmozt8s001kuw682c5ohejr	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-29 16:00:00	\N
cmjn2x0e100y1uwkc61rhfac6	cmjmozt8s001kuw682c5ohejr	cmjhfi59p0013uwp4phh6bazf	t	2024-11-11 10:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1731319200000.jpg
cmjn2x0g800y3uwkch813ehsf	cmjmozt8s001kuw682c5ohejr	cmjhfi59p0013uwp4phh6bazf	f	2024-11-13 14:00:00	\N
cmjn2x0if00y5uwkctvvfvpl2	cmjmozt8s001kuw682c5ohejr	cmjhfi59p0013uwp4phh6bazf	t	2024-11-15 16:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1731686400000.jpg
cmjn2x0kl00y7uwkc8bgzu5pt	cmjmozt8s001kuw682c5ohejr	cmjhfi59p0013uwp4phh6bazf	t	2024-11-18 10:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1731924000000.jpg
cmjn2x0ms00y9uwkcriscicz8	cmjmozt8s001kuw682c5ohejr	cmjhfi59p0013uwp4phh6bazf	t	2024-11-20 14:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1732111200000.jpg
cmjn2x0p100ybuwkcy76pmud6	cmjmozt8s001kuw682c5ohejr	cmjhfi59p0013uwp4phh6bazf	t	2024-11-22 16:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1732291200000.jpg
cmjn2x0r600yduwkcd554mu4v	cmjmozt8s001kuw682c5ohejr	cmjhfi59p0013uwp4phh6bazf	t	2024-11-25 10:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1732528800000.jpg
cmjn2x0tf00yfuwkcrz41bnj0	cmjmozt8s001kuw682c5ohejr	cmjhfi59p0013uwp4phh6bazf	t	2024-11-27 14:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1732716000000.jpg
cmjn2x0vl00yhuwkchmkdqj12	cmjmozt8s001kuw682c5ohejr	cmjhfi59p0013uwp4phh6bazf	f	2024-11-29 16:00:00	\N
cmjn2x0xr00yjuwkc6iohv3xj	cmjmozt8s001kuw682c5ohejr	cmjhfjbal0017uwp4f068vsfb	t	2024-11-11 10:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1731319200000.jpg
cmjn2x0zx00yluwkc4m6cpokb	cmjmozt8s001kuw682c5ohejr	cmjhfjbal0017uwp4f068vsfb	t	2024-11-13 14:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1731506400000.jpg
cmjn2x12200ynuwkcm9w3wf1d	cmjmozt8s001kuw682c5ohejr	cmjhfjbal0017uwp4f068vsfb	f	2024-11-15 16:00:00	\N
cmjn2x14h00ypuwkc5tn78tbt	cmjmozt8s001kuw682c5ohejr	cmjhfjbal0017uwp4f068vsfb	t	2024-11-18 10:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1731924000000.jpg
cmjn2x16n00yruwkcpf590y5d	cmjmozt8s001kuw682c5ohejr	cmjhfjbal0017uwp4f068vsfb	f	2024-11-20 14:00:00	\N
cmjn2x18u00ytuwkcbb9z40s3	cmjmozt8s001kuw682c5ohejr	cmjhfjbal0017uwp4f068vsfb	t	2024-11-22 16:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1732291200000.jpg
cmjn2x1fc00yzuwkcud1zieyf	cmjmozt8s001kuw682c5ohejr	cmjhfjbal0017uwp4f068vsfb	t	2024-11-29 16:00:00	uploads/attendance/cmjmozt8s001kuw682c5ohejr_1732896000000.jpg
cmjn2x1hi00z1uwkcoviiy4fx	cmjmozuc3001nuw68t3gikoeq	cmjhfan4k000nuwp4vne02gie	t	2024-11-11 10:00:00	uploads/attendance/cmjmozuc3001nuw68t3gikoeq_1731319200000.jpg
cmjn2x1jo00z3uwkcu701my21	cmjmozuc3001nuw68t3gikoeq	cmjhfan4k000nuwp4vne02gie	t	2024-11-13 14:00:00	uploads/attendance/cmjmozuc3001nuw68t3gikoeq_1731506400000.jpg
cmjn2x1lu00z5uwkcm75uopur	cmjmozuc3001nuw68t3gikoeq	cmjhfan4k000nuwp4vne02gie	f	2024-11-15 16:00:00	\N
cmjn2x1o000z7uwkcgymk1qxi	cmjmozuc3001nuw68t3gikoeq	cmjhfan4k000nuwp4vne02gie	f	2024-11-18 10:00:00	\N
cmjn2x1q600z9uwkcg3g1yx7x	cmjmozuc3001nuw68t3gikoeq	cmjhfan4k000nuwp4vne02gie	t	2024-11-20 14:00:00	uploads/attendance/cmjmozuc3001nuw68t3gikoeq_1732111200000.jpg
cmjn2x1sc00zbuwkcort2i4xd	cmjmozuc3001nuw68t3gikoeq	cmjhfan4k000nuwp4vne02gie	f	2024-11-22 16:00:00	\N
cmjn2x1uj00zduwkchxb07lqv	cmjmozuc3001nuw68t3gikoeq	cmjhfan4k000nuwp4vne02gie	f	2024-11-25 10:00:00	\N
cmjn2x1wo00zfuwkcyw4cq30t	cmjmozuc3001nuw68t3gikoeq	cmjhfan4k000nuwp4vne02gie	t	2024-11-27 14:00:00	uploads/attendance/cmjmozuc3001nuw68t3gikoeq_1732716000000.jpg
cmjn2x1yu00zhuwkcte1fv9yl	cmjmozuc3001nuw68t3gikoeq	cmjhfan4k000nuwp4vne02gie	f	2024-11-29 16:00:00	\N
cmjn2x21000zjuwkckf12cttd	cmjmozuc3001nuw68t3gikoeq	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-11 10:00:00	uploads/attendance/cmjmozuc3001nuw68t3gikoeq_1731319200000.jpg
cmjn2x23500zluwkcy0f3syd9	cmjmozuc3001nuw68t3gikoeq	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-13 14:00:00	\N
cmjn2x25c00znuwkc9chfafgi	cmjmozuc3001nuw68t3gikoeq	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-15 16:00:00	uploads/attendance/cmjmozuc3001nuw68t3gikoeq_1731686400000.jpg
cmjn2x27i00zpuwkc5ldennpe	cmjmozuc3001nuw68t3gikoeq	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-18 10:00:00	uploads/attendance/cmjmozuc3001nuw68t3gikoeq_1731924000000.jpg
cmjn2x29n00zruwkc9nb1mggw	cmjmozuc3001nuw68t3gikoeq	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-20 14:00:00	\N
cmjn2x2bu00ztuwkcud6w0t79	cmjmozuc3001nuw68t3gikoeq	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-22 16:00:00	\N
cmjn2x2e000zvuwkc4fpgzaq7	cmjmozuc3001nuw68t3gikoeq	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-25 10:00:00	uploads/attendance/cmjmozuc3001nuw68t3gikoeq_1732528800000.jpg
cmjn2x2g600zxuwkc9n2e4rms	cmjmozuc3001nuw68t3gikoeq	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-27 14:00:00	uploads/attendance/cmjmozuc3001nuw68t3gikoeq_1732716000000.jpg
cmjn2x2ic00zzuwkcd7zhyo27	cmjmozuc3001nuw68t3gikoeq	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-29 16:00:00	\N
cmjn2x2kj0101uwkctvrolppl	cmjmozuc3001nuw68t3gikoeq	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-11 10:00:00	uploads/attendance/cmjmozuc3001nuw68t3gikoeq_1731319200000.jpg
cmjn2x2mp0103uwkc3bow8ae5	cmjmozuc3001nuw68t3gikoeq	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-13 14:00:00	uploads/attendance/cmjmozuc3001nuw68t3gikoeq_1731506400000.jpg
cmjn2x2ou0105uwkcef09p3rr	cmjmozuc3001nuw68t3gikoeq	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-15 16:00:00	\N
cmjn2x2r00107uwkc33b2dj89	cmjmozuc3001nuw68t3gikoeq	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-18 10:00:00	uploads/attendance/cmjmozuc3001nuw68t3gikoeq_1731924000000.jpg
cmjn2x2t60109uwkchml8oqjz	cmjmozuc3001nuw68t3gikoeq	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-20 14:00:00	uploads/attendance/cmjmozuc3001nuw68t3gikoeq_1732111200000.jpg
cmjn2x2vb010buwkc0tozpejn	cmjmozuc3001nuw68t3gikoeq	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-22 16:00:00	uploads/attendance/cmjmozuc3001nuw68t3gikoeq_1732291200000.jpg
cmjn2x2xh010duwkcw6cwpj06	cmjmozuc3001nuw68t3gikoeq	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-25 10:00:00	\N
cmjn2x2zn010fuwkc9dz5ulwr	cmjmozuc3001nuw68t3gikoeq	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-27 14:00:00	\N
cmjn2x31s010huwkcawchv81e	cmjmozuc3001nuw68t3gikoeq	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-29 16:00:00	uploads/attendance/cmjmozuc3001nuw68t3gikoeq_1732896000000.jpg
cmjn2x33x010juwkcdlxz2o2i	cmjmozuc3001nuw68t3gikoeq	cmjhfi59p0013uwp4phh6bazf	t	2024-11-11 10:00:00	uploads/attendance/cmjmozuc3001nuw68t3gikoeq_1731319200000.jpg
cmjn2x362010luwkcydf7d64y	cmjmozuc3001nuw68t3gikoeq	cmjhfi59p0013uwp4phh6bazf	t	2024-11-13 14:00:00	uploads/attendance/cmjmozuc3001nuw68t3gikoeq_1731506400000.jpg
cmjn2x389010nuwkctgimu8ho	cmjmozuc3001nuw68t3gikoeq	cmjhfi59p0013uwp4phh6bazf	f	2024-11-15 16:00:00	\N
cmjn2x3ay010puwkc7dffneyc	cmjmozuc3001nuw68t3gikoeq	cmjhfi59p0013uwp4phh6bazf	t	2024-11-18 10:00:00	uploads/attendance/cmjmozuc3001nuw68t3gikoeq_1731924000000.jpg
cmjn2x3d4010ruwkczwmuslgt	cmjmozuc3001nuw68t3gikoeq	cmjhfi59p0013uwp4phh6bazf	t	2024-11-20 14:00:00	uploads/attendance/cmjmozuc3001nuw68t3gikoeq_1732111200000.jpg
cmjn2x3fa010tuwkcbq5yqh4q	cmjmozuc3001nuw68t3gikoeq	cmjhfi59p0013uwp4phh6bazf	t	2024-11-22 16:00:00	uploads/attendance/cmjmozuc3001nuw68t3gikoeq_1732291200000.jpg
cmjn2x3hf010vuwkcdecqi6ir	cmjmozuc3001nuw68t3gikoeq	cmjhfi59p0013uwp4phh6bazf	f	2024-11-25 10:00:00	\N
cmjn2x3ke010xuwkc4tprt88o	cmjmozuc3001nuw68t3gikoeq	cmjhfi59p0013uwp4phh6bazf	f	2024-11-27 14:00:00	\N
cmjn2x3mj010zuwkcdrvirb6y	cmjmozuc3001nuw68t3gikoeq	cmjhfi59p0013uwp4phh6bazf	f	2024-11-29 16:00:00	\N
cmjn2x3pa0111uwkcvivj6oq2	cmjmozuc3001nuw68t3gikoeq	cmjhfjbal0017uwp4f068vsfb	f	2024-11-11 10:00:00	\N
cmjn2x3rg0113uwkcz7ycd6wb	cmjmozuc3001nuw68t3gikoeq	cmjhfjbal0017uwp4f068vsfb	t	2024-11-13 14:00:00	uploads/attendance/cmjmozuc3001nuw68t3gikoeq_1731506400000.jpg
cmjn2x3tv0115uwkcrgaw4o98	cmjmozuc3001nuw68t3gikoeq	cmjhfjbal0017uwp4f068vsfb	t	2024-11-15 16:00:00	uploads/attendance/cmjmozuc3001nuw68t3gikoeq_1731686400000.jpg
cmjn2x3w10117uwkc3uu8nxo7	cmjmozuc3001nuw68t3gikoeq	cmjhfjbal0017uwp4f068vsfb	f	2024-11-18 10:00:00	\N
cmjn2x3y90119uwkcag5t36l2	cmjmozuc3001nuw68t3gikoeq	cmjhfjbal0017uwp4f068vsfb	t	2024-11-20 14:00:00	uploads/attendance/cmjmozuc3001nuw68t3gikoeq_1732111200000.jpg
cmjn2x40t011buwkcyf8pjqg4	cmjmozuc3001nuw68t3gikoeq	cmjhfjbal0017uwp4f068vsfb	t	2024-11-22 16:00:00	uploads/attendance/cmjmozuc3001nuw68t3gikoeq_1732291200000.jpg
cmjn2x42z011duwkcvei19q76	cmjmozuc3001nuw68t3gikoeq	cmjhfjbal0017uwp4f068vsfb	f	2024-11-25 10:00:00	\N
cmjn2x46h011fuwkcwcx5cjhh	cmjmozuc3001nuw68t3gikoeq	cmjhfjbal0017uwp4f068vsfb	t	2024-11-27 14:00:00	uploads/attendance/cmjmozuc3001nuw68t3gikoeq_1732716000000.jpg
cmjn2x48n011huwkcl9k3ig5s	cmjmozuc3001nuw68t3gikoeq	cmjhfjbal0017uwp4f068vsfb	t	2024-11-29 16:00:00	uploads/attendance/cmjmozuc3001nuw68t3gikoeq_1732896000000.jpg
cmjn2x4at011juwkce7mz20pa	cmjmozuy3001quw681bktrj6n	cmjhfan4k000nuwp4vne02gie	t	2024-11-11 10:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1731319200000.jpg
cmjn2x4cz011luwkc2q9uia7z	cmjmozuy3001quw681bktrj6n	cmjhfan4k000nuwp4vne02gie	t	2024-11-13 14:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1731506400000.jpg
cmjn2x4gj011nuwkci803yg55	cmjmozuy3001quw681bktrj6n	cmjhfan4k000nuwp4vne02gie	f	2024-11-15 16:00:00	\N
cmjn2x4k0011puwkc3zu43xmr	cmjmozuy3001quw681bktrj6n	cmjhfan4k000nuwp4vne02gie	t	2024-11-18 10:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1731924000000.jpg
cmjn2x4m6011ruwkcoprnq533	cmjmozuy3001quw681bktrj6n	cmjhfan4k000nuwp4vne02gie	f	2024-11-20 14:00:00	\N
cmjn2x4oc011tuwkccsbza0el	cmjmozuy3001quw681bktrj6n	cmjhfan4k000nuwp4vne02gie	t	2024-11-22 16:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1732291200000.jpg
cmjn2x4qi011vuwkca7jc1he3	cmjmozuy3001quw681bktrj6n	cmjhfan4k000nuwp4vne02gie	t	2024-11-25 10:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1732528800000.jpg
cmjn2x4u2011xuwkccnm2dx5t	cmjmozuy3001quw681bktrj6n	cmjhfan4k000nuwp4vne02gie	t	2024-11-27 14:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1732716000000.jpg
cmjn2x4wk011zuwkc2bdf4uck	cmjmozuy3001quw681bktrj6n	cmjhfan4k000nuwp4vne02gie	t	2024-11-29 16:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1732896000000.jpg
cmjn2x4ys0121uwkcpgb2wsty	cmjmozuy3001quw681bktrj6n	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-11 10:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1731319200000.jpg
cmjn2x5130123uwkcax8c82x2	cmjmozuy3001quw681bktrj6n	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-13 14:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1731506400000.jpg
cmjn2x53e0125uwkcn1b4hy9e	cmjmozuy3001quw681bktrj6n	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-15 16:00:00	\N
cmjn2x55k0127uwkcifv2q251	cmjmozuy3001quw681bktrj6n	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-18 10:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1731924000000.jpg
cmjn2x5900129uwkc6z8pl36o	cmjmozuy3001quw681bktrj6n	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-20 14:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1732111200000.jpg
cmjn2x5b6012buwkcn8xetefd	cmjmozuy3001quw681bktrj6n	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-22 16:00:00	\N
cmjn2x5dl012duwkc4g4n5zt2	cmjmozuy3001quw681bktrj6n	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-25 10:00:00	\N
cmjn2x5fr012fuwkcs1w5hhk3	cmjmozuy3001quw681bktrj6n	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-27 14:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1732716000000.jpg
cmjn2x5i6012huwkcfb5aic7g	cmjmozuy3001quw681bktrj6n	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-29 16:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1732896000000.jpg
cmjn2x5kc012juwkc6duzuqiv	cmjmozuy3001quw681bktrj6n	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-11 10:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1731319200000.jpg
cmjn2x5mi012luwkc5x0udp6g	cmjmozuy3001quw681bktrj6n	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-13 14:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1731506400000.jpg
cmjn2x5oo012nuwkcr8mykm7k	cmjmozuy3001quw681bktrj6n	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-15 16:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1731686400000.jpg
cmjn2x5s7012puwkcxwr8v64v	cmjmozuy3001quw681bktrj6n	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-18 10:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1731924000000.jpg
cmjn2x5un012ruwkcwxjdfypv	cmjmozuy3001quw681bktrj6n	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-20 14:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1732111200000.jpg
cmjn2x5ww012tuwkct7hhbntg	cmjmozuy3001quw681bktrj6n	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-22 16:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1732291200000.jpg
cmjn2x5z7012vuwkcrveco11p	cmjmozuy3001quw681bktrj6n	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-25 10:00:00	\N
cmjn2x61f012xuwkcozql747c	cmjmozuy3001quw681bktrj6n	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-27 14:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1732716000000.jpg
cmjn2x63k012zuwkcco2lv33x	cmjmozuy3001quw681bktrj6n	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-29 16:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1732896000000.jpg
cmjn2x65s0131uwkccaclw5cj	cmjmozuy3001quw681bktrj6n	cmjhfi59p0013uwp4phh6bazf	t	2024-11-11 10:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1731319200000.jpg
cmjn2x6990133uwkcve3wc5ft	cmjmozuy3001quw681bktrj6n	cmjhfi59p0013uwp4phh6bazf	t	2024-11-13 14:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1731506400000.jpg
cmjn2x6bq0135uwkcynr58meq	cmjmozuy3001quw681bktrj6n	cmjhfi59p0013uwp4phh6bazf	t	2024-11-15 16:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1731686400000.jpg
cmjn2x6dw0137uwkc77y0odu1	cmjmozuy3001quw681bktrj6n	cmjhfi59p0013uwp4phh6bazf	t	2024-11-18 10:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1731924000000.jpg
cmjn2x6gc0139uwkc627w5zvq	cmjmozuy3001quw681bktrj6n	cmjhfi59p0013uwp4phh6bazf	t	2024-11-20 14:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1732111200000.jpg
cmjn2x6ii013buwkce799pwe3	cmjmozuy3001quw681bktrj6n	cmjhfi59p0013uwp4phh6bazf	t	2024-11-22 16:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1732291200000.jpg
cmjn2x6ko013duwkca29ra626	cmjmozuy3001quw681bktrj6n	cmjhfi59p0013uwp4phh6bazf	f	2024-11-25 10:00:00	\N
cmjn2x6o7013fuwkcy3ljbocn	cmjmozuy3001quw681bktrj6n	cmjhfi59p0013uwp4phh6bazf	t	2024-11-27 14:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1732716000000.jpg
cmjn2x6sr013huwkcadxmrmnj	cmjmozuy3001quw681bktrj6n	cmjhfi59p0013uwp4phh6bazf	t	2024-11-29 16:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1732896000000.jpg
cmjn2x6uy013juwkchk15uyzp	cmjmozuy3001quw681bktrj6n	cmjhfjbal0017uwp4f068vsfb	t	2024-11-11 10:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1731319200000.jpg
cmjn2x6xd013luwkcsymlynj8	cmjmozuy3001quw681bktrj6n	cmjhfjbal0017uwp4f068vsfb	t	2024-11-13 14:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1731506400000.jpg
cmjn2x6zj013nuwkc8p6cd10c	cmjmozuy3001quw681bktrj6n	cmjhfjbal0017uwp4f068vsfb	t	2024-11-15 16:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1731686400000.jpg
cmjn2x71o013puwkcrg2udumn	cmjmozuy3001quw681bktrj6n	cmjhfjbal0017uwp4f068vsfb	f	2024-11-18 10:00:00	\N
cmjn2x73u013ruwkcbxs0mv10	cmjmozuy3001quw681bktrj6n	cmjhfjbal0017uwp4f068vsfb	t	2024-11-20 14:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1732111200000.jpg
cmjn2x77d013tuwkcw8urkaju	cmjmozuy3001quw681bktrj6n	cmjhfjbal0017uwp4f068vsfb	t	2024-11-22 16:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1732291200000.jpg
cmjn2x79v013vuwkccnd7zmmg	cmjmozuy3001quw681bktrj6n	cmjhfjbal0017uwp4f068vsfb	t	2024-11-25 10:00:00	uploads/attendance/cmjmozuy3001quw681bktrj6n_1732528800000.jpg
cmjn2x7c9013xuwkcwdulaiyk	cmjmozuy3001quw681bktrj6n	cmjhfjbal0017uwp4f068vsfb	f	2024-11-27 14:00:00	\N
cmjn2x7ef013zuwkcyupkwtb5	cmjmozuy3001quw681bktrj6n	cmjhfjbal0017uwp4f068vsfb	f	2024-11-29 16:00:00	\N
cmjn2x7gn0141uwkc5fga5w48	cmjmp3j9e001tuw68p5vrat7j	cmjhfan4k000nuwp4vne02gie	t	2024-11-11 10:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1731319200000.jpg
cmjn2x7it0143uwkc8p0tko7q	cmjmp3j9e001tuw68p5vrat7j	cmjhfan4k000nuwp4vne02gie	t	2024-11-13 14:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1731506400000.jpg
cmjn2x7mc0145uwkc3ajymo4e	cmjmp3j9e001tuw68p5vrat7j	cmjhfan4k000nuwp4vne02gie	t	2024-11-15 16:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1731686400000.jpg
cmjn2x7ok0147uwkcoldcgk47	cmjmp3j9e001tuw68p5vrat7j	cmjhfan4k000nuwp4vne02gie	f	2024-11-18 10:00:00	\N
cmjn2x7qw0149uwkc0q4po9av	cmjmp3j9e001tuw68p5vrat7j	cmjhfan4k000nuwp4vne02gie	f	2024-11-20 14:00:00	\N
cmjn2x7t2014buwkc8uho77wu	cmjmp3j9e001tuw68p5vrat7j	cmjhfan4k000nuwp4vne02gie	f	2024-11-22 16:00:00	\N
cmjn2x7vi014duwkc7u1bkiyn	cmjmp3j9e001tuw68p5vrat7j	cmjhfan4k000nuwp4vne02gie	f	2024-11-25 10:00:00	\N
cmjn2x7xo014fuwkcrf2queok	cmjmp3j9e001tuw68p5vrat7j	cmjhfan4k000nuwp4vne02gie	t	2024-11-27 14:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1732716000000.jpg
cmjn2x7zu014huwkckc8l5ts9	cmjmp3j9e001tuw68p5vrat7j	cmjhfan4k000nuwp4vne02gie	t	2024-11-29 16:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1732896000000.jpg
cmjn2x820014juwkch2wbfwwi	cmjmp3j9e001tuw68p5vrat7j	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-11 10:00:00	\N
cmjn2x85j014luwkclhl6nsp6	cmjmp3j9e001tuw68p5vrat7j	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-13 14:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1731506400000.jpg
cmjn2x880014nuwkc646ixt30	cmjmp3j9e001tuw68p5vrat7j	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-15 16:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1731686400000.jpg
cmjn2x8a6014puwkcw7oj0c70	cmjmp3j9e001tuw68p5vrat7j	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-18 10:00:00	\N
cmjn2x8ck014ruwkc0bsrqqqu	cmjmp3j9e001tuw68p5vrat7j	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-20 14:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1732111200000.jpg
cmjn2x8eq014tuwkc3bqrt3zl	cmjmp3j9e001tuw68p5vrat7j	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-22 16:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1732291200000.jpg
cmjn2x8gx014vuwkcc9gqvpwr	cmjmp3j9e001tuw68p5vrat7j	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-25 10:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1732528800000.jpg
cmjn2x8j2014xuwkcn3z8ozaa	cmjmp3j9e001tuw68p5vrat7j	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-27 14:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1732716000000.jpg
cmjn2x8ml014zuwkcolpvcuro	cmjmp3j9e001tuw68p5vrat7j	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-29 16:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1732896000000.jpg
cmjn2x8p20151uwkcwntz2cnr	cmjmp3j9e001tuw68p5vrat7j	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-11 10:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1731319200000.jpg
cmjn2x8r80153uwkclfsh5ulp	cmjmp3j9e001tuw68p5vrat7j	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-13 14:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1731506400000.jpg
cmjn2x8tn0155uwkcgu8nv99m	cmjmp3j9e001tuw68p5vrat7j	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-15 16:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1731686400000.jpg
cmjn2x8vu0157uwkchridgy29	cmjmp3j9e001tuw68p5vrat7j	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-18 10:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1731924000000.jpg
cmjn2x8y10159uwkcamqilcm4	cmjmp3j9e001tuw68p5vrat7j	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-20 14:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1732111200000.jpg
cmjn2x91j015buwkclpd2umsn	cmjmp3j9e001tuw68p5vrat7j	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-22 16:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1732291200000.jpg
cmjn2x93q015duwkc2rfdcpap	cmjmp3j9e001tuw68p5vrat7j	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-25 10:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1732528800000.jpg
cmjn2x965015fuwkciweyksfq	cmjmp3j9e001tuw68p5vrat7j	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-27 14:00:00	\N
cmjn2x98c015huwkcfiz76n7r	cmjmp3j9e001tuw68p5vrat7j	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-29 16:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1732896000000.jpg
cmjn2x9ap015juwkc5ytwzvl1	cmjmp3j9e001tuw68p5vrat7j	cmjhfi59p0013uwp4phh6bazf	t	2024-11-11 10:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1731319200000.jpg
cmjn2x9d1015luwkcruymkiwi	cmjmp3j9e001tuw68p5vrat7j	cmjhfi59p0013uwp4phh6bazf	t	2024-11-13 14:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1731506400000.jpg
cmjn2x9f7015nuwkc7kez3xiz	cmjmp3j9e001tuw68p5vrat7j	cmjhfi59p0013uwp4phh6bazf	f	2024-11-15 16:00:00	\N
cmjn2x9im015puwkcjlr921q8	cmjmp3j9e001tuw68p5vrat7j	cmjhfi59p0013uwp4phh6bazf	f	2024-11-18 10:00:00	\N
cmjn2x9ks015ruwkcsoq6ucl4	cmjmp3j9e001tuw68p5vrat7j	cmjhfi59p0013uwp4phh6bazf	t	2024-11-20 14:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1732111200000.jpg
cmjn2x9n7015tuwkc54f0ng5l	cmjmp3j9e001tuw68p5vrat7j	cmjhfi59p0013uwp4phh6bazf	t	2024-11-22 16:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1732291200000.jpg
cmjn2x9pd015vuwkc1mgegk68	cmjmp3j9e001tuw68p5vrat7j	cmjhfi59p0013uwp4phh6bazf	t	2024-11-25 10:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1732528800000.jpg
cmjn2x9rs015xuwkc10uju1px	cmjmp3j9e001tuw68p5vrat7j	cmjhfi59p0013uwp4phh6bazf	t	2024-11-27 14:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1732716000000.jpg
cmjn2x9tz015zuwkcrliy93am	cmjmp3j9e001tuw68p5vrat7j	cmjhfi59p0013uwp4phh6bazf	t	2024-11-29 16:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1732896000000.jpg
cmjn2x9w40161uwkcwa0nyz59	cmjmp3j9e001tuw68p5vrat7j	cmjhfjbal0017uwp4f068vsfb	f	2024-11-11 10:00:00	\N
cmjn2x9ya0163uwkcbek8tj0k	cmjmp3j9e001tuw68p5vrat7j	cmjhfjbal0017uwp4f068vsfb	f	2024-11-13 14:00:00	\N
cmjn2xa1s0165uwkcrhotrj4c	cmjmp3j9e001tuw68p5vrat7j	cmjhfjbal0017uwp4f068vsfb	t	2024-11-15 16:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1731686400000.jpg
cmjn2xa490167uwkcz7bvy8v8	cmjmp3j9e001tuw68p5vrat7j	cmjhfjbal0017uwp4f068vsfb	f	2024-11-18 10:00:00	\N
cmjn2xa6f0169uwkcnl4xazoy	cmjmp3j9e001tuw68p5vrat7j	cmjhfjbal0017uwp4f068vsfb	f	2024-11-20 14:00:00	\N
cmjn2xa8u016buwkc4wqu6ist	cmjmp3j9e001tuw68p5vrat7j	cmjhfjbal0017uwp4f068vsfb	t	2024-11-22 16:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1732291200000.jpg
cmjn2xab0016duwkc45nimjpi	cmjmp3j9e001tuw68p5vrat7j	cmjhfjbal0017uwp4f068vsfb	t	2024-11-25 10:00:00	uploads/attendance/cmjmp3j9e001tuw68p5vrat7j_1732528800000.jpg
cmjn2xad6016fuwkcm2p6x9u0	cmjmp3j9e001tuw68p5vrat7j	cmjhfjbal0017uwp4f068vsfb	f	2024-11-27 14:00:00	\N
cmjn2xafc016huwkc7k6crkoa	cmjmp3j9e001tuw68p5vrat7j	cmjhfjbal0017uwp4f068vsfb	f	2024-11-29 16:00:00	\N
cmjn2xaiv016juwkc7vvqvth8	cmjmp3nqr001wuw68rhiuoz5l	cmjhfan4k000nuwp4vne02gie	f	2024-11-11 10:00:00	\N
cmjn2xalc016luwkcrwqslkkv	cmjmp3nqr001wuw68rhiuoz5l	cmjhfan4k000nuwp4vne02gie	t	2024-11-13 14:00:00	uploads/attendance/cmjmp3nqr001wuw68rhiuoz5l_1731506400000.jpg
cmjn2xani016nuwkc9o7u8e9i	cmjmp3nqr001wuw68rhiuoz5l	cmjhfan4k000nuwp4vne02gie	f	2024-11-15 16:00:00	\N
cmjn2xapx016puwkcaxx24161	cmjmp3nqr001wuw68rhiuoz5l	cmjhfan4k000nuwp4vne02gie	f	2024-11-18 10:00:00	\N
cmjn2xas3016ruwkcimsgqpnt	cmjmp3nqr001wuw68rhiuoz5l	cmjhfan4k000nuwp4vne02gie	t	2024-11-20 14:00:00	uploads/attendance/cmjmp3nqr001wuw68rhiuoz5l_1732111200000.jpg
cmjn2xauc016tuwkcq7ds8m9e	cmjmp3nqr001wuw68rhiuoz5l	cmjhfan4k000nuwp4vne02gie	f	2024-11-22 16:00:00	\N
cmjn2xawi016vuwkc09k6k67q	cmjmp3nqr001wuw68rhiuoz5l	cmjhfan4k000nuwp4vne02gie	t	2024-11-25 10:00:00	uploads/attendance/cmjmp3nqr001wuw68rhiuoz5l_1732528800000.jpg
cmjn2xayn016xuwkcblp248tw	cmjmp3nqr001wuw68rhiuoz5l	cmjhfan4k000nuwp4vne02gie	t	2024-11-27 14:00:00	uploads/attendance/cmjmp3nqr001wuw68rhiuoz5l_1732716000000.jpg
cmjn2xb0u016zuwkci3so7e03	cmjmp3nqr001wuw68rhiuoz5l	cmjhfan4k000nuwp4vne02gie	t	2024-11-29 16:00:00	uploads/attendance/cmjmp3nqr001wuw68rhiuoz5l_1732896000000.jpg
cmjn2xb300171uwkcqj8t5k3i	cmjmp3nqr001wuw68rhiuoz5l	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-11 10:00:00	\N
cmjn2xb560173uwkc07qo6k03	cmjmp3nqr001wuw68rhiuoz5l	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-13 14:00:00	\N
cmjn2xb7b0175uwkct24nwntu	cmjmp3nqr001wuw68rhiuoz5l	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-15 16:00:00	uploads/attendance/cmjmp3nqr001wuw68rhiuoz5l_1731686400000.jpg
cmjn2xb9h0177uwkc3ib18nam	cmjmp3nqr001wuw68rhiuoz5l	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-18 10:00:00	\N
cmjn2xbbn0179uwkc8ihmsshj	cmjmp3nqr001wuw68rhiuoz5l	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-20 14:00:00	uploads/attendance/cmjmp3nqr001wuw68rhiuoz5l_1732111200000.jpg
cmjn2xbdt017buwkc33kfirau	cmjmp3nqr001wuw68rhiuoz5l	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-22 16:00:00	uploads/attendance/cmjmp3nqr001wuw68rhiuoz5l_1732291200000.jpg
cmjn2xbfz017duwkcve8mlvvr	cmjmp3nqr001wuw68rhiuoz5l	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-25 10:00:00	\N
cmjn2xbi4017fuwkc0urg7q28	cmjmp3nqr001wuw68rhiuoz5l	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-27 14:00:00	uploads/attendance/cmjmp3nqr001wuw68rhiuoz5l_1732716000000.jpg
cmjn2xbka017huwkc6mbzeugu	cmjmp3nqr001wuw68rhiuoz5l	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-29 16:00:00	uploads/attendance/cmjmp3nqr001wuw68rhiuoz5l_1732896000000.jpg
cmjn2xbmh017juwkc467sd2zb	cmjmp3nqr001wuw68rhiuoz5l	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-11 10:00:00	uploads/attendance/cmjmp3nqr001wuw68rhiuoz5l_1731319200000.jpg
cmjn2xbon017luwkcwn5kbwsa	cmjmp3nqr001wuw68rhiuoz5l	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-13 14:00:00	\N
cmjn2xbqt017nuwkcmreymqr1	cmjmp3nqr001wuw68rhiuoz5l	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-15 16:00:00	\N
cmjn2xbsz017puwkcr8n8hl56	cmjmp3nqr001wuw68rhiuoz5l	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-18 10:00:00	\N
cmjn2xbv5017ruwkcljd6smt7	cmjmp3nqr001wuw68rhiuoz5l	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-20 14:00:00	\N
cmjn2xbxc017tuwkcwbvja2e3	cmjmp3nqr001wuw68rhiuoz5l	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-22 16:00:00	\N
cmjn2xbzi017vuwkciytcu1g2	cmjmp3nqr001wuw68rhiuoz5l	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-25 10:00:00	\N
cmjn2xc1o017xuwkcx9iehxpp	cmjmp3nqr001wuw68rhiuoz5l	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-27 14:00:00	\N
cmjn2xc3u017zuwkckh6fsi9x	cmjmp3nqr001wuw68rhiuoz5l	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-29 16:00:00	\N
cmjn2xc600181uwkcgvc4odh0	cmjmp3nqr001wuw68rhiuoz5l	cmjhfi59p0013uwp4phh6bazf	f	2024-11-11 10:00:00	\N
cmjn2xc860183uwkcrod7veke	cmjmp3nqr001wuw68rhiuoz5l	cmjhfi59p0013uwp4phh6bazf	t	2024-11-13 14:00:00	uploads/attendance/cmjmp3nqr001wuw68rhiuoz5l_1731506400000.jpg
cmjn2xcac0185uwkcqtkid6gf	cmjmp3nqr001wuw68rhiuoz5l	cmjhfi59p0013uwp4phh6bazf	t	2024-11-15 16:00:00	uploads/attendance/cmjmp3nqr001wuw68rhiuoz5l_1731686400000.jpg
cmjn2xccj0187uwkc4987xw5j	cmjmp3nqr001wuw68rhiuoz5l	cmjhfi59p0013uwp4phh6bazf	f	2024-11-18 10:00:00	\N
cmjn2xcep0189uwkc9val5g0z	cmjmp3nqr001wuw68rhiuoz5l	cmjhfi59p0013uwp4phh6bazf	t	2024-11-20 14:00:00	uploads/attendance/cmjmp3nqr001wuw68rhiuoz5l_1732111200000.jpg
cmjn2xcgv018buwkc7kiwgjcp	cmjmp3nqr001wuw68rhiuoz5l	cmjhfi59p0013uwp4phh6bazf	f	2024-11-22 16:00:00	\N
cmjn2xcj0018duwkc0stc75aa	cmjmp3nqr001wuw68rhiuoz5l	cmjhfi59p0013uwp4phh6bazf	t	2024-11-25 10:00:00	uploads/attendance/cmjmp3nqr001wuw68rhiuoz5l_1732528800000.jpg
cmjn2xcl6018fuwkcecc8vdc0	cmjmp3nqr001wuw68rhiuoz5l	cmjhfi59p0013uwp4phh6bazf	t	2024-11-27 14:00:00	uploads/attendance/cmjmp3nqr001wuw68rhiuoz5l_1732716000000.jpg
cmjn2xcnb018huwkcb6ucswis	cmjmp3nqr001wuw68rhiuoz5l	cmjhfi59p0013uwp4phh6bazf	f	2024-11-29 16:00:00	\N
cmjn2xcpi018juwkcbkb634k8	cmjmp3nqr001wuw68rhiuoz5l	cmjhfjbal0017uwp4f068vsfb	f	2024-11-11 10:00:00	\N
cmjn2xcrp018luwkc08w218a4	cmjmp3nqr001wuw68rhiuoz5l	cmjhfjbal0017uwp4f068vsfb	t	2024-11-13 14:00:00	uploads/attendance/cmjmp3nqr001wuw68rhiuoz5l_1731506400000.jpg
cmjn2xcu4018nuwkczqwmitgz	cmjmp3nqr001wuw68rhiuoz5l	cmjhfjbal0017uwp4f068vsfb	t	2024-11-15 16:00:00	uploads/attendance/cmjmp3nqr001wuw68rhiuoz5l_1731686400000.jpg
cmjn2xcwb018puwkcu3tqox6v	cmjmp3nqr001wuw68rhiuoz5l	cmjhfjbal0017uwp4f068vsfb	f	2024-11-18 10:00:00	\N
cmjn2xcyh018ruwkch10s7a9p	cmjmp3nqr001wuw68rhiuoz5l	cmjhfjbal0017uwp4f068vsfb	t	2024-11-20 14:00:00	uploads/attendance/cmjmp3nqr001wuw68rhiuoz5l_1732111200000.jpg
cmjn2xd0n018tuwkca20jrcwu	cmjmp3nqr001wuw68rhiuoz5l	cmjhfjbal0017uwp4f068vsfb	t	2024-11-22 16:00:00	uploads/attendance/cmjmp3nqr001wuw68rhiuoz5l_1732291200000.jpg
cmjn2xd2s018vuwkcay5zpfpa	cmjmp3nqr001wuw68rhiuoz5l	cmjhfjbal0017uwp4f068vsfb	t	2024-11-25 10:00:00	uploads/attendance/cmjmp3nqr001wuw68rhiuoz5l_1732528800000.jpg
cmjn2xd4y018xuwkczgcynpy2	cmjmp3nqr001wuw68rhiuoz5l	cmjhfjbal0017uwp4f068vsfb	t	2024-11-27 14:00:00	uploads/attendance/cmjmp3nqr001wuw68rhiuoz5l_1732716000000.jpg
cmjn2xd73018zuwkcvx07z9y7	cmjmp3nqr001wuw68rhiuoz5l	cmjhfjbal0017uwp4f068vsfb	t	2024-11-29 16:00:00	uploads/attendance/cmjmp3nqr001wuw68rhiuoz5l_1732896000000.jpg
cmjn2xd980191uwkc174prcwv	cmjmp3o98001zuw686r7i6uqi	cmjhfan4k000nuwp4vne02gie	t	2024-11-11 10:00:00	uploads/attendance/cmjmp3o98001zuw686r7i6uqi_1731319200000.jpg
cmjn2xdbd0193uwkce7ys338h	cmjmp3o98001zuw686r7i6uqi	cmjhfan4k000nuwp4vne02gie	t	2024-11-13 14:00:00	uploads/attendance/cmjmp3o98001zuw686r7i6uqi_1731506400000.jpg
cmjn2xddj0195uwkc5qvr5w8f	cmjmp3o98001zuw686r7i6uqi	cmjhfan4k000nuwp4vne02gie	f	2024-11-15 16:00:00	\N
cmjn2xdfp0197uwkccho8sl9x	cmjmp3o98001zuw686r7i6uqi	cmjhfan4k000nuwp4vne02gie	f	2024-11-18 10:00:00	\N
cmjn2xdhv0199uwkcyegxiv2g	cmjmp3o98001zuw686r7i6uqi	cmjhfan4k000nuwp4vne02gie	t	2024-11-20 14:00:00	uploads/attendance/cmjmp3o98001zuw686r7i6uqi_1732111200000.jpg
cmjn2xdk1019buwkcckzheww8	cmjmp3o98001zuw686r7i6uqi	cmjhfan4k000nuwp4vne02gie	f	2024-11-22 16:00:00	\N
cmjn2xdm8019duwkc2ndyhdzz	cmjmp3o98001zuw686r7i6uqi	cmjhfan4k000nuwp4vne02gie	f	2024-11-25 10:00:00	\N
cmjn2xdp9019fuwkcd9gnkil4	cmjmp3o98001zuw686r7i6uqi	cmjhfan4k000nuwp4vne02gie	t	2024-11-27 14:00:00	uploads/attendance/cmjmp3o98001zuw686r7i6uqi_1732716000000.jpg
cmjn2xdrn019huwkcz13tny2o	cmjmp3o98001zuw686r7i6uqi	cmjhfan4k000nuwp4vne02gie	f	2024-11-29 16:00:00	\N
cmjn2xdtw019juwkctm6tpfl2	cmjmp3o98001zuw686r7i6uqi	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-11 10:00:00	uploads/attendance/cmjmp3o98001zuw686r7i6uqi_1731319200000.jpg
cmjn2xdw2019luwkcoqeg46zk	cmjmp3o98001zuw686r7i6uqi	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-13 14:00:00	uploads/attendance/cmjmp3o98001zuw686r7i6uqi_1731506400000.jpg
cmjn2xdy8019nuwkcjcds9811	cmjmp3o98001zuw686r7i6uqi	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-15 16:00:00	uploads/attendance/cmjmp3o98001zuw686r7i6uqi_1731686400000.jpg
cmjn2xe2q019puwkcd1rmf9ac	cmjmp3o98001zuw686r7i6uqi	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-18 10:00:00	uploads/attendance/cmjmp3o98001zuw686r7i6uqi_1731924000000.jpg
cmjn2xe4v019ruwkcc7bbxgrd	cmjmp3o98001zuw686r7i6uqi	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-20 14:00:00	uploads/attendance/cmjmp3o98001zuw686r7i6uqi_1732111200000.jpg
cmjn2xe8f019tuwkc8e1vstbf	cmjmp3o98001zuw686r7i6uqi	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-22 16:00:00	\N
cmjn2xeal019vuwkcm1v4oi3b	cmjmp3o98001zuw686r7i6uqi	cmjhfc2bv000ruwp46tw5y3q6	t	2024-11-25 10:00:00	uploads/attendance/cmjmp3o98001zuw686r7i6uqi_1732528800000.jpg
cmjn2xee3019xuwkccyvgiukm	cmjmp3o98001zuw686r7i6uqi	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-27 14:00:00	\N
cmjn2xeg9019zuwkcw4pd9n20	cmjmp3o98001zuw686r7i6uqi	cmjhfc2bv000ruwp46tw5y3q6	f	2024-11-29 16:00:00	\N
cmjn2xejt01a1uwkcrxecxmqf	cmjmp3o98001zuw686r7i6uqi	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-11 10:00:00	\N
cmjn2xem001a3uwkc1kiss4x7	cmjmp3o98001zuw686r7i6uqi	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-13 14:00:00	\N
cmjn2xeph01a5uwkcagm29kt0	cmjmp3o98001zuw686r7i6uqi	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-15 16:00:00	uploads/attendance/cmjmp3o98001zuw686r7i6uqi_1731686400000.jpg
cmjn2xern01a7uwkcwp18qf3v	cmjmp3o98001zuw686r7i6uqi	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-18 10:00:00	\N
cmjn2xev601a9uwkcd2zosqfm	cmjmp3o98001zuw686r7i6uqi	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-20 14:00:00	uploads/attendance/cmjmp3o98001zuw686r7i6uqi_1732111200000.jpg
cmjn2xexd01abuwkcvw24y5ih	cmjmp3o98001zuw686r7i6uqi	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-22 16:00:00	\N
cmjn2xf0v01aduwkctkz8kc6p	cmjmp3o98001zuw686r7i6uqi	cmjhffwhw000xuwp4a9wetdiq	f	2024-11-25 10:00:00	\N
cmjn2xf3101afuwkcb6rlapdn	cmjmp3o98001zuw686r7i6uqi	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-27 14:00:00	uploads/attendance/cmjmp3o98001zuw686r7i6uqi_1732716000000.jpg
cmjn2xf6k01ahuwkcrlf3xfry	cmjmp3o98001zuw686r7i6uqi	cmjhffwhw000xuwp4a9wetdiq	t	2024-11-29 16:00:00	uploads/attendance/cmjmp3o98001zuw686r7i6uqi_1732896000000.jpg
cmjn2xf8r01ajuwkcrjumw82g	cmjmp3o98001zuw686r7i6uqi	cmjhfi59p0013uwp4phh6bazf	f	2024-11-11 10:00:00	\N
cmjn2xfc901aluwkcyhaqp4yy	cmjmp3o98001zuw686r7i6uqi	cmjhfi59p0013uwp4phh6bazf	t	2024-11-13 14:00:00	uploads/attendance/cmjmp3o98001zuw686r7i6uqi_1731506400000.jpg
cmjn2xfee01anuwkc4kzh8g4u	cmjmp3o98001zuw686r7i6uqi	cmjhfi59p0013uwp4phh6bazf	f	2024-11-15 16:00:00	\N
cmjn2xfhy01apuwkcyu8zuy7a	cmjmp3o98001zuw686r7i6uqi	cmjhfi59p0013uwp4phh6bazf	t	2024-11-18 10:00:00	uploads/attendance/cmjmp3o98001zuw686r7i6uqi_1731924000000.jpg
cmjn2xfk301aruwkcakekxgdk	cmjmp3o98001zuw686r7i6uqi	cmjhfi59p0013uwp4phh6bazf	t	2024-11-20 14:00:00	uploads/attendance/cmjmp3o98001zuw686r7i6uqi_1732111200000.jpg
cmjn2xfnm01atuwkcbjvcx9na	cmjmp3o98001zuw686r7i6uqi	cmjhfi59p0013uwp4phh6bazf	f	2024-11-22 16:00:00	\N
cmjn2xfps01avuwkcq29znpbi	cmjmp3o98001zuw686r7i6uqi	cmjhfi59p0013uwp4phh6bazf	t	2024-11-25 10:00:00	uploads/attendance/cmjmp3o98001zuw686r7i6uqi_1732528800000.jpg
cmjn2xftc01axuwkc8kmyb69i	cmjmp3o98001zuw686r7i6uqi	cmjhfi59p0013uwp4phh6bazf	t	2024-11-27 14:00:00	uploads/attendance/cmjmp3o98001zuw686r7i6uqi_1732716000000.jpg
cmjn2xfvh01azuwkcu3ym4p03	cmjmp3o98001zuw686r7i6uqi	cmjhfi59p0013uwp4phh6bazf	f	2024-11-29 16:00:00	\N
cmjn2xfz001b1uwkcidlcimcg	cmjmp3o98001zuw686r7i6uqi	cmjhfjbal0017uwp4f068vsfb	t	2024-11-11 10:00:00	uploads/attendance/cmjmp3o98001zuw686r7i6uqi_1731319200000.jpg
cmjn2xg1f01b3uwkc17mpt6v8	cmjmp3o98001zuw686r7i6uqi	cmjhfjbal0017uwp4f068vsfb	f	2024-11-13 14:00:00	\N
cmjn2xg4p01b5uwkc0r9y5y3x	cmjmp3o98001zuw686r7i6uqi	cmjhfjbal0017uwp4f068vsfb	f	2024-11-15 16:00:00	\N
cmjn2xg6u01b7uwkcebqu9n39	cmjmp3o98001zuw686r7i6uqi	cmjhfjbal0017uwp4f068vsfb	f	2024-11-18 10:00:00	\N
cmjn2xgae01b9uwkcmbtav79a	cmjmp3o98001zuw686r7i6uqi	cmjhfjbal0017uwp4f068vsfb	t	2024-11-20 14:00:00	uploads/attendance/cmjmp3o98001zuw686r7i6uqi_1732111200000.jpg
cmjn2xgcl01bbuwkcosf58tft	cmjmp3o98001zuw686r7i6uqi	cmjhfjbal0017uwp4f068vsfb	t	2024-11-22 16:00:00	uploads/attendance/cmjmp3o98001zuw686r7i6uqi_1732291200000.jpg
cmjn2xgg201bduwkcmbmfdfnv	cmjmp3o98001zuw686r7i6uqi	cmjhfjbal0017uwp4f068vsfb	f	2024-11-25 10:00:00	\N
cmjn2xgi801bfuwkcaqg9zvj8	cmjmp3o98001zuw686r7i6uqi	cmjhfjbal0017uwp4f068vsfb	t	2024-11-27 14:00:00	uploads/attendance/cmjmp3o98001zuw686r7i6uqi_1732716000000.jpg
cmjn2xgke01bhuwkcb8tdw8ij	cmjmp3o98001zuw686r7i6uqi	cmjhfjbal0017uwp4f068vsfb	f	2024-11-29 16:00:00	\N
cmkz762n90001uwz4b64vpzuv	cmjmoth65000huw68ccd5lcum	cmjhffwhw000xuwp4a9wetdiq	f	2026-01-29 08:37:08.503	\N
cmkz763250007uwz4x45o01bq	cmjmotjb8000quw68xhfdwm78	cmjhffwhw000xuwp4a9wetdiq	f	2026-01-29 08:37:08.503	\N
cmkz763250005uwz4iezqrqek	cmjmotirp000nuw68id39qyhh	cmjhffwhw000xuwp4a9wetdiq	f	2026-01-29 08:37:08.503	\N
cmkz7633y000juwz4f68c9r8d	cmjmotjvx000tuw68op9coyz1	cmjhffwhw000xuwp4a9wetdiq	f	2026-01-29 08:37:08.503	\N
cmkz763260009uwz4r8yx4gpv	cmjmotkfp000wuw68qz9bsq2s	cmjhffwhw000xuwp4a9wetdiq	f	2026-01-29 08:37:08.503	\N
cmkz76328000duwz4knpdma2o	cmjmotlii0012uw6852e1cgvs	cmjhffwhw000xuwp4a9wetdiq	f	2026-01-29 08:37:08.503	\N
cmkz763250003uwz46f26zgmi	cmjolble20002uww4eeqi9nej	cmjhffwhw000xuwp4a9wetdiq	t	2026-01-29 08:37:08.503	\N
cmkz76326000buwz4zfcwqiqg	cmjmotkz8000zuw68ill1bls5	cmjhffwhw000xuwp4a9wetdiq	f	2026-01-29 08:37:08.503	\N
cmkz7633y000huwz4juti2fgc	cmjmotm1v0015uw68sq6vm3kl	cmjhffwhw000xuwp4a9wetdiq	f	2026-01-29 08:37:08.503	\N
cmkz76329000fuwz4bb55z5x4	cmjmotmli0018uw6849d5t2tg	cmjhffwhw000xuwp4a9wetdiq	f	2026-01-29 08:37:08.503	\N
cmkz76342000luwz4aw000u42	cmjmoti6n000kuw6833e9g8fr	cmjhffwhw000xuwp4a9wetdiq	f	2026-01-29 08:37:08.503	\N
\.


--
-- Data for Name: Course; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Course" (id, name, code, "entryCode", "teacherId", "semesterId") FROM stdin;
cmjhfan4k000nuwp4vne02gie	Database Management Systems	CS-501	W288OM	cmjhf08z40006uwp49dc4fxqs	cmjhfamsj000luwp4zbehlu8e
cmjhfc2bv000ruwp46tw5y3q6	Cybersecurity	CS-701	UGOA3F	cmjheyarr0003uwp426mxjui8	cmjhfc269000puwp4tfqeuod9
cmjhffwhw000xuwp4a9wetdiq	Natural Language Processing	IT-701	WJFSWB	cmi1tfnzj0003uw9clylz25ae	cmjhffw93000vuwp49vpowk8n
cmjhfi59p0013uwp4phh6bazf	Java Programming	IT-501	1NOV8B	cmjhf19iw0009uwp4qzxupcx3	cmjhfi5550011uwp4q3rv15vx
cmjhfjbal0017uwp4f068vsfb	C Programming	IT-301	1BWF21	cmi1tfnzj0003uw9clylz25ae	cmjhfjb650015uwp4ed0u6x0o
\.


--
-- Data for Name: Department; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Department" (id, name) FROM stdin;
cmi1tfhog0001uw9c3noro212	Information Technology
cmjhev7nn0000uwp4t7wkx40j	Computer Science
\.


--
-- Data for Name: Program; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Program" (id, name, "departmentId") FROM stdin;
cmjhf5lbn000buwp4ldob8nzk	B.Tech in Computer Science & Engineering	cmjhev7nn0000uwp4t7wkx40j
cmjhf6i4v000duwp4jjwiwt82	B.Tech in Artificial Intelligence	cmjhev7nn0000uwp4t7wkx40j
cmjhf864m000fuwp44amopano	B.Tech in Information Technology	cmi1tfhog0001uw9c3noro212
cmjhf8tpt000huwp4bch0j5nn	B.Tech in Software Engineering	cmi1tfhog0001uw9c3noro212
\.


--
-- Data for Name: Semester; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Semester" (id, name, "academicYearId") FROM stdin;
cmjhfamsj000luwp4zbehlu8e	Semester 5	cmjhfamg7000juwp4vb5xkji4
cmjhfc269000puwp4tfqeuod9	Semester 7	cmjhfamg7000juwp4vb5xkji4
cmjhffw93000vuwp49vpowk8n	Semester 7	cmjhffw0a000tuwp4edwu77v4
cmjhfi5550011uwp4q3rv15vx	Semester 5	cmjhfi4zg000zuwp4rmdwr2l7
cmjhfjb650015uwp4ed0u6x0o	Semester 3	cmjhffw0a000tuwp4edwu77v4
\.


--
-- Data for Name: Student; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Student" (id, "userId", "programId", "faceEmbedding", "joinedAt", status) FROM stdin;
cmjmoth65000huw68ccd5lcum	cmjmoth64000fuw68m9cjpigi	cmjhf864m000fuwp44amopano	\\xe468613c206dfc3c3af8cabc4780563d0ac0a5bda2990d3c6e7a963c2a4d93bc47432f3dc8d498bb4e9acdbbc05445bdbf0864bdf3aed4bd2148dcbd8531b7ba13d002bda0c097bd356060bdec8357bdbfeb3bbdbcdea4bbc553abbd69f2ab3dd7424cbdc3d1a03cd4ea67bbe0a632bdd077db3c5ff01bbd48febbbbbc7a03bdcd6f2ebc81642fbc23f4e63b93414abd1571f5bb40aa953c318244bdce40f0bcfba3a6bda781a43d104df0bb78fe1d3b8fc0debc567f5abc0c13533c5c052a3db0ae97bc2a15463d13ed0e3d38eda5bc2eb67c3cf0269a3cfb3861bc572de93c09fe823b17b7c9bb9a8fc7bca1c486bc89014bbd7a7cfdbc3fc3d4bc5593a2bc16453b3d124f49bd0ca1f23c986d82bc31d807bde219fe3b54f1133d29170ebd9d4f33bc1c8435bd2fb9b73c2a961dba3d4152bd04729e3d0f80edbc3d7080bc25a60e3dbe8a2c3d61a6c33c420752bb9e973a3d4a9f2cbdb66e3f3d9a68473ded7545bd1b2d493d7cf50abd6630413e32964c3c9d44883dadf4ceba89d4eb3c839793bda66bc43cfcf5f93c5176ba3bd8151e3dc6d293bc6611e5bc64da9d3d00e23fbc6bd818bde6de15bc2099a0bd4ca8703b5460a13c54160a3d4989693d90f635bd6d06fcbb4b7483bd952f76bd1624313d33d262bd89b353bc6bd8ddbac5cbbcbd2e341e3dbe28333d0ad5933cfdb2a93cc85543ba0bcfad3c0a832cbdb704fbbcae543abc248928bd5a3939bd28e9fe3c214ea63df2a845bd4d1182bd7cf6dcbc34662a3d37e48a3ce02f2cbc56d5423d1b5c1ebcb5003c3c4374dd3be65689bd3e39303c1750203de807413dd972a93c8e6f123d8577c6bc2fe037bda5b2ac3a91d6993a80a85ebcdb64cc39c251a13d40826abd02db703d7907773931b21abb6da3233d1d94223da9b7163cef77773c3bf17c3c8cb84ebc62f60abc9cbe09be58a68b3d234805bcf5f2153bb4b119bd55b288bd953d403cd7300b3c8d9cd63c6c4838bdc4d4223de34194bd8e80093bcacc90bc32a7443dae9dfcbc6a48223df05f833de29b273dde465ebd83170c3d790f533d2c8c33bd7552203dcf488f3c367e6f3d688bf1bc2fc8253c5dba5d3d7ebeb23c248135bd7df5903bc7e5fb3ce51483bd124bbc3cb48d78bcb608f7bc4d8c4bbacd5725bde2edb43bbe07c3bbc73eaa3ce54d83bd9b2f96bc8b5b59bd587f1bbbc827a4bda1e889bd455984bc8a4a59bd11cb6ebda5dbf5bcc4f358bdb32c88bcf6b683bc611b1fbde9e632bd0bf28bbc5e4d06bdf36395bce90273bcc26a1c3ddbb44a3d3b03613c9a5eba3b88c79e3c4c87733dc5cf35bdcf3186bc9fea43bd3729523cde06853dd619633c3cba99bdb4fbebbd6d01003b7527a53d9549133d8aa1d53da5012fbbbf08ac3ca6f6293dc3c4a0babc4ffa3c6c420abd0a1f903cb58a0abd8af6bebbff470bbb38f34bbd334919bda4b830bdfb9760bda9c0bcbde11042bcafc782bcf33f5bbd1b23b0bc20b321bd5ebd9b3cb869013dabbf37bdea68343c1db89abd37f15e3de8ee1e3de69a62bddd6413bc65c81a3d37b7d63c4e90c53dbd67fdbc81b514bd80019fbd818a423c613e023d45e047bdbb869fbc7ef7653d225a2abada3e973da2545fbda8cb333c5193f3bc8c59983d6ac33ebd32b92fbd87cee3bb40df723c32751abd29151e3dc545d6bbe05bb3bc610eb53b3144b53d0d1742bd23ca2e3c87b3c7bbf1076dbcd5037c3dad476dbddcaf593c4c74943df0fea5bda9e711bdf6cf353cc3221c3da36b0b3d04940cbd6380323dda5e723daecb0cba0ac599bc6f17a4bd91b8fa3c3e3d5c3dd77812bd27f22d3d5fea2ebde61f7c3d575d613d4d41cc3c49de07be7522edbcf539a73ccb9c803df91a303d70cd243d9805a2bdde4e6dbca901063d918cbb3d5861e8bcb35cc73cbe7a72bc672eb8bcd270c1bc52033ebd516559bd93cdcf3c41065c3c9889803ca34e503ddacf87bc6913afbbc915a1bdcd0546bdfadf133d62523bbc2b50053d4d0d0d3d1e6ccbbc7ffd7f3ca36b603c804026bdf81be3bb9ea587bac7322dbd5bfefbbcd6365fbd1175403c8e0abbbb66c6ba3c88edd1bcfc97ca3c0c8922bd477ecebc318663bd66820a3df7f073377f51863c1c41dd3bf23a39bdea0e173c7c53193d6f2f5cbd0f7078bc0abb9cbdf867643d9bdb283df4652ebdc60b203dbb9b65bc4170053d527b94bce99180bc138c60bd7dfc663dca5f99bc91b32ebd732b4c3d3d7278bd1a8b2d3c0ccf8e3ce81c8cbcef341b3cf8e944bdece62e3d3bb40fbde266d1bd0ed6913d140439bd0ee2a2bd1309cabc6c0ab1bc0b059abdf6a524bd6f9016bd87a3f03ccbb3843c68450dbd23054dbd356c9c3bc7f9243defca51bd3d8d12bd2d038abd292e5bbb958a173d1f3dc43dce6da5bc3e1c73bd9bc70f3c2bd2c53ddfabbe3d502e08be99a8193ddf9552bd4017283c47531dbc11e2b63ddb22303d9899883c6a4a553bbffcb6bc3d1415bc017fefbc3b43463d259ab1bce541a63c753212bde11d49bc0606923a38d50a3c6681ba3d0736973cea903d3dc575b53d053277bdfc4ebdbbce8d1fbd8e57f03c68378abd835e5dbd930e91bd9667a1bdc56ebfbceca0b73c28d63ebdded034bd6c9d66bdfd94613d3280b63db95aa1bd07f4363dc3b5933db323003d5700213ce4066fbc7b479ebd70acd1bcd2e10e3d7ac79c3c7c23dfbbd6c2673d6c94a03cdb2d46bc2de6453d293b4d3c54140a3d117ba3bd86fcd23d9507abbc61b2673c8ac870bc614b703c743b543b156b513cee5a30bb120105bddeadccbc502b4abd05bea63cb446a43dcfe69bbc82f34cbc633e0a3d6c91363cc50ddd3c95d8e53be1e8c33c97643fbc64b3593c615c6a3c	2025-12-26 09:46:56.429	active
cmjmoti6n000kuw6833e9g8fr	cmjmoti6n000iuw68pboii828	cmjhf864m000fuwp44amopano	\\xcc317b3d4474c0bbeca30abd11b661bd12ec1fbdd8a95a3c2060dbbc0fcd9a3c78671b3d7ed9ab3d4e44ecbb389267bca64d97bc78f49c3bf8dd7dbda62db9bdf634063da644593c1919083d5fed583c1a14c0bc22355abdc1cfb6bcc1d732bdfad9b93ca3df103d935df7ba8e30583de52635bdb75d0ebd6dc3213c11ba1d3c477f7e3d326146bd6e72b33dc1207a3c21b8a9bd937e123d8620953cbb66a23c6796fe3c0c569cbc66ecbf3cba26d63c766134bc8f91593c14a6a13bff2aa63cb727c639242cae3d47713bbc7575ccbb46aa113a5bec77bdfc12883d78bb973da4ec93bd724c803c771c803de2df25bd36a3fa3b7ba68ebd4c774fbc56d4cabca5f6853d3b39633da1171fbd8a81e63c127473bc069ddd3bfdc80f3c13b33d3d613c593dacc52bbd8bde933cee1aa13cfde87fbda2654e3d484e73bcd63ad83c2873283dbf1b3e3c6e790f3c11d25c3cc113ab3c6cf895bcc4dd3b3d77dd20bc3ea381bd354c9cbc9593a63d5342b53daffcaabd2eca903d4acda83c0f24a53c12130cbdf302263d0e1d06bdfaaefd3c9ad0283c5d547bbc539aa93cd0b4d63bf86ca33b062150bd38cc853da4a68e3cb3ced43c1cab883d1054293da5ba0c3c8d12dc3be451c8ba9dd1b03ae47e54bd8998aabcde68e1bc6a20643c0002973c673ccbbde5f1fc3bffc11b3c892382bd94c409bd512635bd8f30073d01950abd3dafa83d58e3c8bc1bace7bc1d02303daf5f483c6616103b91ff9abc587b0c3df0d3acbc44094d3d275073bcf6022dbd0a321bbdd21d043ae0ef47bdc99cb2bd2bbeabbc47d911bdc1891d3c57c7473cb2e7a6bd91c8df3c12c75b3c1840c1bcdffbd9bcd88a253c4b48f53b4b48fb3c3d18aa3c1dec8cbbff6d213cb7b88b3c308993bc4ab042bcc81cfcbcb3007abd130a8ebc6d1ee03c14a146bdd00867bdfd1787bb619454bde004183d000b803c219280bdaef9e43de85213bb5ef6973c3bb747bc5a589bba3a45403d13198fbda0f7b8bda171cfbcc0e11c3d1020d9bdb3219c3cc7975abc8ff2953deada44bd152ba63d7083bdbc772f16bd4538a53d4eadbe3aea96073df10f643c5d91363d642649bb125b58bdaec9d63bd16f03bd755cd93c614fcdbc3819a73cb6781cbd02c8083d0a1d503d95b4f7bc06fea5bd225edabaa69c013dfc8e25bd85a9113d7240a2bdd6cda0bd85f20ebd0315a43c754eaabce16d923dd072f6bd00e11bbca26f8abde825de3c02e379bd0a785d3cd7c6793d3179f83b4463bf3cdd4db53c9be86dbd2d32b93c1f9570bcc06a88bb0b6bc53caca440bd0ef1063de70d80bce896ccbc455f72bc79d838bcf5773a3d75ac563dca09b9bc7abc1ebd82c0463dd889e43d22ca89bca137173d096f1a3c18ecf73a7e8de23b990c213c6accaebb04f18b3d7aadfdbc4307efbdab0d0abc763ccabc7511673d0be43f3d1ead10bdee447abc32af91bdc24ab63cd8d9eebbf050a83c632f5ebd9dde73bdf3d0073ea434cc3b3e51bb3cb21791bb3cad5ebc0acd013c9f9242bdb9a960b984fbe3bcb010e0bd15a613bd0735b23c6ffb113cd889583d9593f3b9839a9abce3203cbdb96461bd2235173d15551b3de0db7c3c823a3cbd0e93233d1c67503d57cb0a3d7f1735bd6248403ca793863d2d18d9bceaa59ebcdc48df3c413e40bc24d8ebbb444490bd923903bd262d5ebd949966bb5d719c3c078937bccc0440bd87ea1cbd1e27a0bdef32913dfdafbe3df4739e3d8d8a00be985e423dcf4c76bd10e815bd4da6c63c79184dbd34f93abd4cefc9bc34533c3dffe41cbd1a7c70bdf0630dbda769533d08b5ea3c4bc489bacb7b353d60d765bd2699abbc596083bc0eb6393de6080d3d7cb7533de3af64bd2786823d442026bd140abbbd1cf5713bc7c1513cd50ad53cb3c9ccbc813ca7bbc996383d7b7c83bc6467ccbc2d06483d85a1333dbeb409bc09d33f3df250a3bcb18b8d3cc820e6bc157b3dbd784dddbde3b814bd2f771cbc90750bbdc411573d3d9740bdbbf1d83c012be23cbfe9173c81e92cbd5b836f3daaab0abb42dba7bd3633393c2a1503bde5e9323dcf79f1bc3098ed3c4b8eaebd4651663d11326bbc6333193cdd3a1f3c1b14d2bc51210a3dc4d51fbdcdbe27bdc42d1b3d5897193d004218bb99499abd4d212cbc591355bdeaa6a03d4972ec3c402c933cd40fa33bec07b73cfb49323dc0d9713d844138bca0e9033d3e4d1f3dfc344cbd99692dbd3bbef8bc07041d3b83b05f3cfb0fedbc5f86fe3c3f521e3d6cd821bdef0e7dbcc4c40cbd8ca6483d6d80c73c9a4fee3c7d9986bc23051cbd9448943da81883bce5aa59bc5fab783d3633883c61f1afbdab277c3d66fc17bde7210b3d67c93d3d3a56d6bd66d1dabdba01b13c2e5ae7bce6422cbc0d10e0bdb39113bd76acc13c7c7d9dbc009484bcc4cfbfbd407a5c3d1e9d373d7bac7e3dbb4aed3c017a8fbc1a9ff4bc7c1c5d3de8891dbcd0c86c3a7e54b63cb6f0afbc4781d8bcebfcca3cc233e53bee23e5bd8905c3bbfc3f0ebdaf654c3df8d5083d23f1163d97491d3c1e3a0abcbd9326bd10a58e3c28cd75bcf9f9b2bdde3c453a1746ccbc65732b3c141d003db42fa03c354db0bbd917a5bd4560833b8898693db19b96bdc91347bb1f3ecebb27c02cbddfeb5fbcb765583d02309c3d64d5523da42b59bccfe9cbbca09de3bb8935213d69d6c43dc7123fbd138f40bdea9827bcbc22523d31eb203d824c80bda770133dd8484c3d3040a0bcd0b3a93c085aa23b3d3eb53a4bbd33bd2d1faabc3e97b639797af3bd3c4eca3bf0cb2cbdb88e993d49edc1bc5915743d6213033c112517bd2ea09a3d9704d0bdab4e983cc00976bcee777c3c222d503d456960bd	2025-12-26 09:46:57.743	active
cmjmotirp000nuw68id39qyhh	cmjmotirp000luw68lqrd4vmv	cmjhf864m000fuwp44amopano	\\x1f88bf3c059ed73c4faecebb8ded123d5a021fbdcdbfaf3c4dbd7f3c7b5528bd2a33e5bc20b7b7bca5ee353dba68c6bca87b77bd9e5c13bde4ee12bd19ce4ebd2d9b1dbd1013d73cef9ca53c4c9528bd228b583d66db7dbd766f853c515e7e3d79cc743dd282abbc64c00e3d0ea247bb735b4b3dd541b3bc9781d3bb6f7043bdc50b38bcd37704bcdcbf5b3cc2e6893d34627fbd99798e3bab0393bdea12053d75593bbda889f0bc8a7201bd625abfb961228d3d80c24c3c01e2e13b6e18633dbdf98f3c375fd43c3fa8cbbbf727fd3c99ae493c752a273d7f8700bd3be9da3d97e1903d269c6dbd4aa216bded3408bd2b6c8e3b55707d3cb2fb74bdb167f43cff93033d8fe356bcd2be0cbd3227223da219ec3cb4b3133d58a110bcbc80403d93059f3dda5f47bce8c739bd233a8d391879cabc9d35373dfb0cad3ce00391bc14e2413df9ff82bc736a463d726df23be8c181bc807c5ebd19baa03dee7c79bcd4c9b53ddb01453d55cbea3b4e3f233d4438ad3caed72b3daa6441bd320f14bd45e2b3bb021e953c529e75bd6c79663abbe9613c54caa3bc913b8d3d34dccd3d461b803a150781bdc5896dba8769eabc067a323dd294c63cc784353c0344cdbc67da80bd80423fbd3d730cbc6ffd56bd9e3ac53a4302b53c47a1013cf2023ebc352e4a3df06650bc643b503d1cde93bc6aea8f3d64a7dc3c8878a3bc0f17a1bdfb24d0bb3017d43c79c11a3b96bc393dd50b06bdb405acb92a1210bd959e2dbd5903213cc850f2bc4570973dafc3a2bcf02bb7ba14c706bd8f76aa3c3823bfbc21c9633ddeb9f5bc5adc503d870568bd651eafbd3a94a73c9ef200bd88a5c6bc272703bd29ddc23ca6bc92bd35cb49bcbd8bbc3c7d155cbd41e204bd4f686f3dd1c287bda485bd3cfdb4ca3d49a3b3bcde3c923b9480903caebdb53c49fac3bd5bf28dbd21f709bd4d4b5ebd604b2cbc936e303c19f8a83c92dd3f3d79fb83bd1a32253d087f68bc128f933d0afa56bd5b6b54bdd331bfbc0e051e3d3919df3dff5791bd0ea896bc5ada7dbdb3cd1dbd42d9dabc9d5f003d04cc3abd81de34bdc109b1bb1fa43a3cf66b9fbae10d34bc0f4ca93d6827b1bbe920bc3cd39d893da118573d03b051bcd005d23ccf28543d393fd8bc0ed23abdae2d523d081a3fbcd51f5d3c2c20c8bc02cdd83dd68c1abd5a26b5bd6ecaa13cbc779dbc8000a53c73cf61bd3819fcbc1063953c9342263d6cb04abde09041bc8693b2bcbce224bc9d7d873d6f919d3d7057a33b5693893dac259c3ce96424bb0d016fbcb24f833d0291d13b927d2abdb44e0d3d1a20dfbc397bac3cc6c5a43db1d003be1544753c84d52dbd2f7944bd820144bde0b475bc698ebd3d7144743d3e9c42bc156487bb24eab2bce31287bd6bc4923d4cb8983c9689c13d0e257fbd412f1b3c44278e3c4aadf83bc8f7923c68dace3c9e54ffbc7eea993dea0f143d9423653da91a58bc0712083d44cb113d3dc27e3d638d1b3ddc6600bd007a05be2de90f3c1b36c2bc6e8999bc0f6a88bd9d4dc73b0612873c3b3d85bcd3f512bd6e88213ce0c529bccbcac2bc336a1bbde114a63d657809bdfd4f843dddc622bdbe340d3d793ec2bc3ad414bd100b533bcf622abdccb81dbca7143bbb65dcebbc667063bc60c291bca06e9e3cd82d133db5588eba225165bd7d9035bd69c7d6bb5cccb33c25825e3dd7c68d3d13bf133b699985bc980df93c65b191bc8de073bc3bb9cfba38d53bbdcac3d13cae94043d53c121bdf8e92b3db260893db41fa63cdae80d3d85ff17bd3137a3bb4aba9bbd1529313dcb3a59bcac303ebb6095e0bb9164883b3a7203bd3b3c4c3d48ef173da64793bb9cc873bd66d9003ddecbd4bbc4af2cba123a0abdc84586bda32452bdb2ce66bde33d683c04d79c3c625abf3d70fc273b6eb9303b0e5438bc736f3e3c622137bda6b8e7bc5b789f3cb73f92bdbccc2bbcfb111b3d2b90bcbcc229523d1937c3bca54efdbc9af274bc3bf738bc4b124bbd8a20ee3d61f2263cb1f68abd539c7cbd770631bdfde19a3bad18413c68c853bc2c81563c242ca43cdd64533c2209ec3c5056063d4f82873c501efebcdefd3a3b809eed3a2143c6bbef07373dd9b0ff3d949d97bd8db4c23c9b05bf3c29e0b23b9555f5bc25904c3d52e2843b5edcb8bc74ac093d0ed677bc5cc8a23c4a301d3d9c0709bdbbf2893d1be4a33c7b74e1bc1ed71fbd14339bbdb9192b3c0b69b33bd0e304bc8e18523d3f8533bbe5a7b2bcb5a235bca4f3bebdad52363de907503b259fe0bc2f32623cf252043d6598063c2214b9bd484b503c2502ab3ccfc9c9bb2647b6bc0fa4313d3401b6bce669a33c1d05383d22dd0a3b2e8a403db91ea0bdfe0e7ebda267abbd57edb83c16f2c9bad5a4393d5942813c666c99bd136bd03dbee25abc54fcc73c2c7b5dbd085ea73d66390fba92d4a6b8156052bd522e51bdf28e1bbdb32c77bd9bd2cbbc2c2f94bd55ffb33cee7f293d2b4de3bc92b7773d8398b4bd8f54a8bc4bac603db63216bde3a841bd02c36fbb9fe3323d5850103cd943143c141329bc861f153c28776dbd75d89f3cff60743dd69c633d6766493dada93c3d8c91863a750fb63c8cccfebdf8caa73c1a9ca7bc094934bd228fe43cab6351bd7288003d4a2162bbee859cbce9697a3c4a5f843da16be638a784153d628cbf3d6a3ae43d4c7a803c1c0c9e3d3f2310bdfae2663d50ff25bda5b7ed3c8022ff3de0f69abda6f6fe3cfa6df43b402d8aba500ee03cb65a263d32d03bbd27a453bb75ab1abd0066473d127c653bcc2d88bdfc90233c9d29ee3dea56f73c8c63a53d0d59a33d0cc672bb49e5cd3d1a3b233d26a9253cf3f6d83d05cb163d99301dbb	2025-12-26 09:46:58.502	active
cmjmotjb8000quw68xhfdwm78	cmjmotjb8000ouw68kxrrpbpq	cmjhf864m000fuwp44amopano	\\x680fe3bc8a6f2b3c5fe30ebd2d749cbcc94d15bd86840bbdb299893dd5e931bc6e5d4fbb367852bcbb671d3dc242a6ba43a8803d4c30f6b9e9aecc3c2ab59bbc38111e3d91dd9b3d1017783bed885f3dae249abb6b77e0bc0eaf28bdee2801bc3d0cb1bc547e17bd60ec99bdd97e31bd45f85ebd2a9724bceeeb183d174714bce44c7c3c1b3761bd301cb63c908518bcc67492bcc7e472bd0dc730bd1a646b3d3d268cb78590863dcc8b923d55e0b23b40a30c3cd51f643df9a3e03c1ad99f3cdd9d9e3c42fa0fbca91671bdc06231bd368d123d1d5dbe3b525d0cbcc4fbb93d77d6203d1a02bdbb1636f43cb724873a1843443d64ed9b3de44d2dbdfcd40dbdef43883d7d37b63c9b47c3bdd25ee0bb3e7053bcc55e44bd1a5a193d0ccae3bb01b77ebc597fa0ba9eb1ca3c6273eebc0784d5bca47e42bdd71ce43b947fa03c957ea13cd4e9563df40a0abdf73b1e3d4732b73c2a62f5bccea007bd6c27f9bcab67e53ae33885bccb8dfa3cd0ec3d3dc5e330ba34973bbdb40719bd9442e9bb2e49de3c0997963dc7195b3c751c13bd2edb12bd1761d93c8475e4bcf1579dbcfe9a99bcf90c2ebc8a159ebc465b33bdfdd75d3ce3d9b13dba1a3f3dc85889bdf430b13d8b34a0bccf4f043bdc8b1b3d8697a0bcbdcf3c3da91feebc3079eb3ded7f24bd8a5b623c597e963dab2d103d39983dbc0d3c5bbd0776933d5160583b26dd30bcc054f43c5521babca1c529bb815c993bdb39f9bc4cf95ebdc7d4103dcd8c34bc7d6f873d29f300bd2df34bbd06d58abd6286e03c52161fbd0c4588bc843af1bbd53f77bdc1bab13d65c7a4bc51a6b0bc10fd693d5a9f7e3d7a96993d55b2cb3c0c46dc3c25b5193dd4e2573d6a3403bb04e07fbd1ded51ba7655783dd67fdb3bc2b281bce7177bbd90c3b4bd558888bc6ac4013ebd7871bda0fa83bd860071bdc819b23cca2eef3bcdcdd4bb0d67d7bca1fe083d419e15bdf08c7dbd2fcc4c3a843386bc5dd92c3c893005be43e52cbca637563d6d353d3bcd520dbc03e692bd2614713cd3e217bc88eb293dbeaa043db10ad73cd23d423cb05b163d1c9c1fbc6b469dbb038e21bd80810cbcb191e8bb52a397bd4b2fdd3c8c8eb9bc4e8d1dbb818d5738ff8f2b3b33d145bd865814bc7d15f7bced22ee3cf9d0583c589be8bd7514df3c778fb7bd45dbfd3c38d8afbc1700b43dbd4942bd11c86bbcdcbc2e3b20ac82bc8a8e66bdb2bcca3a23246ebdc9caacbc90f6ae3d99f12ebbdf0f693ccd7ae1bcd1ff24bbbc19acbcdaa71fbdf3db8ebd051007bdbecd98b9e2189e3dd039e53a7db5283d807949bd3e881f3d96491ebca3d226bd32de6f3d3b624dbcb290e0bc231755bd9bbb723cf9df813d9a9640bdc872413ccb03b4bc11398ebdff1b65bc60e5043d611aadbcf5c5e23bf33ee1bc205c6f3cd9af363dadfb26bd6a20203db145033a02b3b9bcbe7a35bda9f2e0bdd507003d5656233dd7aba2bb9e5c6ebd7eff8fbcf06a9ebd008489bd31211b3dc17bed3b4bf6f83cd858a83c01152cbdfe2989bddd592abde49d99bda1f7503df72da13baabb97bc17853b3d0519663d6ee1023c4308cd3ba8abdb3b7f29863cf378c73cae3991ba0be29c3ce1d6423dc8fcb4bcf4ac893dbef438bd860b09bd46bfd13cebdc0a3de8d55e3d42fa013d0104ccbcb5c0d03d93901abc92bc123c92e2843ba556403c75bb403c1ca6a7bcd66919bdee5e8ebd18a0ac3b2e2adbbc38838a3ba99f38bc1221b13b78c8413d681054bd3d4d9d3bcff22c3d8f7e3b3dc4804bbdb7471c3d2a18723d12a1e73cfdc038bd91bf5f3d0f26843df45d1c3e5e20ed3bb4cfc8bbbcbce7bc2478203cfad3aabd75b6123c47641d3d30c3f0bc8b02903d3ed5803c3c6f80bdcbf0e7bc150f81bd894efb3b423badbdbd35043da310f33c239fbbbc6fdd94bde0378fba3e226ebc80f6b0bcd920a6bcfdab49bd953427bde007e33cc68e89bcc32f93bc66778e3c5aa69abc3f9d3dbbd049d43a03e2b93d2e4cd63cc422a53d890dbcbd1e0d8ebdcdff4ebb4b3c853d41f57d3dd734393d0cc64e3c4549983c441e96bbed740bbdfa0ffabcbf3a51bcfbe5eebc7fd387bd7d9b22bd25ec17bd885fe2bcd06bc93cc49fd23b2c62a7bd55ffd9bc3dd37b3cbd03243c64f0323df49840bd9fefa83d2b39b33d4a43653d862510bddb8acebd1a951a3d3c984ebd2266523d5232963cafad59bb5f2d273d154b53bd396831bb1107a8bde3e799bd7a2e18bdac17a7bde881613df01634bd94c4d0ba498ce23cb0e4763c1092063d929c083d687cf93c42db323d90f6e6bcdab572bdb892ba3cd7a590bcdb187ebba0cd793c75a57cbb7267153d15f2983aa0bd3d3d858b1e3d1a000cbdcb528dbd62eea43d4a1c033df2c6383dcf6ec1bc61a74d3dd8c94e3d8f4ee3bbaf9d58bcdd27dbbdfa966d3cf4142e3b30d6043d9a6b23bdef9a87bbba72123db97af6ba2989433b0505a83b8f52bbbd8e92c33ca619a03d80fa20bd68f9a5bd0dac07be026b15bd56ce7dbd7bbde43cf041e4bc70e7793d639581bd499fcbbc4f6a0a3d388d76bcd5feb43c4e252d3d6b14403d65486c3d2730b23d19f1b83ddc411f3c5ed5f53c8b4fb9bd17b38ebcdd95a2bd507a2c3cf46323bc45b43abd4bcad8bb696c353dbefa323c8dfb903c91279dbc7594e1bdd1aa57bd2ebe3a3c9f1d41bdac47f53c12a0323d9626afbc19ddadbcd1341fbd3233a1bd7e87783d3eccd4bb10ac4f3d84a24cbd881df63cf20c03bdce8736bc9667c03b0302bf3b6a18283da08cd03b4f21ac3cfe6fcebc928a9fbca7d9573def8aa53d28ce073da4c2babdde91053dc22ae5bb92d2013c49853b3de1e55fbda892a5bcf5ce8bbd	2025-12-26 09:46:59.204	active
cmjmotjvx000tuw68op9coyz1	cmjmotjvx000ruw68p0cj76od	cmjhf864m000fuwp44amopano	\\x945cd53c4079273d309bc93b28453abd9b19afbdf92099bcb6315bbcee5de23c62f1473d29ad713ddbc8863bf1fd623d664f1dbd3b3357bd30083fbd2718e1bc68468d3d164d74bb903a623d37b4713d3075963d2226f13c4465d73c54977abc3a482f3c118a9d3cf346ac3c89877fbc3a4e7a3d00bb613d36ea4c3d32d99a3c7264dfbc6a47e4bc275a5e3c00dd82bd3c8463bcc25a6d3db7a4853cb598d83d7fc5f23c290de43c1616b43c8d9a82bd92c5183d0f152fbdb221dcbcd7ebd63b66155b3d335227bd5f9ad93d626494bc306793bdea1f5dbc7edd8ebba8cdc23d94ee9b3cb36484bb01877f3c30ebf23cf15213bd653ed2bca2b12dbd8451f03c9fcd9abdc440d5bdcead37bd055645bd3184463b6e38143cec9f5e3db0636b3d44e271b9842b173df32a863b750401bd7ec42d3b8905ec3d156383bd7e86c83afd6e2abb53271bbd4b65993dae9a443cf8be893d96beb4bcae0fc0ba3cde10bd1dfa46bd7f99343dfc93743d853a47bcbb417fbc2ce7f6bc4ebe4ebcf20f88bb38b5d0bcaa414d3d4b34ce3bb8edc2bc1f3b1dbc801413bd8df66d3d791073bda7c80d3e599ecb3a43b75d3d5d16313d7870b53cea4eeb3d08a84fbd45ec1bbd16d28d3d1385403d0d9206bd51a225bd354372bd13e08dbdd97276bbc99bb03d23e44cbce035583cb222443dcf72f13c2467be3c36cababcc396ca3debb898bc80c2403d38eefcbcc9585d3d5c71b93d2d35303b674792bc38adea3ca26f813dbbb8d6bcc6083b3c53fa3fbd0aa6c8bc0639d2bdc3f4933d02dceb3b08d4273cca89afbde8787b3cdf9f06bd80c37f3cad59093c9099f3bc5561673df719843bea98c83ccb1e11bbfa61fabc48a3c83df7b8153df979aa3cbfc44f3d8493fb3c1c830bbd79d0c73bf71f0bbd41040cbd3a10c4bcdcafa4bc3fc301bdde4744bd7dcf2cbd00ee0f3d57dc8b3d6a3dc73c1849cc3bf521953cefdb3dbd4e699a381eb98ebd0abc00bd4e9dc23d66af8bbdeffddabb6db5853cb24078bdfce9ed3b3f86f8bc859f8fbd840b18bc4df6f5bbe896ab3c1ea917bdc40144bcfb3c113dd60ecd3c9c5bfcbb1497153cf7608abc514d2b3c42c23c3d00f3b8bbd3bb05bdbe1d293df1b3863d6bdb923bd98f563af093123dbe4704bc18482b3cd5438dbd8371513c229f853c0903a6bd6675693de529e9bd28d52abcc096843c921faa3dad87d23c3391debc951287bde378503d3944153d3ae22bbc1010453d633a0d3de128af3de6e1c1bcfb36733c28be403d554a623db82ec9bc51846c3b9aaea9bc31e196bdd7ad443b09fb463c592382bd17e20e3d2c0d96bbc13a96bda4f635bcb06b10bdfb9f04bdef9763bc4f76693ca0c3013d3a57cdbb2d08773d4bc1913c88e685bda2be14bd4552143cbf04b93c94bb003dc91417bdde9b0a3d2a33c63c4e43913c3f934d3dfee1863ddd6210bc5bf6b3bcb9c322bc94d797bd0b4eb9bc4eff943c4db6ae3cea99983d54564d3dcc555d3b7c793ebd40c344bcab00543de201073d1b7b86bdf87985bcedfe34bdee7a10bd6800e03c73b5beb9a604c53c8e3403baa6079abc48aecc3c722d22bd96ee8dbdacc65ebd135b593c2366fb3cf59fd1bc299c113d53b559bd2351a13d6b47a63921a185bc2fa2023d10f6883c07b8d13b540f853c4409303d30b1b43c531372bd50202ebde9e467bd91095d3df196f43be87ac0bc963a4dbc6f1e333c7658233d30fc05bdc24620bd8ce583bc13bd6fbd213097bdd8094cbc76650abcf0e2b93c3c76d3bc5632133d68a0b8bc68783c3db3451cbdde235a3cc22e07bd8476dabb7758323db0f0e7bc80d34dbdd75c95bd0558f83b856865bc3c2b0abdcc6ccc3d3a47a83c462686bd670da33a4f4a24bd265ef6bcaa84193cdf5a833d5c06b63bcb4a3a3df2a9823c179a67bd6ecc9b3b49dd013b957194bc3e32433dc105a0bd64249c3b1d093b3b5e893bbdf52fd13c12617b3cd97faebd48e3223cefd5cbbcc0fa8e3d3c91d23ded1a05bd3011433d88446dbd8eccbabc50f6a3bc082cb6bccd74ccbb7994b5bc386ae63ace81d5bcf170e6bcfa6968bcbbe712bdb873a5bdc802943c35f4c03d55f9febc0c1a883c0694463dfb39853b8126003d5a1621bbf2dcc33b689d20bd1e23cbbc041c87bdd1b443bcbf8093bc80d0653d56b690bb950fc9bca94e3cbdd149a3bc251b2c3dbd058cbb0e12453d73e171bc24bb803c2538513dd4e2c23c5eec10bd89f70fbd4680973ca967bdbba4c9883d104b83bd87ed163d18fd2dbcad03503dd5f80e3d29782c3d7168903d3d16fb3a101ac63bbc21103db98eb1bd33a31cbd684703bcede1cc3ca95c3e3de83251bdf06db43d8143373d2f4804bb2baa443a441093bd17c215bd253ab5bd3b3ab33cab6b4b3c7d03e43c5cea443cde5d803d61e47bbdaf78dbbbde6ffabc997b05bd6da2f03c8711073cce1455bdd50e203d8428da3d5210463d932c50bd8e9386bd0384f1bcf88c4c3d4686253b7af35cbdbdd40abda9b6febd8a0a17bd4225163d07600b3d5fa2843d8512703d7693f3bc8ffb66bcb388693da6acb9bd68f83abc2fd2f03c95941fbc4e58c0bc3d12ba3c73aa2dbc3fdd3ebd751dd33ba8f73c3d90f16d3d07d5debde22c433bf4ec613d60800c3abdc4a9baab0ef6bdd1ac333c74f31bbc3bbc5a3db74e91bce58fa93d3db790bc138fb53c9d3f25bcf96789bdeeddee3c45abe4bd751093bdcdfb903dd370ab3c86d0af3cdde9aebcf800003ca80c593d4370e33c4c9c96bdab4e02bde774123dbb25283d942fc53bde5235bd32896cbc39c2b3bc7dd9b2bce57c013d922d973d047a64bdfd14093d688432bb57da133d7d3dec3b79a5c43b5f69e7bc	2025-12-26 09:46:59.949	active
cmjmotkfp000wuw68qz9bsq2s	cmjmotkfp000uuw68li35qf5h	cmjhf864m000fuwp44amopano	\\x43ea763df908623d62fbe1bc0c92173ddfcc5ebd7745af3cda135dbd523ec03c37738e3ba926fd3ba972503c2cfd8b3d0fbfb0bdefc1fcbb3531b53c45eb143d5f1904bcb96b66bd39b394bcf0d8b8bcdb04cfbcd030033c3f251fbdc9d8093dfde4913c93c29cbbc2ddf4bcfbe0a1bce34ac13c0864663d934d283d876120bc6e2cb2bd4da30d3df32e6b3d34a61f3ddcc1debc2f8820bd68b66dbd687e003d9a9b30bc4599d63c06a3dfbc8165aa3c26489e3a48abdb3d31ddbcbb56e09ebca27c80bbeece113d8a0b643cf4fce43c132f193d1ae5f7bc5011d83ce901e93cdcc2473d4670daba3afd8b3d78ee87bcd85d61bdd3ed623d40a51abcaf35e3bcf2f6d33d08993bbd8f7aee3cf481e73c8edc1ebcc10e13bce9d79ebc4c01e33cdbea813d31547dbcb4c1cfbb1c84973c1e4d7fbaa13148bcc66f4dbd0e44ca3c1e15533c25bf843dd61bc93c53c071bd1fe4dfbd9f7e933dc86c71bce3b933bdfbb6fdbc16ba793d995d2bbd7497b83d0a1ea53c8c168e3d509ff5bcbe66bbbdeaeaa2bb31b3d0bc7fe1313d0be314bd9863acbb530188ba6452b63c56178a3dc621b3bc123a95bc4fc9133d0fad4fbd96578a3ca19bde3b6f0f4f3b6a8c983d3de130bd774145bc77c080bd4c04133b6d80c73c5d624a38ed96293b93886fbdc97b44bca0ab263b1f4a1b3d7217db3d929d303dea69c63cc0803f3df121873ca01653bc91019bbb918edebcfa1e14bd6dec0abd022617bc63399abd892a6fbd9de246bc1dd1c1bc81e2a13c50ea15bd2a699b3a189065bcee4b0ebdedc3f5bcede901bdae6922bd12fad43c7e7c6fbd0ce38dbb4b06c9bb166732bd8ad1b9bd881c873d5f122cbd24ca143cd84031bc5f7e043d9197b8bd08ef17bc85d3f73dde52a1bc2d3f3a3c60fb2b3dbe19d5bc8d9009bd6d39a1bce6c805bdfcee46bd3f349cbae0b1273d825170bcc90dbc3dc81c1d3de879363d0879a63c587238bdf6c3713d05ad2f3d121f003d9a4a213c83114a3d816d2b3dad9d53bd9c81bb3ae528d43d725d7fbb2ecd973d22ec86bdaca27e3d72110ebc1b5585bd33bdf73c604239bc05a93c3dba2718bdbaecf6bb28d88c3d0fac97bd19774f3db62d9cbd48a1ee3c706eaabc6977713daab635bde0ed403ce5ba87bd6c896ebd4e73043d47b6b33b712e0c3ca3f7eebc616d5eb88a4143bc3b2b23bcc577dfbdf0c867bdf21190bdad418d3d409b6b3c949bb0bd8536b0bc6091aa3a945f693c5e1bc83c964c5a3d5ceea03995b1523b5fe49c3d4292533d24b2023d84c5493c7d1598bb900a56bd125d7abd9ca6f43cf3e742bd069f333da1c9893ddb2539bd37940fbd9f68abbc78ff55bd8f6d06bd6d07d73c2fc5d03c706329bc34ebdcbcc0ff9b3cc67a32bbddcf233c67d120bd12259dbc53a7bc3d6443363d835ef7bb5744e93b03dbf13cd313993b6c6c9e3db3a64fbdfcbf91bd0246953cb602183dbc1ab3bc78590c3c96023dbdc33c00bdbe2e713a81cb203d6c921ebdece2e3bc84db2a3bfc3e04bd42e3cfbc466f64bbd9f7633ba1e641bdec8c8cbc1155383d69c1133d646f2e3e41b39fbc6800e7bc68140fbdd3b840bb0b2bccbc13fadb3caa8fb63c0241f03cd06099bcead13b3ca8389dbd1807f23b22c2adbd854413bd7539f0bac7d8e03bbefd48bc7546803b1f6c343cca208fbbeb7ff4bcbf98193df5595cbd90ce73bc82a0683da3e843bcbdb059bd68c381bd96fa0e3d3f70723c03da7a3c5da936bd1259c6bd2c77333c760545bb3b679d3d22b23fbd60f30a3de00d79bdab496ebd935238bd35e92c3d0367bb3bca9e563d011740bd9297853c564bd93cdf134d3c2fc86c3d531e4abdcc5a45bca23d173d237e563d614b603d8282353d7b5f36bd451fe6bcf38a9f3c3588683d4a0420bd24e7bcbd4c72c4bcdfeba5bbb8a3eabc82ddce3c52d1ccbce7988cbd2a9c8f3c4f69c1bdd5f3d33cead28b3bb59e62bd505a1dbddb0b173ceef7733d024655bdfc50563d7134a3bdee6a4a3ceb29243ce6268dbda177d9bc20ed98386e0e613a01fd57bd7e8d1bbd4db1ed3a0747363dcf14ba3ceb6689bdb74c00bd2e09413c524046bcffab0b3dbc748f3bb23a19bd22f407bd2dd8673d5fbeb13c90ee8b3c661beebbdb5a0e384fbc4abd696375bc929700bd2d83ad3d1d58cbbb745f6c3cc2041ebb79a7873cb3b843bc216d6bbdf88d2c3d2c250c3b16221fbdd284453cb4b9083d9bfe503dce1aaabd5e224abc49a97fbcd757e93c01db94bd60f4babc0371aa3d2ab531bda57f90bd9e88c53b209c123d9c0081bd6c0bbfbd3b5e623da71ab43dbba638bda7c796bd75027ebc9123f1bc6c19adbd4ddbafbdfc3a9a3d9b5a4dbc04f1023c758550bd7485b9bd88336f3d7e42153dc5e5e03a0886633d8dda92bd81a3ac3c8925d6bcdf5d843a47639cbdf735633deda4afbd387fc0bb1d28e4bbcc168a3d031b79bdf2df0f3b16d2f9bcce028bbd30cda7bcc5539d3bddbc42bdcfd613bd43ac143d12a285bc46731c3d6a96dabd963998bcc1e855bcd60cf83c4aa74e3dc2b39d3c4a3b153d29a0cc3df4fd6ebc6bbb81bc5938f93cf6fb58bd6de118bbcac0f63b371f433c2d249e3d3d46cdbdfc35483c20ba86bd839639bc208706bd6f2ccabcb2b7cfb947bfe8ba92ed99bcae79093d68fe8fbc53f637bdc4a4bebc4a8c1b3d82f14d3da853073d397d9b3c4ff5d9bc6cedaabc1ab8ecbcba63d1bc9ae827bd84a40cbda1dc5b3c6ec6a1bbb5898c3c6bb7b93cd7f03fbcafccdbbbe9ef043d6b71c8bd1168913d707cb03db1383abdb993543bf9a3473d2695133db350bcbca5b711bd2dec233d0447f83c6e83883cabb40dbd3962f63d7b23213d08e4f83c	2025-12-26 09:47:00.661	active
cmjmotkz8000zuw68ill1bls5	cmjmotkz8000xuw68ipc8w5rz	cmjhf864m000fuwp44amopano	\\xe1c8f53c2aada93c1dbf563d1e06b0bc962d833cb68f8dbd0f12b6bdb5cd9ebdcce59abc0ac1a4bd33889ebc84fcbe3dc8b6a3bd7d6a91bc17660c3d509c343d3818203d5dc7cbbc1ce45dbca30083bd9a5e0ebdc9a09a3d7cde493d472505bdab8064bdcdd6193c4ee0beba12a586bd21169f3c8250173d9fb4653da930003d1896973da18a923df91e593da6a36bbd560d0abc69fa80bac932a3bc88194bbd67334c3cb3b6f1bb3ecce23c5da6f43c1cf444bd8ba2c63c4a69a23d59a000bddb239fbd5b728f3d3d602d3d9e67a8b9ca1a20bda0977d3d1b6fd43c9f2d02bdb6c86a39107da9bc0785a83c8cba0cbb125d34bc870af93a35fdc9bb78b1513b492f8b3c9ec8983c633ad2bc84333ebd614f5d3cc2a81abd633293bc53c323bb2fb08f3d97c86cbc502ee2bb850f0b3dace6b7bc774fd73ca4d251bdd4c394bcf493643dd47ab6bd8abb9e3c0fb62fbd7143d8bc13dfc3bcd5774f3d9d7e2abd643e823d1e8a903d79a231bdd070113dc8968bbc9df14b3c3c9065bdab78483dd764f7bc22d15fbde5b9c3bc89675fbd51f9c9bbc60d3fbde465f6bcf06a913db7562c3de63c483d478669bdba2bdbbc73d4f03ce012023c58c3dd3b7aaa6bbc642fd1bb9fdb20bd5b79c43c7ee3e33cefb0093d1bc5203bc981c4bcd3b16e3c0fe3da3de348653c4d28ad3d7a1e37bd25c91bbd31cd83bbbc0823bc9186473d375534bb19a88e3c9b29a6bc8a7ea33b75ce92bd8f33f83c32db9abdfaf565bdfe032f3db9b67cba9d0b1b3dec01013df49c09bd6e42023b3600a1bdaed78b3ca052fa3cc73eb83d21c6043df61c993988552c3d10237abd47d3693c1810983b7d42b7bca54412bb25a380bdfa37b8bcf62916bd4e9f17bd982f1f3d35389dbcb2b90cbc384548bc916885bd38ea78bd5cf49b3ccff6e73b9494f83cedb115bd53136fbcb68b903c2fe357bd0a2e243d8226fa3bdf2f913db0f6b3bb8d323d3d4fc0c63bf9899ebc9333ef3c0da502bac8a20dbc4af6b0bc72fb7fbc6bf5583c245bcdbc8a30013d488d0bbec86e32bdc6be013d729bf8bc7fe90e3db8e5933c4023d7bb599b3ebc8e86b4bcbe2e33bd054e043b71701c3df7fcab3de25c44bc5943203d3addfebb7e141fbdbc0ec9b9c7afd5baef2210bcf65d8c3c397c8dbd953904bc760886bd8ae43f3c15a53d3d8458c8bc5740c4bd1cfca3bdc539203d7dd6573dc015d1bc764cc4bcc1a8a63c864212bdb27d84bc1631853d7516943df00780bbf14b6f3db85621bde879d03c8b02753dce42d83ce758623d74b090bceefc7e3c53556a3d15ca9f3d4af31fbd0861233df0629d3ceef69c3ab82f61bd8c52c5bde63113bd143008bd2cd6ba3ca2e0783dc45f1c3d5a925d3c41143f3c69cdc2bc0f782d3d766b00bd861c483d2a3fb83c6ecc403c7c565bbd97256a3c3751833c5b20033da26733bc892a1d3d38a25ebbf61f373c10b9abbd07ac14bc3d5a953d7803b1bd39c2d73c416b993c28df1a3c192b10bd3f011ebcd2711ebbaa4f893cdcdc9bbc1758a63c20019fbc2e48943d0509ccbce0d038bcc4ea883caad244bd42dd033d0221803d347cde3c356a5f3c76b05fbdaf379b3d39d76f3dbf6f3dbd5a6b27bd85caff3ddd0308bd65e06a3d366d983c078d58bd134e68bc7fccaebcf3684d3bd47c003d9ac9083cbaf11abd1d42cd3c71f21b3afb4e2d3c8ca6283d2f3038bd8c86b6bc4de29ebc506e08bc6b1f8d3c50ec43bdbe5263bd9009573dce7b503d55d21e3d9f1ff6bb9979b83d0661cb3bfd41c63c76070dbc33b905bb3c738bbc8fd6833c201b263d14539abd82ac313d2b2f263df3b9abbb6a33b6bdf739a63cbf4abd3d68e319bce71f373dedd01f3dfe149abd0f23b23d96a069bdbd31293ddee2dabaaab20b3d91fbc33ceaa91ebc4c8fe3bcd717553d289d013c29355cbd585e373d9e4417bc0943b8bd162ce63ce64f0f3d8aea113c733510bd616da03db06b573d22860abc90ee253b5f40683d2560613dee4a343b252a45bd5195213d3de942bd03b901bddf5048bc1381c03b7241a93d9928333cd138d4bc8b3086bdb0a00e3df18b213d9451a7bd4e729dbcba76373df0ec9d3d0abc33bd95c0e23d02fb29bddf7919bd11aed4bcde79493cc181a63c7b3eef3c774d0f3d5bb82c3deec02dbd782516bdd72d823be482163d22c414bd185e78bc3a42e93c7ad2c73bf9ee3fbceb1522bd7b821bbc963fa1bd29a6e1bccc3ed5bc06815bbd38a9593ddbda94bd250abb3c81844cbc0d99813d265dafbd11c2d6bd118bcebc6a4d68bd149822bccf8f50bda2d30b3dc1a1403ca77f0fbe8dd7973df491ab3bf7bf993be1ff30bdcce55fbc05e6ef3de3049dbdc89c80bd3212adbdf2b57cbc56ced33d0fb0cabacb5b67bc2697cbbc4b1ca13c70ad063d4b2542bbf03b8d3d3a22afbcc379c13c9fd72dbdee15243d57268abc2ac44f3d4bf5873d9b0627bde53c593de94463bded81c13c2fe828bdd22a173d3f7db93c58433fbd511c01bd6718c7bc206248bd12f62d3de6bf0b3df18edebcf4b379bde6f77b3c84a287bd00deac3cb65034bd63b4183ddaef633dfb5e803d2674133cb0e1933dbfac01bd7520423c692ba7bdebcbbebcf41a92bc3549b03a2a759a3c588941bdd418f63b8ecb923d874e1b3d808794bdf7f3e5bcc284c1bdb2ba8cbc4becd1bd781152bd5762f5bbba9c343d2a36753ac4370cbda1c229bd1de14bbc7447073dc6b8c63d0cb7903c826c213bf98049bd46e2c13c7213283df7d8993d21a5813d328f013c47e903bda75cc2bc1b49483d7c2ec93ceeeb85bbbf6ced3c00152abd42a3893c547470ba4eab0e3deefc86bc7069ba3ccb22193d78d20cbddd29853d	2025-12-26 09:47:01.364	active
cmjmotlii0012uw6852e1cgvs	cmjmotlii0010uw68wulaem8c	cmjhf864m000fuwp44amopano	\\x2fb5fb3c4309a8bb169d903de034e3bc6608dbbc2e7cc53c494ae43c4de7efbb5b1e323c2b6c9fbda3080cbda851ed3c7deb4dbdf5e146bd925f783cac2425bd76313bbc931612bd006e9a3c54030e3ccee2923dce08323d29bc833b183347bda258983d92b38ebca69984bbaee54cbde0b1ffbb0f67c93c8a5b2ebd1ad60a3b3d19a0bcc41632bd8b78453c401143bd45f0ebbcd0f3d33c213b3f3c23084f3dbaca413c29ba7ebdac4c033d2d03ff3c46e175bdfac9e6b95206253caec5103d4643e1bcd6b6013c4b00253d3f49b73c3b29273d05791cbd42465b3d983e883d4077773dd137dfbb8b8f0ebceb9c7e3da1c532bdf83818bd4883623cc8edb13d7d1737bc8f4010bc115dd6bd84c29fbd2384223d996f48bdd9dd73bdf7099b3bf15f97bc5b05743c4b909dbd58ee48bcef037dbc7b77013dcb220f3dbb2b45bd9815babba0c60abdafacd5bc6cd04ebcbf6a0f3c6b466c3b14e6bd3cf674ce3ca29218bd24d073bc9b58973cb9473e3dbcbe14bdda92c0bb7f8050bdbfb45dbdb977d3bca0b34b3d50f7353d633c153da556833d9855a9bc66b8d13ce475843d5dc6ef3c0402bbbcf297b3bb923dd0bcc3be153d6bdc96bdc73d0abc063f00bdf6f8cdbdab10c3bd7f1e1a3dd245ddbcc5baf83c17aa24bd802415bd7cee903d70bfc43cb0428d3d8d31cb3d5fc60ebda3903a3dbec242bd15a81f3df727b93cb23aa33ce383babc8b9b60bd8cc8d73c083814bd19c257bc4267f5bc14df76bdd1459ebd66ce873db04af23c51e1fc3bfe2f8fbd62dadabca15e81bda3d3ccbc90a7773c8276b93d1af764bcee3666bcd9aeb6baebb2473da7c53a3d04f3ccbc816c933cdf46afbcded485bcf72db2bdd13e0e3c5f1d873d28d4273c3f9e9e3d5345e2bbd9718fba23ce403df6f1bfbcb994013db8cc823d8ca5043d3a484fbde3581abcdbf11ebc8c7cdcbcde89573c283ec13ce883ce3cf8373d3cafb2febc8111543d3800bf3c332180bdfea2ed3c9d67a83c46381f3d6dc0dc3ce110f93b13ba7cbdbef8f5bcb305bebd7c737238ebb901bd1df5533ccb5c6d3c9270033cbcdf6dbdb17e6b3d55d60ebcd4029fbc6939b83ccdf2a43b71a7babb52dfd93c783a343a45c877bd40a0283d70d897bc076d45bda4b4f1bb3d0e9a3c12291b3aaeef523cde10d13daf1108bbfeb6853c1ddf96bc766a14bb6d00a0bd991b8cb6ff690c3a7bc097bd1f2d91bdcb6295bae5373abd3eaf97bc305580bc2ad6ef3d185f06bbc02b0fbc970b49bdc852c33d10000d3eb66aac3cba16a8bd39ae1abb6a383fbb471d44bc9cafca3c6e6e3abdcc939ebd9261db3ab221a3bd23919d3cd26c61bbf1d3b7bd8b7f19bd5d23bfbcda04c53dc6ea5fbc45432cbcb32693bdaebb51bc44de203c85193a3d6560923d3629093deae3803cd694e73c7fef06bda7783bbc77e912bd5af59a3c13f32fbdd06f313cbc95a4bd102a9f3cf8b04a3d009a6b3d160d53bdb555cd3ccd15ea3c924381bc1ec7b2bcab2560bdc7771cbdc45aa3bd9713ffbccb3dccbd5ee607bd823c013dee02a93cea1f2e3dce644dbd4f35dcbdc6f583bddc08ab3d0bcf453d4970883d4afeb4bd0835453de8c39ebbb255843b6440b3bce1074f3c841c18bdbdca91bc1ac55b3c65b9203c4ecf7e3d0a6c9d3cf124a83c0c78423d3794faba9ce7443c9c340fbdc4320d3dc4e4253d5525713df85f253c040f323d241fe8bbdd489f3bef8fd8bc6fbe29bdf407fbbc6096c8bcdea6593d4d55203d91c1473cb4bd0c3ddb6fc23c8cba6a3de9cd4abd098a553ce319fc3cf640d3bb71861cbdc4d8c1bb9220cf3b3511e73c59f18bbde4722b3d67c7903c4b827bbb2997aebbc04c9fbd04e8cfbca79807bd4b5469bdeb429fbd5a5b213da424bfbc3ac9d43c9ac8343d8ab91c3dfb8961bde15cefbc4c1cdfbc1f0500bd13689abdf741dabc5106a83ce94bb4bc22320b3c6bf0723c0c1b783cc4c2a93cd2a4493cbb02c63cb0cb383ce81373bb6dc3073d8de9453b153d9c3dff1457bd30b947bcba4a293bc048243dd08eaabcf5c32a3d6d8250bde3cac63d09fa47bd0af3a93d400a273d858730bb7c534ebde0e1bbbc5abe6cbccb802dbdc69d373d390d51bde3a7debbe5e99dbd81dfe8bbc66b553c66ad13bc13eeebbc0b1416bc794b813d7a1b903cb0602c3c1996f2bc5bd08f3d22188c3df728ccbc3820a13d053844bc1a2d7e3d504f04bd805615bdf828d9bbeb30bdbb1592113d9c3d123d8e9ec73c0ffe78ba7a9a5fbd252d59bc1ba6923bfb29e1bd4838683d1345fabcf1d860bd1d22abbb1c02a93d134289bdc2a052bdd7a7c3bcfcaf3bbd564f123dba0b3cbca089c5bb9b0cf13c598d05bba90a3fbde68dd93b94ad4c3d62699c3d4b11fd3cf1f0923ac080813dfc6b6b3d2b9d323ddf6e513c786aab3db18eebbceee8b6bc805e5cbde082ec3ca018973b4220a2bb6091b73c7a6084bd3fcab23c82e77dbd9f3fe5bab3028cbdddbf543c19ed633d6c40babbcae9243dbe42ca3c87783ebd2581cbbce1839bbdec45bc3dae9a553ccc990d3cb26ee9bd2bf44ebd97d0aabddd108f3da862e6bcde401cbdc9e1a1bd6d1ce2bb55b29bbc9ba4be3c201d8bbc2b02b53b761b6b3c849d0fbd860bb23caebe273c9e6b9ebd31244a3d9bb0a539762195bd02f04cbd1e835dbd44e957bd3c66ed3dcc31053d1eec473dea88813d0d133f3cd17f27bc8d9a373dff5c2b3d9619a43d92e72b3d9b53003daddad2bd443299bbef7f743df0da4bbd4bc44cbdf1d26a3d23f2423d10cc0b3df4852cbc640ba7bcdaf6b2bdbc37863d3464423d744383bdf401913c22b224bd1fdf783da261e63c4d0039bd7ce46dbc66390bbc6090013d	2025-12-26 09:47:02.059	active
cmjmotm1v0015uw68sq6vm3kl	cmjmotm1v0013uw68309900m8	cmjhf864m000fuwp44amopano	\\xb93c8f3d83d5ae3d764de3bc41fef6bc6b9134bcb9cc48bd47cd683df679353d5ee9193d892004bd42ee11bd1736ab3b381b51bc31a091bd947101bdaac109bdd1a979bd1b7e7a3d2cb15a3d87327abd7f4e85bdd92d3fbdfb2f823cf186de3da1eb783d3e2ea339d01c45bda35a40bdb8eb17bdc1a4253c7fae863da733d73da7af003d036e41bd6dc2b83dff4bc43a4a3969bd55ff08bc8449633d08f5a23c4cc5643df489f63c3991ca3c6c25a8bb67c9363dbbe9143d2d536f3d994dcdbc9383a1bb5becd03c9b4a29bd6c3c703c4c7d8b3c32eb98bd6a7a333c22cf173d9de01dbdf5839f3d3155ed3b99e503bdaa7621bdd5144dbdbf14433d768f8d3d3690c43c7ff4f6bca02663bc3d84c53cd5babb3b3c5d863d85433c3c9189c63c8c79893cace692bd58580d3c41a701bd2b16ba3cc0e82a3becf91b39714f033da4b461bc125d2e3de37d2c3c45b62d3c19e72c3de8c6b6bd790c93baa5c2f4bcc836e53c949faa3c2a70aebb2efa8ebb91b89dbc8452a93d12cba93c1361b13c944dc33c88ea71bb57d0dbbc426d87bd555b343d05299c3cae99cdbcb9c6573d9a59c6bcb73e4dbdd7ea643d491c5dbd2521893c7c23fe3c70a9233d7f8a1a3b141c873c47fa3fbd2d46143dd1abbf3b658a9b3b37790cbd35145d3c8a633a3d869311bdcac1b83c183507bd09a9963d9b6dbd3cd9fb81bdea20cebcbc46a5bc7ae5033d5f75aabc181001bd0b0b293d1e208bbbc9a436bce4135ebb8e45953c20412ebd937444bce268ad3d80e6dabcbb36e7bdeed1753d65925abc9761d63ae62d49bbdc99c0bd95cd173dd71c1e3d6d22e2bcac52e83cf3eb273d7a80323bfc1c3bbc732e4dbda245c8bd2b39db3c0a85253a0a82a3bcb727eabc67e0443d9ff802bdf2e9b03cfc0910bdbf261e3cc3aaf7bcaa8b833d4684eb3bd58b34bd0d5f83bc5fb3a4ba3c8a023c30fcfe3bd91106bd7a44c63d46d28abdc12ca7bc7ff240b9e75f6939e70ac43ce7b7313de0262b3de8946bbd56abe2bd936919bcf41991bcbc5195bc836ef9bdcdc9b7bc8b1283bcb832a63ca83734bdbfcbc63c8903e23c9b550ebb9027bf3cd8d38f3b46ad24bd542747bdc7013fbc2350cabd513a3d3d9cac7ebd5f600bbcda28603ca7ec3fbd5a1886bb228c8ebc735fcdbcecacc1bdbc8ee13c304d26bd77e401bd7afff0bb60e9523cfe5d84bce3a2a5bc74cf71bdb636cb3c09058abd28572bbde928a3bd6975883cce5a9d3d3319c53c0551f4bc45ed573d81bc2c3d07cbbf3b99480c3ce541d1bd44b1a53ca878dfbb379ab5bc7b1384bd1e6aaf3d9a11ad3d71e5513d45ac883dd01dcdbcaba4d03d4491bf3b8c108cbc9b44e73c9eb10b3d99f681bbaf4808bd78d5783caabae9bc819ed8bcc260c4bcec568f3b22f2fbbb666b23bd9d3cb33b08841f3c2ee694bd1248f8bc4f22473dcc75663d76ae15bdb8bad03c5dede23be27ea23d709f5abcd8b5f13d3aa9c73c4970513c1dd1df3bfd726fbdae2290bbcdbb183c0df259bdc7bea7bc128f223d765f5dbcc7f2a93c9ace43bd6c3c5b3d8f09afbd5b80cc3aa11b23bcd4430d3de2b4b1bcd02b503daa701cbdca3f68bb7f89a53d31d3753d64f0ffbc0339373c49ee59bd8e7bc83c1df3bd3d6a702bbc93c3a03a69aa14be7674ed3cebd8423ce6e5493c62a0ba3c186835bd014428bea6a183bb6b191b3d4bc4c03d3fb343bc30c6383d0e78dabbff0946bc015a07bdfc91b43d79b1853c1da310bd1136823d42a01a3a80fea53df75c703d01e3c1bdd177303d3a5ad2bcb4b5873dd232c53ca70fc5bc7e50b33a68d43c3d606af83bf3beaa3d497cd33c7af6af3bb6f1b5bc068764bd228e563cb17cc13c571fbc3cad21423bd3a49e3dc81aa53d154e6b3dd998d43c88d02f3df62806bc964064bd7af90bbd81da9dbcd3b4b3bc44a5133df70ccabda357013dba7016bc617a213dcf7218baf83662bdd8ad93bd2ed88e3c5a944fbae64d1cbcec846b3d4dd8e73c0bf477bb518551bc5f2849bc4aa6103de1fa8abca4dcaabc24b0f03b0619f5bc7e02633c21b22fbd3f65e8bc3ed4173c0e5c47bda0d469bd5621043d1a538bbc4d5357bd3df9ddbc73b32ebd1162313d043df43c5cc1a7bc09445dbd1bbf9abcbfcdca3bd0043dbc641b93bd00e6423a532214bcaeb1443d0b1d93bc76e21a3d77212c3df02e94bd160463bd56de913c2440123db7e7263d6508fcba6c5997bdd68d483dc33b07bd8948333d73a674bbe9e0b5bc0fb132bd7d300dbbb3c2383c28ebb33de5d37bbd378cd13c7870063dd366a03c9cc60cbd2954493db912803d10da983ce637f63bf9cb93bc4608ba3cabd3bfbce9c3483d48056cbd23fe903ccfab0fbd6666cdbd523858bdfcace43c6aff9abc14fd873def9e4f3bfffd3b392ed1093c3c9e673d6f7ab43ddf2f44bdfb2b7b3cf5a982bcb943b53b471cc43d08196dbd8c4d6e3c988cd23d6c4278bc5e13e7bc07c59f3cde24363d921d0ebd02ae423d9a280bbd1b0bd93ce9ad83bdc68807bdbc6d773c5e733d3d4a26203db51737bddefc693d2f4df93c7f57c73c787da5bc2882a0bdfb331a3d07d4b73c8bd921bddcc253bd19c3fa3ce935483ce92890bd534da53d96542b3d9ef251bd27f5a7bc3089043d72c085bcd0bcf3ba46ea423c820c513d88d51f3d486dd9bcaf6da73ccd79f4bc04a53dbde0e0343df727763d89ac3dbdc796263d60daa2b913dfcebcc3cfebbb1e3a3dbd5bc7bdbca64c003dd1c561bcb4bf7d3df3595cbde847273d27bb023de14cfebcb931a73c54866f3d03d1aebdf5b8863df798fa3cde74e4bcb7550c3c7283623dfeef24bd720365bd63d27bbb6d4bf7bc52e9803c015575bc174114bc	2025-12-26 09:47:02.755	active
cmjmotmli0018uw6849d5t2tg	cmjmotmli0016uw682sce9pdd	cmjhf864m000fuwp44amopano	\\x55912a3d22988c3ce83fb63d0490213df33b133c1e392b3c5e24473cd9c9a7bd51a6753db43d253dd2a3bebdcac3053d217686bd6fe948bda00f8d3d59dd25bd3330643d2b8b583d5b29153d0d610fbd9872f5bc9fe6063b8b1c3d3d48a4a1bc2b73343d2dc29f3d15e6c93b35d678bda66019bcc710083d4d34febd24c881bc95d8673d339c393d114a963b638e87bda5c8c5bd242c793d28f4a1bd98ae5b3d70479ebabfc289bc0fcaabbc3b6441bca6756f3de9f9b13b0edcc83cbe2307bd42fe44bd8f1195bcc0b1cdbdbc978bbd80a13d3dce282f3a6e75e4bc417daa3ccb2a353d0184f53ce831343b3b2cc5bce8499ebcfeb39dbcd5c433bc90cadd3b9e8fde3ac9d7193daefed63a089f79bbff05bb3d832de2bbccf906bdcc3188bd6acd81bdd0de443d89407cbc4b230cbd8cb737bc53180fbdf47eeabc22ce593ae6118cbb05c5173daf421c3df9d609bc794609bd0ee69fbdcd7ca43d001b80bd8a2a853c7b56a6bc6e64823ccbdcc6bab7870b3d9b3d59bcf389733ac9e19a3cfd44803d6b02e53cb505293d5659dcbcee92663ca240f4bdfe5c95bd3bfb723cee4f8b3dcc81f93cfae1423d00de98bc94937e3dd285623dc5cb9a3dc043fb3c0cd9f9bcf107ddbc961f463c40629b3c8cb59f3de30641bde142113dc4e7223d238b423d02ae063dfcfee8ba32f784bc843710bdff1f153b8565c43cd303a5baa1151ebd1c403a3dc913673d7e55b93dcb875d3c6d4e843c1d97dbbbd2fbacbd8e40ba3c23ed9b3de67d3dbd93a7c53be8ad31bd245bb63ba7c182bdf7b3b6bdd811903a61ab163d78cdd23c4072ba3d7e9d1bbda36e17bd2465213d5cff5b3d8680833c97790d3d6f55edbc4ac9d9bc8681a0bc5036b9bdb50d3ebd5015423d811d013d80008bbb7850d03c24192b3db6db513cb4067dbd36db6e3d9d45f2bc660100bd63985dbcbc4483bb0d799f3d1b3eba3d9b1a4bbb48ef4f3d1954edbb8c432dbc8965b93d834a0b3d5ebe063dfb445abd05a39cbc93b031bd4ae0843c4c5e2dbcd86e923cb7b800bcc63d87bd41f062bd2c36b9bde18310bd0523793de8eb0bbc9cb3733dbf54ee3b24ade13cfd5da73c235282bdbfe49abde43100bdb31b8c3b0a0b163cad00b33c22bd5a3c4bbcde3c4a9f9c3b63d115bd591085bde96e063dfa048cbbb01668bc55be133a231b3abd34040f3d86b06fbafe5cb93d0e74673af7f1b13c0bc0713df9bd99bd2c98f6bc27d05c3c5dbc683d50c3943c4544f43c7c78e43cbef4683d8492083da0f3ad3cdd20b13db2a2173da65ea9bba5bc0dbd6b3eb33c202b673db97e12bc1bf636bcf7f921bdf4d20f3d09a49a3dc133183dab866fbdaaa292bcb5d96d3dca99c03cda7d883cf74a953a238a0e3c7c6993bd3b8276bd18e9be3c443bb5bc476aa6bbb68316bd9f6316bd1f7c1d3c5f4a7c3dc5cc15bc90269dba2d64123dc5b02d3c49a1d3bc075eabbcae399fbcbd8d8a3c37a3ed39e0209b3dc27e723d1e80843df65c553cbe51b13df1c88fbc303e08bd458352bdf4e2053db140d8bd406f3cbccd5a8f3d5cb04a3c46f78fbd25159dbcc2e82fbdcc6bd438f7591e3d6c1f963d42001b3af96b303d3965f63ca30b4abdb3c8423c1c02313d70308abb099866bd21773ebc8654aebca515b9bc42f2ee3c8075ba3c90236e3d35a5733dbc45993c3950adbc771cc13c25758abdeb7107bc1b69b43cd453dd3c33a52fbc20ba7abc9a7867bd315682bda745023cb5151e3df886a43c524a0f3d1f77ce3cc8fbc93c20e286bd9bf0873d4066efbc23e0c13b45e36dbdaaf19bbdaaf498bc09b68cbb70674abcb52bf93c0e4f8bbd5ad7c4bcaceda2bcbc9ea5bd9b7605bd7b2ef73daa89593d121746bd96b089b93212bbbd7553b3bc3eeaecbc7692ad3c06bb0ebcd427d13b0fbd43bc3f3682bc938cbf3dd8abc6bcd36025bd8577d4bb222a7c3c765ce9bc91789e3c7843af3ccf6c253dbb7acbbc0acb9e3d50baa4bb05be213c3833833d6aca493c5ef7883d55b1763d3ec7d93b59db453c205891bdff1c09bca63cbf3d70fed13d61ee47bc314bb5bcfa4e973b0447473dc95e8e3b92768cbc2ec8673d0bbb2d3cc296a23cd759893dd1b0663c4ab1783d76499dbd8bb8ebbc1458d0bcd99a19bd3e937dbcaf33e83cc1f0aabd3fdf273d17837d3adf1f29bde1e6a03b466f483ca1a88bbcb54ba53d3fee96bc8e7e89bdcfb429bd48b6113cf053903d2b80a3bc8c13a6bc303e9dbc4fa08d3cca2293bc7e0b0ebc77b5c2bd13f676bd756dddbc379a7bbd61ff07bcea54e5bb374c88bb6dcf92bd1bc233bcc78998bdee5b443d4c68653deb1b3a3c26d3733dbd7dd2bdacfd97bd3d8f923c10d91bbd8634d93cbb0f80bd160642bd55a1a7bbc90ed0bc6070103df4f8f53cb439783d76b1b33db1d4d83a9953703dd1866fbdaedb89bdcae66a3b44db4fbd70d916bd16bc883c1e57ecbbf58792bcdb15f63c007f2fbd4d94dabaf88ef93be84cde3b0186ecbc3414ee3c6d1eccbdc0d44cbc6651abbd7e1800bde538c5bcfdb42c3df6d547bdaaee5f3c8cea92bb6fb45abdc09cebbc89244c3d51f9ac3c05e009ba0795adbc22194abd04c32dbdd9535c3c08c15e3b30a1933d6f84e0bc1f0b1cbb002d883d46b899bcd029803cd9287dbc9983833a99d52f3ca1ae653ddb5bf23c8d6a9f3c226ef03bdbea8d3cfaae123d79b1863c309370bd8d0a173c36d14bbc7e2a42bc7596d33ce8c112bd9d1e6c3d6b8983bd6630edbce02391bc016213bd9765cc3caa0790bc52b5e63cb8d63e3d642b49bcca2ba1bc09dcb5bc905b093d7285d53db29d9cbd3e17ba3dca50793d89ab29bd9f3791bce955ac3cc8aa153d92b384b90c1d8bbd	2025-12-26 09:47:03.463	active
cmjmozqoi001buw68v2kq5vkq	cmjmozqoi0019uw68lzf0ba35	cmjhf8tpt000huwp4bch0j5nn	\\x610dd03cca73543c94504a3caf64cb3c1999d2bb66edd6bc6e2da7bcb00f153c12dfab3dfdb1a4bd8ef2a3bdda8e4e3c18e8783c24bf08bd0a20ea3b32ba5cbd68e0693d4ff486bd0fbcd8bb435460bddc71ef3c2936863b403a56bcf133c8bd39ef8f3c2103d83c9989ca3c2f36263b3912243ddac3b7bb83752bbdb21fb03c30fbb53a662eca3d049837bc32220d3bd47548bd934a18bc2e77b4bde401893d90f5693de5dd10bd3c84023d9542e33c4226203d1f2db63cd9b0b8bdd0bb723dfae9183d5e7ce63ca25b98bdbf2bd73c596d21bda29f6f3d4526babb3e8c633d5aa5e8bc24d1c33b3b0c803d8d1c7f3ba6d1403d2ac70abdaf01523d7b19fc3ccf84213c476b69bd9fb662bdc15a393d57c73a3db8b763bd1d54a1ba5e754c3c423cb63c3a5a1e3d4760bf3db607ba3d4f3302bc335a20bc76d14e3dfb3377bd3f92713d59fcabbdd32e41bde82527bc9de4443da83f3abcb8337e3dc837fabb3333fb3c317fc9bb19a4ecbb38afedbb3ae832bc554196bd9582f43aca0ae43c4ff6603c1e35313d5e2d393d4367a4bb6b62663d7a187ebdd7ab373dbd64893cbd38acbb6b580bbd4973a1bde23a1dbda6b86c3d4060a73cd93d293d6082f8bacf64463d782a1fbc6bcba9bcddd137bc4729d1bcb69e33bc46ee30bda161893d2e7fcd3cfff20abca4e9783d7025c2bd0c9f223d7e04333d9f3ad33b8f412abc410b0fbbda8a3abd7362d73c8d4a65bc547b003d56ad733bff7833bc1e92d53c9e72933c989fbc3c299dc93b5bd87d3d51b42fbdeefab83c43f80c3d5f2e96bc801064ba60aa283dfe0c8fbdff96d2bcd5ea81bb53b0dbbb0e6464bc5beca5bb4b23cdbc7bef353d8db084bda92089bd551aa7bc7e3c01bd8e4d33bcffb5603dfc80bc3c63d3473b1cfeb03deda5403c3df7913d9b25983c5146a2bc450faabcdaa25e3c4f7c88bc966b35bb465459bbbeaf903dc56e3fba0d439d3d612097bc05b5fb3ca49f543d19aaa93cc5a148bdb4c9edbde1c52dbda103fd3ce434c83c49d854bd9d89743d7c5240bd60b619bde9a258bd80fcb73ca513073c43a4d93c88d5363de937773da6de51bb1051a4bc1fca76bb87253a3df3d510bb72ec3f3c60a250bb03638cbdee899f3b1b71bf3baac3cd3df6f7cbbb22b6753d70b31fbbf679063e693c603d8402ae3c40a6d4bb6f8483bbabd298bd6b0cabbd9df07c3d083d1b3a60f73fbd40bd7bbd76c1f73cf8956ebc94cb4bbddd1c5f3ddeef793d7a8a793d5f18c83c0808dd3cd520723d2975eabc6b55b33c1a6b943a20999d3c1bb997bc997f643d6743fa3cb88d42bd78fbc03912db113e12b988bd9e09423d0e5da4bd98cafdbce185063c54bbb33cea1d473ba47f38bc57dacdbca5c12fbd9f9b80bcd723afbc7df9373dfd5b2ebd2cd4ab3da479913d1651e1bbffbc9b3df0e6803d69b2873d3c48acbcf50d603df5b273bd993ca13cc5a0b4bc6062d03cf87457bd6591863d859f253c8b3ea33cd91276bcb2f5323d8a835dbbc91d0d3c30cb21bd05f90dbd0294523d538ef13c03c8933b9d7ec73c9212bd3d663838bbce7410bd022840bd42bdba3db79ca4bc3593843df5eb33bd0d551e3db771883d6e0e02bd9b0a11bdfe45c63c692b9abb5377143ca5385e3d8ebee6bcd62f5e3d6a7348bd560a0e3dfc1a76bc5993903dd32b4a3db4d11c3d512d42bda9cba03d0a4fcb3d1dfa953c97524d392a5d063dc9d227bd5df6c6bbe7248dbd2401083d6503a63cf2e1cc3cba27533c43f50e3d614d683d827530bc7ac9e13c4d41d63c43cac6bd51c9ccbcc732a13dada81ebd2dcba93cc832953b23b0983c41bd4abc4b7346bd91bd91badcd7593d43188dbd948cea3ce538bbbc15c2583d061233bc588d86bccdec57bd0615a4bddc5e98ba54d3073c8582553d2a01f53c2dff7a3c0486763c138701bd7fe115bcc04217bd50ae9db78628b1bd68b91cbc9c82593d0c64b43d0229a13c4671d3bc505fe93ca47f203d15dd303c6344e4bb2428d93de12c2dbc1cf3a1bd52a2223dadc17fbcdeb3ba3c6aa589bca669ba3d1b411ebdc25d7dbc7d07bcbd6ba7b43d5bb205bbd5aa173c480b94bc207d1ebcbadad8bbdb9204bcad2ab93d3a01b03c617bd9bccbb8883c2a2ab8bbea2b343d082ec63bbd0e9f3ae00e0a3d69b641bd3c3a6cbc9685c23c9233153d1255a63ca6e7463c9407ae3d6fdd3a3be2359a3c88cda2bc11c3333d1195b9bd8f01223d3058d0bc8454e63ce831003dbf958abc0fb5ccbb799927bd7a434e3df604353dcda632bd1ab68d3cf19c3dbd8570d03b293c17bd1ea4443c93d2a3bd8ae3e0bdfe108c3c2bd22d3d76993e3d667fa03b4b5cf8bd25ede5bad44a76bdaffd7f3c3082753b47b8f3bc2282bd3d239b393dfd2a05bdc1ae573d59412bbdc1b9853dcdf9803d9110e63aea6abe3c89be1b3d07db71bd876b88bd55db9fbd18db193bb3f51dbc388b9d3c9702973da563d83c5b3300bd5d4205be5bc3803d500340bcf36dc0bb5627f8bc7cdd9c3c46bab03d42c9713a8fe16f3d936f28bccef7783ca0de13bd250e84bc9dd52dbd5241213c540fd2bc1b85cc3c028878bcd9e6cabc0d44123da323093d6d366e3cceb7fc39e0f489bc7ef38cbde0ba6dbd71724dbb00b3c23c4af6623d3dab4f3ddab18ebde37fbabb288365bc44c3febc7d57963c55bc663dae06223db48f4d3b5b8a483b14653039c56a1fbcb90ab2bb93fb893cec0c383c4afa913d3a363a3d9ab9edbc045878bb6d6265bc40ad80bc077ebfbc90f6173c19f1ac3bb32f19bd5be6543d9a83653dbf2e06be12eda2bc15be0d3dee89333cb15dc9bbd30f763d4ce6873d73cbd6bcceaf0e3c2816473cd6d38a3c9305fdb9	2025-12-26 09:51:48.691	active
cmjmozs79001euw68l7msny2x	cmjmozs79001cuw68n81c522n	cmjhf8tpt000huwp4bch0j5nn	\\xdc7d963df7155a3c2faa79bd167683bd1b09cfbd1ea1e0ba6e38583ddc10463c2e9ddb3cc0cf213d27c7833c82785a3dfe220a3ca0cb1a3d9ccb93bbe1b8dabd60d3573dd6fee6bc3a82f13cf75dcfbde4bd5a3d1c085c3b9c7105bc08782e3d5a892fbd2518cc3cd7601e3b30f42e3ca5b061bcea47823db636d43c4539a6bc00ffaebc9afb123d3be6833d5bd517bcb38210bd9c53d9bce54909bb098a2e3daeeb183c1e00c5bcdabf84bc28f5223b57e2aabc1e875abc08c5ea3c8fab7f3d29715f3d13be923d284b333d99cf1d3de13b2cbdfda5123c2168c43c4afc353c026308bd5382813d3a94a53b38c7f5bc51e1bfb999a3d1bcde79e7bc6d1b163d011c813dd0dc59bd9d36c1bd62bcf5bd335b403bedda90bc4797b13cf046bc3cbba2023d482260bd95d93f3dd88ba0bd66b476bcd5cc493db4486fbc0194123d03d42e3cb5c8d9bdd93ed5bbd9f7af3d18385bbd977b0ebca1ad0639256636bd7a6828bd773e293d41a6dd3b8c0da03d79002e3c9beb413da831b83c1d1841bb289462bc70c90e3c241ff0bcfba28eba7a940e3ce7b51bbde57eb43d4343dd3adeb6e13cfdf2843cc1ee053d6200a1bd14ac433d5bcb753d01c7343d1d69953cda7694bd643046bddc7336bdfadf1ebde4d6883ca101cbbd0b4c72bd98ee6dbb60c08abd7ca99a3b662845bbc955263b5bd23bbd9cdc57bcbed1983d26ac10bdad1689bc8ed7203dc4120a3d9969183d92c0173c832aa4bc6732d53b86c774bc5a0470bd7ebffe3c2374553c47404dbc2e0e24bc48d6233d4e5fbabc79c421bc3bf89bbd487648bca3e1243cf92a84bc4231783dafa8cfbbde8447bc5f63d0bcdef633bbe22955bdcac030bd15d7dabc0c6dcc3c17be92bdd0bc753c5708d1bc8ac1593d141da73cc5caef3c1b16c63cdfd834bde44895bbfafaa73b77e0c4bd413433bdea01afbc05eea9bbf946373ddef4473cf6687e3d69a5eabc1f4ffebc333a39bd77f3b4bcf52f203d1c69bab99039b03b8e61f3bca8e5b83cb0716fbc9bd54dbdf69430bd22c95f3dfb143bbddc1aee3cf6f7dfbcd0d64d3c1d01963de272793d18cec1bcddb3213cd3689c3c13216eba7496aebc0c8327bd9e78a0bd2e617b3ca1dfa9babc2209bde34dffbc97123a3d4263663cd20dd13c1de0b9bc997a85bc3ab7e03ccf5313be86ccfa3cca3386bd2db489bceaf172bd42cd4d3d60577ebd931d543cf7b0c4bdad54cabcd206373d4c3687bab68084bdc24603bd2edd853dd7faca3cddcebc3c1898ae3d7b28f0bb598e4ebdef6fd73cb12ec2bc515d6abd0998b93cba0e293d42d51cbc5e1505bb86836a3de08007beb795cc3c04421abc6bcfcbbde1aa50bdaf66653d298ee23de94d9cbb9dbe74bb98bd08bb2c3365bc081540bcce22df3b7c350a3c489bb53b16b77a3d709c3d3df050423d43af88bd2136263db74c4f3cc69f61bd84067bbd41b32ebdb591aa3d646af93c7ded703c314210bdc76fa6bccc904139ad2bd43833be71bd1ae1953dc514d9bb375238bdc84b4b3d51b2a1bd872bc4bd2ee886bdc021b93cd7579cbd60dfaebcc1ee93bd0bfc1dbdccd5a93c31a4a5bc30cf06bc711595bde1df273d6f1ecb3ab04e73bde19879bda12d75bd96b803bd48f4ff3bc878cdbc311c0d3c549d43bdfcfc993d49ab813d717d573d4e778fbd7f8985bdeaaaa4bc4effefbbe5ac90bb2d18d3bc741f2abcdc6568bc1a5457bd1f900cbdfd3c463cf9fe30bd2ee7f5b68dc186bc62068e3dfb58d23d9aec023dbb41183d07e017bc04d8293c588b94bceae2c0bc9bb529bdb73c5fbdca3309bc4e70873dd7e5953d4c58b1bc7570fa3c1cb11dbd4817f63b5583f4bcebd6bd3a0d810b3dd6733dbdf9db8abcc2e8b23c92954bbd6504fc3cf63f633d6600223db87d993c5d1ea13c1505233d757669bd31e2acbc3b53af3c3cadabbd800dd3bc312f9e3a0b21e83c252b653ae7a88d3b63b668bc7836e23c0aa4c1bdbda0b4bcce3083bbd7a83f3c6025ac3d0764273c8c90163d07faa1bddef6cc3d6681c1bc239a8bbc2f77d7bdc5ff03bc54014fbc3709e1bcce883c3c5a6849bc4e681f3db8248abd738f36bde0321abd2366123c2c45b9bbf58480bc3d08313b650585bdc84439bd04c5bf3c1f27213d4a4a843c40c5333ba396073dc0568d3d7f07153d82fe3a3b659e61bc0d7b22bd67b00f3d6e05843cb77d8f3d456e063cdd3d353b8517b4bde16c5cbd44dbc0bc4f097dbda85da4bd22596fbd2817ab3c0f13453d732032bca84096bb58ce10bd699bce3c462a07bdad1689bc25269a3d1050093df9bc893d7687a23d7833f0bc40d1cb3c379f853ae02284bc29e031bbd23ca7bc73780a3dd84ffd3ce337fc3c7189a4bd0220d4bd07a5703c8ce2d3bb45a8aa3d265b983cf399303cb0635b3cf01c4e3d1c843f3d6720a8bd015c99bc6b402ebdd42e813d630317bda56e2b3dbf01bdbcec6f363df1fb6c3c644bbcbb2d5cdfbd39dfcabb06a33d3ce44e82bca89f5cbd0d7fa23aad62bbbd2fa3163d3ad29a3daf48bd3c7336c03cb1b4adbcef19363d8eeb36b95536e13b3bd2acbc6573a33ceaa8003d933b1cbd456599bc0469973cf94039bca3c08a3d69c2bdbda5cec0bc15dbecbc1a6d5fbdcf91543d72c3cfbc5e9a3f3c226b3bbd80166e3c4ed1e23c910f4fbc8efb3e3d7cddb2bb57da6ebc2ce1de3cf6b15c3d5e56a2bba1c99dbca3e41a3e3ce764bdf8416fbd98b3b7bcfd29a5bc77c3593ded44f2bb4849c0bc3ad8bfbca957863dd214a9bc79660dbac93497bb12b314bd33c9633d3485aabc233a2a3c01fa5e3da2b4853d835bafbc7b3bf1bc1fd7de3c6d03673bb380883ce39b393dbe773d3b181bd9bb97b39ebd	2025-12-26 09:51:50.661	active
cmjmozspz001huw6865e7z8ja	cmjmozspz001fuw68zan8kf0b	cmjhf8tpt000huwp4bch0j5nn	\\x8ac5e33ce085a83c684641bd3fcaa83d27e01ebd7f806abdf52d8c3d8eed933db57ed33cb341553d1b370dbc159be1bc45504b3ddb30a63d1a23b9bc16278ebdb9f186bde329873ddeba1fbd5a4093bb09bda9bd3d6ffabd09c21ebd96639f3c628a3ebd6aa15abd987779bda1bf44bb016c5abd0166fe3cfdff8bbb0974de3b719e14bd41c4993d88218cbd54cab4bc6da3123c65c209bd0fb79a3d58794b3d131ccb3a4808ae3d5893fabc5a182cbccedc12bda66d333b7e3af83c56d55abb5fe8783d630b5fbb62e6d1bc2fa5ce3d7c8533bd452672bd1cd0e93b126e29bc94f551bd2937683d8d58c93c0fcb1e3d9e98d9bc9f5775bde96a3d3d0e0012bd2de8f13b9c7b91bd8bea5abd2e285abcf8e895bddd627ebb7cec8fbce3efab3c1e7282bd423380bd97f04dbd0f545abc32dfdfbced7058bcd664e4bc5cb5803b31b4aa3bb5b901bdfa80b33d4e31c7bc7e305a3c443d273bbac0523c71aac0bcdfd75cbdb54c933d7f6ae13cc5c7923c2d0fe0bc5fdd71bcc2a81f3d743b0a3c88060d3ddeb8a0bccbfcacbcf2902bbd1403ca3c56036ebd3e78ac3dcaad4a3c9a89f03cb2b599bb407204bdd843febcea6c573c4a9b7e3d6e3333bc6ae132bd28e095bc5488f8bc6176933c005b8c3d40c686bd85328d3d25e6c8bd52bace3db892cf3bbae2943d57375a3d0b60fdbc56a6053d7ae7fbbd864745bdd1fccebc4702f5bc33b54a3c3108adbc341bb23b9cc2033c085feebcbdc2463d30c0b33d8fd3383d7dfa9ebca2d50b3c264cb2bd3f5b8ebcd97e883dcb8c7e3d47ef9dbc9540d9bc4b55fe3c3bbf2abcff4a223d0eb5aa3c4a71243d073f08bd1d0b9dbda3ca503c891489bd786dcf3d0580283dfe4cbdbcdb1cefbc4e1086bc02cfb93c91fad3bc3016ab3cf0e93cbddd88a3bccbcd4f3db4ee4d3d7737b7bd60645abd021ed2bd0115683cf02b9fbde91329bc0fb2f0bb29ec973a410a85bc2238f1bc3e0d93bd76bdbebdc3ed623cca44d1bcdb13d5bbb59295bda51cc1bb3993c2bc28f7bf3c7e2c0fbd6d8d323ce1612ebc1c9e12bde3b2b23dec129b3c600c4f3c780fbe3c60baceba94b347bc487781bd73662abc967491bc07fb723ad6ac40bdfa1e8bbc11bce7bcf39f243c7e76b33ce1028e3d75c09a3dc909093bff76da3c60a822bc4278a4bca719a0bd95339bbb474484bdf91c9c3c206dbbbdff3c773d2ebcaabdd910ccbd5aa607bde4b001bc6845ea3c3b5218bb1185733bd65aa4bc0848623c9ab20ebc84aa64bbd5cb993c1dd627bd6731443dcefba3bb5470633c0d9faa3ce943d93cd35f35bd18751fbc99b77bbcf27ca33cd1697ebda1bf9dbb05a4df3cb24c36bd09beb1bd07f6bdbc2892ea3ccf0bdd3c56fc08bd2912543c051b4bbd9f2fc73bdcecff3d5b095a3c7aa81d3d3f49f33c549eb4bc56416a3d17baa63c20904b3dc716193dad67e03c661651bdf6cac9bd035f8f3c8140153daf3a1d3c894f2dbc8ee36b3d52872b3d0353fd3c42d35fbd1fe962bd9cb3913ce0ab523cd661c9bc28fb9e3cb917dbbb0bd7463c77087b3d412b9f3c6c3e53bd1ab923bcdcae40bcd1fd4d3d8510e5bc7ea30ebc22695a3ddd998f3b01aaee38d6f988bdeb2aa23bd7566e3c6b83423dafc8153d82a1d6bcb7325a3dc9754d3d09eb55bd7e5c193d6810a1bdc8a938bd667f943ce36fd0bcf161db3cd5d90e3c7fa8bd3aa9281b3c63b02f3d6d4aaabde97e8cbbb49160b9a294f7bc0f85a5bbc88ec93c1a38a13d1dd531bdea83bd3aa401103df0f003bc6da1123dad8817bbed2d823d571f5ebdfcc4b03b6bc2d8bc1e2fa93d44ce533dc1f291bb096dfc3c6b839c3b3e0f73bd5826093cf617e0bba7b6ba3cd07319bd7543993ded2130bd015744bca749e0bc8173e8bd6e8b333ce9291fbc0c74c83de673b13bee6d1cbdeeeb0dbd627a0e3d64f8b33a591b9abd94350e3b9dfb78bca7281d3d7692f23c8f08c1bbf07e3b3deef43cbc11a6efbcde2b37bd3d61c83ceaae843dbb050abdee79a9bd969c02bcd1b1b13caeb402bcf070a13d840d7e3ca7cf023c2525563db51d913d3749bfbc0cef32bd8dd7c8ba142f3cbda5f9963b7cb5adbb648462bba386ec3ceccf1b3d150fcf3ca9f113bdfa6a94bc1ff85c3c642aaabcca5400bd3c92633d5cea0fbdc994213d3459833df95cccbd9f0912bdcad87c3c137df23c811c743c231f6d3dcb20b23db76e163d65896dbc29944bbd6de688bc841981bc7b19a8bcda137f3c39f667bc782dd93c4db4edbc12bc0d3dec44373d0e13d9bc6b002f3dca0468bbcc0824bd8b0d11bd8b01c03d18c42fbd2aba53bd723b023b25b980bc510096bcfa40d63d49c620bdac09813d0eed54bd4e913dbc66e0a8bc21d83a3b64ae353d86f391bcff3a72bd6c30d23cc6aef2bb02dfc83c59195abcdab1a23cc9d0143de314173e024b2abdd036d13cdaceb5bde42888bd7e3662bd8d7f13bda3330a3c3971713b819202bd32e59cbd2835a13dd4530a3cf0fe10bd543e833cced384bddadb9abd5143843ca777163c26aa883d42c9913ca6bc043d3efdd0ba979066bc463ba0bde5bb34bc99f5333d0e9112bd808353bd067b053d1e069b3cc1d12ebd469838bde18ec43ccb7e52bdb752c8ba459994bcb0cb17bdaadeb73ce1f33bbd1d2eaa3cc99c43bdb02582bd79542dbd32572fbd5e2fc53c20b6d83b4b95333b950535bd5a7a78bd979401bc38fa0c3d2c00933d8d39363caa9ce93b7643843d8e2f0dbdbbbe563d8639563d8ac00abdaf6396bd742e7abd9de0e2ba39dd00bdcb7b11bd183b1a3d8170cabcd05e543d8a15293d9470253d5f59cabc296386bcb6b338bd239298bc1e95873dfc941abd97f4ddbc6a4321bd	2025-12-26 09:51:51.335	active
cmjmozt8s001kuw682c5ohejr	cmjmozt8s001iuw68edwxx91j	cmjhf8tpt000huwp4bch0j5nn	\\x127ba33d2ac3053d355807bcf0938f3d5a90b1bd9387bdbdde31803de393a6bce12de93c7168c5bd88e480bdb71d26bd892e79bc9d3d333c8773d4bb783dc4bde855c33cb6714e39bb691dbc4a6daebc0c96133d3d68fb3c34fb6c3d8de2e63c67f12f3ddf37913c8c38a53c61740a3de983d83cffc6b63ccd0acdbc3de426bdd3b17f3d1809013c613ec73c9d1277bd0cb583bdbf812f3d3d9e40bd00926a3d960c11bd74493bbda164123da7dd483d6f63bbbc766eabbd4086a4bc02dc193de0d2893c2d1970bc32cfac3d0f5fbe3caf01cabc0b68b83cabd916bd8cf4d03ca1d3a4bcf1f6823c833ba83d73ffa43b7f117a3c804be3bbe49b50bcb26dba3b2d6d5f3c3b9b893c11e264bdff322cbdf3dfe83c41eafbbcce8c163d5af742bdf0a6233cadccb53c64c72abd86b428bc9c6307bdf83f1938a4bfa13cb025a5bc6698643d32b112bd2f5d953c0528a5bdc6e6b1bd4c2bebbdec11d33dc00616bd6181e1bcbbc150ba7941fc3c9a83cc3de1280e3d1138803d0b0b333d7374e53c2976abbc285f003dc1d7503ce9478a3c358bd63c6be381bcad2c9abdf32a2c3d4f53613da849003d7146833ce36ac5bd4cc53d3da6b7f93c6d7b0e3dcfbb9fbcf0aa16be0f84a9bdac42bebd2e7a08bd697fa43d395391bd12879f3c11e625bb27f8023d841e103d72f98d3d606c3abd373cc83d390e90bc0179773d7decd1bbb568163da158703c6582823d2789fd3b676a02bb472a0ebd6ddfefbc86b3583b749948bcbc01473b2f0c35bbaab7a53b9f3664ba07bc533ceb6877bdbb89d6bdd656523d72736d3d52becfb98c073ebcbccd383dbb5dd33c12e1c13c25d96d3c349824bdeebe8fbcac5d82ba125ce83c5949fcbc339dedbc10b7a2bb7fd4033d5cd250bb087f673d8660903cd4de14bc1827a3bbe01b873d4ff5173d3d2bb2bcd5de99bc092dda3b0ffa523c2b9bfcbc9352293dff8d963dd79d993c87aa9b3dffaf023dcd72333dfb10993d5e58d6bc0b94e2bd559b60bd48d2e83c92aa123d50d2b7bc9d7da4bc92604ebded217bbdba08503c592becbda4ce85bdec35edbcb6de75bcad4a9f3d146de03c843556bc44082b3d668f433cff6b3b3d73183f3db80e903d3494c8ba50f9d83c7aca05bdc51c57bca5bf0cbd501638bd05980a3dd87e953b32e38f3d0cc6883cae0c4b3dd3d9b7bdc8d4653c6f10b7bd3dd2693dc30901bc28cb87bcf55ddbbc3f7e2e3d114257baaed815bc1178f03ceab9633ca7a6bc3dc84227bd0f9a5bbce640b73deec58abcc38f133dded583bd48719e3924f66cbdc8ade7bc45b2653d77893f3cba6b83bc3955cb3cf24b85bd30fcb23ca57f89bdfe3225bd354e13bd29ac813b42639dbcf1b9b0bc9f74283da9c2b3bccfed38bdf781b3bce308303c6ecd4ebdc342b63caf5e613d01f1023df5b41cbd5c0b6ebd88b33bbd7f4571bbc7f60cbcca906bbc64c280bd30d1cb3c0fe7d4bcd6695ebc22cd9d3de5a6783d7d13a33ddd933bbc5a40bcbd53f19e3da19b30bd7ff9ce3bc8ef43bc2cbe5bbd7f7f4dbd5a8114bd5cc1293d9eb3803dd6b4c3bd0ed83cbdbe2b96bd4a76063da9009abb324d1a3d74ac1abb2688493db54a26bd873c213de84decbc8345a83c97cc9dbcca1efabc3c159b3c7642f0bce55f2dbc25cbcbbc3691893d4e7ec7bc022310bba2b6abbc175f673d8e71153d6d6ac33cafdb8a3dcbbf9b3c66cb843a35c2b93b9bdd3cbdd133ea3b711dd93b1b77c83a5d5635bc4146923d9a1db93cbd1f763d5310b43dffdde8bbbe97023bba91d63a150bd63c80c18ebd884e623c9eb997bbdb109f3b3a91033c81a9b93c304e29bc1729cebc784fa73d1db0e6baa2671e3d2e10693ce6fa8b3d534defbce6c310bdf0d33ebde8a56b3ba70535bbaf66c73c6c20943c2292803d07c9e23c7d855a3c9ebda13de7ccd3bc438ed7bd669151bddfcfd43ba865a1bcb6baa53d752e4539b60c1fbc22e617bd5afc46bcd47c43bd8a1ad9bc7e29d3bc815ea33cf2bbe33da3c31cbca3e8cdbccb0c103dcf06c6bbe9897fbd3a86a1bd528f713d675187bdb8bdd23c031953bd7bff01bdc2c88d3cfff63c3d2719f93caf15f0bbdfd41dbd6fcf6d3dadacea3ce6e3af3de1516dbb5739abbc492fae3c9efa293dfb0633bd4302983cfcc53abb2807ca3cde8af63c6e92e43c4d605fbd7253203d9eff2bbd7e281d3dd4077abb12a548bda1b4b1bb963908bc6fc0e1bcad90923dd1ac133d1ef13abd0489ab3c798adc3cf1bb333c00ec75bd5a9457bdf4a3c8bc95c085bdb31c043d4b0928bdbc7cd43c000b4fbc98d4ecbc886082bdfa3a3bbd7f2fb03cc2a6693b477ec8bc3dbf1bbd633693bd9e4c3cbcc2787b3df1f628bbc7f12dbdb4b5c1bc53afd5bc2c0158bdfb17653d93565a3aab85dabb4003033b98738bbcc78b773de6286e3b5d3c883c0b8acbbc97ec9cbd6d183abd3b38853d53753dbd1417013cd8214abbaf1387bd871593bcced5c13b4524583c48b3893db7ffe0bc1a0a07bbfade1f3de71e2cbc447de13b87ee633bf56b93bb02a863bb9cd9ad3c7d16b3bd2a51eb3b29f25bbc9b3714bd74e9383ccd741b3d444e03bdbc39ee3c2f1b823de5a8443c7c31393c381c37bd86adc1bd445645bd761b213db7f0903b0d0ab23c9c98083dd618b0bc0b5a493c6d4d3fbbdcb7c9bbc1f3c43d56bf883d2301303c76b3ae3c4c34ae3c1b76433c08b3443d9d8219bd057b673c3ec67cbb42c5f9bc846dd83c275719bdf89ba5bd61c12cbdecb9233d6ec760bdd81bfd3c37b2ad3c4ed85fbbae4ae1bc03f195bcb45bb7bd4144f43a47d7193e366a1ebd89cca5bc95e891bc7419cc3c172a993da713e13d1806c13cff3aefbbd9b0fcbc	2025-12-26 09:51:52.013	active
cmjmozuc3001nuw68t3gikoeq	cmjmozuc3001luw685v3g0zny	cmjhf8tpt000huwp4bch0j5nn	\\x9ac8bf3db5b134bc1861213d48b072bcd9ff88bc08dad0bcb701b4bbdbf0ecbce7c51b3c27b6883a10f3c13cc990b5bc35589cbd8c53613cb29455bd8f61e9bc159813bd9997353de9782b3c90c2bdbd3849efbc6fc9183b322479bde4574e3df14c4ababf511fbd430157bca0e347bd2d4cfabca7916d3bbc8d5f3dd3defcbc28f7113d83642fbd26b5d6bc19ebd4bb6a3e87bca5901d3d3f5834bc1fe83f3d140626bd7f1ab1bc6416c1bc419e58bc1c8e543cbfd9da3d8b3aeb3c86b3b0bc7a3c263d7ece743dbb77a9bcf673f33a3d42483cf3bf453bae8eb73cebb313bc9bc0733d3b133f3dcc72e0bc8cf3313cf6ae463d9975ce3c55aac23c821e323d09bd3b3cf52c123d0fdcb23c155289bdf068f1bc3d82453d616a853d28a8babc903b3c3d916307bd2a9c003d0a39cb3b487df3bb7ae9163d45f01b3d4d061cbd35eae1bb1cbbd7bc4869b5bb5a36793d5a081d3d3407b03b9d809e3d441da23d8792023cc975fe3c3a642cbb0284ca3d84ff04bda67c393d25ecf03cb14bd83c46ce95bc8039f53c19ee03bd489f65bd8e2e503d08c120bd17f686bcabfabf3b6ff9403b0956f43b77a74bbdea83073ad8745b3cea8d8a3c34f2fe3dc3e62b3d5d1ee1bb7c13c5bd485298bd75a2ce3cae5d21bc6b5b91bd5928eebc8e96483a29fe9fbd0475623c49ad59bdcef91b3c15b93dbda5f8903ccec8b23d87305ebdc3efbf3ca6503ebde466c5bde4ee03bb211b0f3d939b9c3c19fb5ebdee8ea2ba8f4d6e3da8859c3c2f18fa3c0083c8bd8d9f90bd4737633d0906fabcc0c705bc46690dbde031c3bb8cb6c03ca05e82bdaed4983c2a68a43c4c0e4fbdd822123cb5328c3ccfaf64bc5276763c4dbdcfbc94d8c33c15b38dbd4436a938f231bfbca321a73a947028bd464d223d96cf313dbc75853c9336933dcb97babbc0e41bbdeb83a5bbd16c053d1c79aebc964a49bcc9f0463d0fa2483d53fbbbbca392c0bd205f42bc1a88493d5829d63c10d916bd381011bd74a7ed3b92de6a3dd549813b56abea3c4883bd3bd0707ebdab17b2bc6cd9863dd4058abb09d753bcfc77f43dc6fd443d21af013d0ce499bdca8107bd9d5f103d7a8dfcbc3cf1553c1ffe8abcaec747bd325a3fbd4bca97b932471fbddf70d53ab400a2bcc47d40bc1d79b0bca99f363d5dd041bbe7aac9bde3d3f63c9e2becbd6ed79cbcfb0bd0bd6ab03bbb65ebe73c5e473a3b229a293c0eb011bdd524b03ca0bc3d3df699acbcab4249bdcc681c3d4f9bdc3c02180dbc86e5bc3df9d50ebccf28c23babdbcfbc98985dbdc8e267bc29b44a3c91e4e03d0a0adabc191641ba80e3523d0a1c89bdf78a433cd6d3d3bcff7773bd030451bdfd4753bb246f25bb14f9f13c018bb6bca27c39bdc7d15c3d25b90fbd4affedbc610d373d86ab853d30dcc13dc15cf1bb3ad612bd6f8e133ca2d5363cf6495cbdc2a33e3d766c53bc7f0220bd61a4b03dbf8775bbee15773b20924bbd36d080bc03b91a3d7a294d3d2afb58bdca446e3d00039bbd605a42bd997fad3db9de773c2d202fbdfe51393cced9323de4133c3db2fd173c5635863c0b21043b8cc483bca928593dd86fb9bc228285bc8cc0a43c6f29563d4f792ebcd2e041bdf63aa53ba32d50bde38822bdb60de1bb2aadb03be9c99fbceb14893cf33a293c5f764a3d3c8b0dba2fdcecbc5e70153dbe9f973caacc913cd9ca953c63a16abc79712abd41f5aa3a72f033bd4de8073c9201e4bc12f188bcafa525bc0f41123ddbd1c43db8e9d6bb754400bd660dd5bcc339423d6b25123d08175cbd40ced5bde8430ebcb764fbbc851b2a3d4ef0e4bce77b64bd8dcb19bd7207073c117bcb3c094b95bdfdba513d548d153d1a9b3bbc381c743c17fc093d7ef948bb67bb28bd1752413d50332d3d72328cbda64ab83c5037c9bcf0e152bdaf178ebdb272013b9c56b5bb33a1ac3c880cc0bc17547bbd151d8cbd97dc8abdee818b3c01c0d3bc0abff7bdb15463bcb3c435bcf26aa33c7c4ed4bcd8ca823d7bcc0a3c08e188bda45c5dbdc4d5623cb65b46bca91e2cbd2a42abbcce0cc3bdb412973c2cca9a3c52bcdd3c344fb03d315c48bd276bf0bc8d2a8bbc925c633d02c06e3cfa7b253c97240e3d5a0cb1bdfb112b3c88206c3d1843023c4a7c5e3c2e836ebc05f2e7bca805ea3dcfae7fbc0ec31abcd7e32dbd44fd02bd7d3c413cb283593c0dfd793c78b3cfbdc6a56e3b837c323ad7ee10be6eb8213dd9b9a0bd8d6f2fbbe0b65bbda899a2bca0513c3d7d7a86bcc4971c3c0deb25ba142e4cbcc3b2c23d642f97bc2dc5173c86663fbd3b0ec13c969acd3c657905bcd0b3293df725c23cc7ca82bcc9deb2bdb382273b2516bc3c5940fd3c200b48bbecd6aebd4aabe4bd0f0c613d99c17f3cf6371e3e8765b7bb5d3696bc542f9ebbd362353d0224a13c741dc3bdc80002bda30ba6bcfcce163d6545aebde813893d6d3b82bcf3ed8fba27db8abd47888a3c6772ebbc492703bdfde506bd975e9ebd902d213ca11bfabc2cac923ca5aa28bcba5b663ca28bb73df4ae2b3d4779c03d1dddbe3d4ea0c7bce251d0bb2d37cbbce4cb80bc9067273c73e5d6bc78d116bc2e05c63ce4c25ebc02d8e33b41ae28bdcff7f83ce46e7ebc1c893a3c28f816bc529e073d4782b03dd3ef2dbdc6d789bcd945663d8b97423dfe3fd83ca60617bd6bd2863d3197153df021d03be27bc8bc0ed6b4ba765f7b3dd69021b990ee953bfa4183bb68da33bd578ecb3df26d4cbd4e7dabbca440c8bd2ca9533d4c282dbd27c66d3ca053fabcf29166bd95bfec3c031dbfbcfced143c3f87f7bc3fdd9d3d3b6506bc3bfea6bcab06da3d4b939c3d6609ab3cd56c81bd4df8d13cb477af3cbf0b4bbd	2025-12-26 09:51:53.427	active
cmjmozuy3001quw681bktrj6n	cmjmozuy3001ouw685uga4759	cmjhf8tpt000huwp4bch0j5nn	\\x196c1b3db47923bd5ec1023e8a39b43c47d7bd3cf5d7ef3c518f18bd5e93763d4e00a83dd53d143bed4882bc45e15cbd0400ef3c8da7f63cc22eeabb7640ed3bd1b0f33df0c8ae3db2c20d3ca8062cbdeedbbb3cc5208f3bb3ece23c3b128e3a146d16bccc0f7d3aa0c585bd91a9d1bcf47a6abc4140783d0f05263d53eb03bdb4b235bc0f178abdbbec9b3c993982bd6c66c5bcd30d9c3d81247cbc8c5e783d0d32bb3ced32b23c5eae4c3c3b7a623d3fc8733c024cc83c07262f3d23b6f13c58da563d35f0c53ca92470bdbd05653c768394bcc716843d437ebf3c20684c3d2b3d07bdf434ccbcf04c743d45fc8d3dd4dd573c61d9e8bb7529ebbcd8abdf3cdf866d3d2365463d63e18dbc0a1434bdfe68c93ca691ca3d43160c3cfb3fb7bbd4b5983dc938d9bc745347bd8b59a33dbc25653d32eca6bbdfef333daeec6d3dd581a2bc4feaacbd9d91e7bc141d15ba66121f388cf846bd2085bd3ccab947bda1b2423dd96cf03c7969efbd3c53e43dad0bd83c88cc16bcb719053cd9ab1c3d4dd735bb3933c43c6dbd3f3d452331bd0786773d7c00143d86b2c13c398d433cd6994dbceff1dabcbe5985bc0f3358bd51aa083d529b42bc1e92133dc3469a3c6c89d2bc0a1204bcbc955ebd4f1d7bba1381c6bcb80f46bd49edb0bda8da783dbb887a3cd712a4bc5184b13cfb1eccbce0e99f3cbae6103cb156623c0ce84fbd0eec90bc3f16e6bba93c5b3b3fb121bd33f11e3de130de3c2ad5a6bcc7dda3bbdbb3a0b9df84513c2220793d4936f5bc2a70403d0684c33cb55aa3bc621329bdf513cf3c614a5d3dba7e2fbc0fad76bd344220bd497ab23d2bc9103d6042ff3b60484abc0ffb07bccb3f97bc19655abcf4c71d3d861e0a3dcfe89abc5138d23ca3418a3c2536d43c368865bdbc45263d6332573d7b44303d85058e3c270c08bd5bf9433bb141e73ca8e79abc18da4bbc00be183dd808263d7f80a1bd4c731f3c90adbabdc6683c3c3f0bc33c8d2644bdb09a423de204f63b12875b3d973789bdf737b63c020813bdfe100bbdff8b40bde4a08d3d9dfb9fbd8945923cb4d4d83bd96e2f3de6b8b93d3dae59bdc95c8dbd11baaa3d6dc4823d26345c3df62a40bd1932e0bb8a0024bd4e97243d4721763db542d33dbb493bbd702087bd5eaf88bd2bb9c93de793d5babbb342bd34b964bdcb8882bcd0de84bd1facc4bb99e180bc512701bdd5f3aabde8acdd3ce7a41b3d82637d3d353d483cc9c6e0bcd3465b3c46061f3da14357bd80e10fbbb3c7663dc6637a3df79b033c2434ba3cca4d74bda236d1bc704a50bd239b0ebc95f7b7bd1db609bca1607ebc09a256bdec19a73d3a39663c206734bd652c8fbc7ce3083cdbe5d03d802025bdefc4303d4130ec3b375862bd44be933c6e3f873d3fa20cbc4103173d2fe5773dcca5ab3c70b183bc010a683b459fedbba9138e3d73dcf23d2e983bbdcbcf393becaf98baae0adcbbb6981fbd628d26bcd1c5cf3b90cb123d5dcf01ba7d0d6fbd650998bc605b8fbde19a8e3bd6fd883d5940013d6c10c63c1575fcbcf8d7463d10f34e3d6cca193c0698e33ca4f4c5bd195e373dc74186bc108fefbc2bec3bbdf6c4493d3b28f73b7ac61e3de28fc2bda7a311bcc52daabdd0f3103c4f223bbdba4cd0bc6a78313c4f0dcd3d66981e3c41a1853cd1deb6bcfaf89fbdaef2a3bc2bd6c4bdd450d83d13c09b3b531e913d82484f3da54e5fbdf116f5ba2118c43c9563aabd799f7bbdca3638bd559e053dfb67773c400fb13c77be5fbd66984a3d788a623d514d5ebdcda716bdf6ba8dbd04320b3da9627ab935cb023d89b90d3df5b0a93c3bc491bc3ec37dbdb250993c225c203b85ca48bdf627e5bbf9d74bbdd829ab3c86fe7e3dd05a5fbdd4bdd73cd8d2943c763e5f3ddad595bc49663cbc7b00b4bd0a6e193d4d0e9abcf27695bcd8e019bdd3665abc7959253d7c8599bd64b0073d5ed10ebd68d0abbc01e09a3c570ba2bddd1f51bda09f59bbfccb303cf42ec9bcde01353c5ca3e53cf32506bca08f9f3c2e63e8bcc92027bcee4d66bd690cccbc56a1acbd37a3093dbafe1cbca61d763c7cdf973d07b7db3bf43d5cbd289a29bda88f88bda59785bd2cac07bddf40603b566d90bcf14c1f3d72f235bac909a3bd9db28abc56d629bd5b401cbc07da103df3ec38bcfa09d73c0f7c98bde05e6f3cfd30873c6a2502bdf9d95bbbacdde43cd03d1a3dd25f62bda8a391bd8e326f3db9c4fd3c438785bc015023bd0d62693da006d8bbeb5614bd3775d63c1e66f6bce8f880bc284b923c91d297bc1f3143bc58e0f3bc56b8a93c40487bbdcd2639bd7559583d96b2aebd7649653c4f7566bcb0d64bbad73b9abcf582ab3c6ea072bc00c4d7bc38624abd2641c73cb23f7dbba4b6c53cd2c076bc57a693bccf5cf0bb82e5433da21d2fbd31b441bd7643e93d867432bdadf732bd22a401bd66630ebdfa02f4bc4713893cb2a07e3b0b4f80bc278e7a3a5af385bd1c894b3c40c9133d6bde943da475173d5251ca3c29ffabbb18fc4fbddd96903d2e82833d1bfe04bdd19c423c7d5a87bc7d52f8bc9c7ca839d9b5913ce0e02c3d6252f33b0141d0bc971b383d91eed0bc47dc323d0dbf46bd82a879bdf8438bbd95dbf3bc316e463df376f9bc71f05b3d2e1aba3d8eb17a3b281c3e3c95875dbbb5a5363dc22c5c3c02452bbc4adad2bcdb1e003ca043193cfa7dc83b5442b43c7711ffbcc8c0f23c5fa1ee3decc778bc3c99233e5d4a1fbcd198e13bd2956c3d0cac1a3d1a9561bd74d3243d7ab3dc3c3091c73a2609bab9526f9b3d2cc1ddbc6434e43b28e3853dfd3f153ccc1d08bc7c25c0bcb8b4c53d2c29c63c764146bc6f65d3bb6ee7c43b112281bc	2025-12-26 09:51:54.22	active
cmjmp3j9e001tuw68p5vrat7j	cmjmp3j9d001ruw68fr0v54h7	cmjhf5lbn000buwp4ldob8nzk	\\x75383a3d92390e3d7fb293bc799ad2bbe91e03bd31e1193db8543b3d3c276abc305f343d815c5abd20a1313cb91409bb3674bb3b925729bd451484bd57adbabda7ff06bd9f2c23bdb1b750bc2e14c8bcf4ee243d68ad1eba9273c33c930245bc003f703d8f3b283da93082bc063c7ebbfd85df3c040e003d2a82c8bb295014bd3136c33cce14523d42dcfd3c6f94edbc7d3e49bda19139bd4c123fbd6e83d53d9742db3cbcb86fbc50e37d3ce777d73a5908f4bc263789bd093becbbc250a23d01a5563da54a7f3c46d7343d12d82e3ddf6d41bdae28e83c2eb8da3c1be03a3dc27b3abd6540fb3cd3f81dbcf4abf0bc519a18bce785b3bd6a82ebbcd9b21c3c0395f6bbf3bcba3b6537b73cb900213db8a0a63c2ce7eebcd943843d080cc73cfc8d413d0507463da61f973bfbe0e63c6a24edbc55890d3da10bbc3cf1bc70bdf4081e3dcc238fbdb0e7083c90b4163c0d36673d8ddce1bc2f2fc23d283ff1bd66464a3cc8a7ff3ba9256e3d7ff8923d6d61d83c98ad0f3bb2d5d73c58a03a3d935620bd7c58f03dc626b7bc5adc07bc10efffbc100c42bda344973c89462b3d4e766ebd84489ebccf8ec9bbc1fa293b42e5863d738ee33dac0fb6bcb89aefbbdd83113c4adb53bd4eecd1bc8c9744bc1f17cebc695f1b3caf5b5ebce8dcad3cfb3d203cca6021bb8be40d3d2cef10bd5231b63dc0a8c2bb91ebda3b5ca7e8bdf8b345bd3df6253d8adea8bb6a27643c6cda62bcadd051bb8378863800902f3d5cd7b23b5f8d2cbcf249b63cfe192cbbd0e48ebda397a83c4efd45bd57f2103d12ad8a3ddeb0843cb0f0fb3c596816ba8628bc3c330a903ddc891abd9704dd3c9c7af43c843ae8bc6f9e90bd010be2bc5cc7c5bb0e4a223c5167133b51a93b3dd7268a3c9543bdbd520f023e1e014dbd91f3c43c739a1e3d3e2a35bd4e1b97bcb83c95bc3b8aa93bc3efdc3cd40d2abc9aaba93be6542f3d14953e3dcd43043ce4867b3df6d6fbbaa3f8383b08c68dbd577795bd4934d23b3a07073da32c243d5beedfbc2fc5963c03fb7bbc7ec93fbd812bedbcd4c8653cae363cbd4936833c77cc063ba8fec2bc9b2d82bcf770313d69f4123da42a153c7aa18f3bfa2938bde8b7153ce6379c3d8f4c8cbbcef3443d4e5f943d5b0a8dbb9adad83b7503b33c430df63c635fecbcf810c9bb3b9f123d9df0f4bd16a882bcc9d0b8bcc860df3c6a89e3bc9e5d95bd239af1bdd24f9d3d513bacbd9a70b9bda96ec039a09a603cfcdf8b3dc9c1aa3d51f39a3dae1e393d3507ac3cbcb820bc226019bd0579003a426589bd58a64e3c49a3633deee8f7bd1b0d623d2206063c50d391bd5d52d93d617b06bc281b7bbd5b18093a1781ad3cb8dca23d8843173d926fcd3c602d003dea817f3ce2b104bdefb7053d0827473c984e92bb02a84e3d9e02603d953ebcbaa6ed173e8582533cb67113bdfcb1ea3a014de0bb4872ef3b93d98a3d76e914bdb012ae3ce480d1bb2464c43d1771843d4aa186bd75c8b7bd3b2a67bd8578cfbb113073bc7581b9bc0170123d01ebb6bddad9963c9fbc66bc8aed283d30eb993c104ba4bd1e6250bd8a2ab13de51a1ebd263ecf3a282c88bc50f6a23d701b353cac709cbd4a6ec1bda5e1053d34b5583d97910abd45d1873c697f1f3d22e91c3c5ec13ebd08bef93cdda288bd2fd4c1bccb2a95bdeeca19bdec9653bda5a9983c3865f33b1fcf563da9ac683c64cc823d36d688bdba29db3ba065f0bcec7e71bc2e672cbd447e063dfcbb093d456c403d3b55f43cc81726bd9775853cd953abbc77034e3da71456bd93b1fc3ccea076bd390a4a3d5e4c81bbf2cdea3ba9d1afbc8ced9bbdd760e9bccf09353d2fe5893cc614a73d3ee8353d4bad70bce281f2bc05dd93bcf95c3abc920a343cba65d8bca7b9a03df8a4db3cadf8fd3c2c7dec3c782d123deb9893bdf04acfbd71ffc8bc9d9cedbbeef9bcbb387adabceeaf60bbb1f31c3c9e9a913d0c0dabbd67a5463cfd0cda3c4a0dc23bf5ac9d3b1882293b76cafb3c3e1b4abcba480c3b7d5e8fbd845ba9bc889c003ccf6f9b3bf81dafbce13596bc6b7400bd1d4e3a3b77003d3c48a565bc1ec62d3a23f6163dc4b653bc6a84903d255fae3dcfc60cbd1cd452bd8d5ff03c3754863df192c63d88a661bdac03cbbc112f52bc41efeebc5c85683d7677b6bb3295d13a5f43b93d390e273ca1c47c3d44baacbdb98faf3ce4bb33bd3d4b753bf16867bdc4b74d3c029f043c010985bc2508ffb97e4c583d25da933cf18255bda86dbcbc2b1a9cbc84b00fbe3070a23c27764cbd1087c33c87383abde7c95ebda96d6abc97eb97bdcc39ba3d8abf043bb3466a3bfa2f843df2a25ebde25e2a3dcf60b93caeb346bd658890bd936e87bd9c7202bd653505bd4b1a1bbdc202103decea063c0698853d472f513c840b013dea93243d0f2b633cc67a47bc5a80463dddf028bc4918263c887f90bcb8e867bb72cc223d641c53bb435df03af0c00fbc9ed6e13c1f96a9bbb7638b3cf17f673dc462a03b3bdb48bd2ea2ba3c1d0e113dd3b8343dada892bb605806bd81f597bbcaadf13cbe0a85bd3e713cbd2830c93db1ebf0bc1a6109bc6e4dc13c1830b13c56e54f3da54849bdd715dabca30889bd6e8b4abd1721383dc04e043c7f6a473d4adc1ebbd1e6eebc49e7023d1ab21c3d85a5abbba801633cc3ff543d752f4d3d4cde5b3cb4924cbd357fb5bccd87353b0e06193ccf588ebc10b8503d74e0123d768f6e3c90aa4b3ca261c33cd76d633cb309aabdba2b97bd90dfc53ce13447ba60b8f03baa74e5bc50c97bbd1bbb93bd322be7bbee56923d92ac373cba83e8bbb9cc12bd7658d5bc1d40bebd4e7b18bb4151303d4a27c5bcd1ca99bc	2025-12-26 09:54:45.698	active
cmjmp3nqr001wuw68rhiuoz5l	cmjmp3nqr001uuw68weh9sbcg	cmjhf5lbn000buwp4ldob8nzk	\\x001d8c3b4530f53df97c27bdb82684bdc1f327bc0abe00bd38ac1a3ce3df9d3c4d9649bdb8c7c23a9fb6e7bbdcf4e8bd01048dbd5bbb4abc44b251bdbd9ae2bc782d9b3d6e2a7c3d4825dd3c6f9b1abd93c1c63bd8e49fbd9c9fddbc2e48b83c392e0e3d8dc261bc5506d03c6aeb3d3c3fd23f3d677de53c0d5230bdb71ebc3cb323f3bca8f700bd917626bd07883ebd833263bda30c1f3c26756a3c6918c83cff96933b607cef3cfb33c43ce45cbb3c31f11a3df2d70f3eeefc103c1023acbc648a33bdbe8f3f3d0ebd943daaf8a23b46f5743d6b98503df6bd11bd1b7d563dab9089bd883f9c3c4735d33c8be3b53c98dc323b2610eaba0b28abbc0a5ce1bcc298b43c3340f3bc051f85bd5092133d988b563cce6e9b3cb8d53dbbcdda7a3c021ddcbce11303bd10efdabcc2b11a3c7c4c2e3d4bd23f3ce8c08e3c7e639d3c94b72a3c8c8b07bc5bf256bdbb0f793d3543e1bbc20194bd9f1d133dc5060fbd631850bd573b2b3d707786bcf4a0dabcfcbe643dcb6a8fbdbc63a03c768953bc943dc43c51aa763d46cc6e3cedd7d6bd2f68503c9724c83b096ff5bcbb2e55bce309aa3cab8f56bd0124563dc9a257bda75d8a3dfc76473dc62f9a3c1e786dbd41b9b63ce2e3793c138db7bdae12a5bc66ecbabd6d58e4bcd96116bc63374b3d181b6cbc4357a23c6ea0e83d1e02fdbb390ed3bc7dcd843c4978523c54eaedba19be0bbcb85bf93bbd9f873c715a99bc821b6e3dba578ebd5801453d3b05f1bc5c8141bdf41aebbcf76b143d545fff3c510880bcec73283d7485ea3c562e4e3c5d0cbcbcfd087a3c71d20e3d4692a6bd6699f7bc0ffc9c3cb1f096bb758c88bd1ce1ccba84e28ebc0390b9bcf793303dac1011bc53680f3d07ea363d13e1243d6653163d91d3c23d7e084dbc2ba067bd6c88bc3ca4c5df3c08f428bcf4238fbc3bf5f3bcaa8f083d4f8ca43cc901963d9b2fa03c88fe8a3dc319603c638515bd47ee4abd9e35123d15b276bd730fa2bc98a60b3d2fc8d13c08ae853ce830213c175d15bd5aa4ba3c703d3a3d71f9ba3c1749a23c6d8c803bad72d8bc59f182bb3c0606bda982463d43179dbde287dcbc629db53cfba26ebda566d43c38b837bded1c2b39b2ed28bd2b3a53bc0dd847bc3216bf3dd51d15bd08ea33bcb6811dbbe4c741bc7170a23c3de5c1bd71be2bbd8750b83d0f4a6a3d5f7877bd2a28933d627763bbdea1903d5f32d0bdd1ccdf3cd7c2f3bce37791bd02c831bd6d023abd7df40fbda18e09bded7d443d80efdf3c29bc12bd303d0bbd2b06a93bae7a463dcd1285bc538b193da3ea053dd77837bdcf210cbd134b78bc3797e73ce797333de7fa63bd036093bc3738b0bafc34663cf940513c39e246bd717a103de50cb33cfe6a9dbd19145abd8fc1813d45d051bd8c098c3df25117bca1e710bdcd69423d0cc979bb75e6bdbc32914dbd7b264a3dda994fbde8f8c33b762f6b3d63912ebd16cb19bd623ff1bcc206de3c0e396ebdccd4abbc6b322dbd8ef60a3d2ff10a3dc784483d7648cb3cf55d2abc24ae063e8e3ab9bd34a90d3d5fbb793d6deee4bc95c90f3d372240bb477f8fbc42618c3db6e679bda5ace4bc76a0bc3a3c6a5c3d8052063b4371863cf8f8b6bce51dd03d9d7ea3bc9b0469bcd561553de24cd33c6df7d3bb77d5df3c5a9906be9c944d3d5610e6bdee8e3ebd82bff1ba7079da3c1e7fdebc07f1293dfd1ef4bc38038cbc99d93ebb6be43f3c7d33cd3c022ae4bc5d8e493de086bbbcaa2614bd6b1d31bcb0bcbd3aa3c396bc9eb855bdf51c85bdc2588abd839a3fbdb2473cbd4d5f5d3d8c7abd3dd46be8bb7b9ac9bb649d06bc902c9fbcaa12cabd77b488bd7417b63c148749bdc550b4bbd698f1bc878baebd652aa6bd65e27c3db81b25bcfae0853da060873cd62263bd1be58b3c83fe65bddabdbd3c61628dbd3494bcbaddc7cdbc1440b2bb32df3c3dbccc073cfa7a12bd90d2363d74a6713c317e79bdf657acbdba0494bc2cddfd3c9382853c8fc309bd7753aa3b8922ddbc40a2663bb171a53d8f7717bd818259bc2616063de7f688bb59710abd7737113de082823d8b78f23c6228d73c8e9c1d3c6ecd2f3b0c5e8bbdc24e0b3d7335b1bbbc7cdabd1fa3613d1d52f6bccd28b13b31903dbddd740d3d3e6f1cbdfbd90a3c568e93bafd50be3dc0f49dbcf013d43cd079debc78ad413d9ec3143c72b6283a6c7b21bdf78c783db17405bca64997bd907105ba9ccdd2bd62e992bddccb9ebc4480edbc190b95bd13189fbc2607a33d9fea8abc30733f3d121fdebc185d8fbc30d8af3c4cc806bdb94909bd113325bd25b30e3d4444843ca6fe243da9f704bc100804bd9ff9e73bd039ce3c49689dbc2d4a15bd6985ad3c77383f3d8d121ebde33e7b3db9280c3d152f78bb284e59bd8367d6baffeffcb9b888ab3da7f54a3ddf5c0ebdf02f95bc941203beca59c9bc1f4f9fbdbfcabe3cbbe40b3cd4359bbc0bca4abd02426a3bb60fa63c21f2933b6ad9283d91caae3c92e3aa3c80fa05be9a0bd9bca498d63cc91ce3bc2aee193d5e8085bd5bb113bd82f7733d7ab320bdc0f2a33d6e855a3c0b8ec93c9946c7b9c78894bd21e4b1bc6052e239118f323d5bd91f3d6b313c3dc677d9bd5585c2bdc6210a3d915140bdeafbb03d2a4193bc816a473b04a8e53cbdb250bd2b8664bb5a44c63d5f9fa4bc3ae9543d707e65bd1c0c1dbca5a9053d912d8a3cd8be893cef682dbcbe84143dbdb33f3cc616483d60f96b3c3a66833c286d863c52e5053c09d05bbad6a1733cbc1b653d9e322b3ca712a03c59e16dbde101953c625df23bf95c523dccf81d3d64744ebd740f4ebbdda31cbc14757fba2ac4733d53f8dabcd90874bc076fc3bd	2025-12-26 09:54:51.508	active
cmjmp3o98001zuw686r7i6uqi	cmjmp3o98001xuw68eba1iw8f	cmjhf5lbn000buwp4ldob8nzk	\\x5c65d73d983ca5bc7c40283ddb1dc83c355bbcbd149c653c3c848e3dd4fc13bdd8a4093e14a25d3de55ebbbd1aa6363d631a18bc359881bd39d2d43c68e9a3bd59c8c93c76a2813a8d1b80bd3772233ccf55293d800f963c0fccf8bc43ef41bd38fdcb3d1a8a9dbada3374bc1cad32bd692da4bcf320223dd81724bc4aef933ae63bdbbc5624693c1777af3d52f8dabbd9821e3deb3ad93c429f51bde1add03ccc76b43df48f9ebd5cde5d3d41db073c9dcc8abdf21b773ddf88a8bae7801d3d6321bcbca53796bcf08e15bc2304213dcb1cd8bc4ed4bfbceaabf43ca29d9b3dd29af53c7f90123d7f5aef3b6d71563c8b9e1f3db9be8d3dfba20e3dc381023d9166af3df9820bbed0b689bd006f83bbe43966bbd9c8ac3c309f483d578d15bd36695d3da9bf043dcea080bc7261c43d2c5dcf3cc2e528bcc5bd64bb35e457bc07ea19bd1e6500bdb10c613d623514bb929d89bd8c0134bd3f36883c49d7bfbc6a0282bd06ef43bd26be8ebc9f4c883d32ab6ebdb951a83b72d1143de8d7cebaf56d813cbfd0d63cdeebcd3c60388c3a997c5d3dca99f0bbcd49ae3cd938083ddaabb83dca39d3bd82ef09bdf4a58abdae7f073df54029bd7a0a213dc2839abc4dd9a5bd95a043bc5e0295bc4ccf95bad9290e3dac41ef3c2dec613c471ebf3cd01f083b011a863c808268bb648328bd04f5823d58055cbd67c57b3db967c53c7eaced3c1551083df9a3763dc60333bcb813bb3a88f51d3dca05563d5f43903bff0ca63b6054bb3db2396e3b0fee19bd062bcabc67af35bd037fc03ccb981ebdf19ef7ba223c803d531e343cd12d49bd895ec43cf70c0d3dfb16b13de666dc3b05df1b3d473a90bdbf58bdbcf66610bd22d33a3b4ba624bd246acd3c8590793d0ffc833c1b44653db199a9b8c91f5c3ddeb3ab3c0567a33db178453d05e698bd53012fbbf5bb6e3ccab8e9bcac344d3df7e71c3e1bba343dba479ebd7de9033d1b630dbdf097b33bd2048f3cab68493d76dadcbca10300bd8908f0bcf8d59dbdd7921cbd17a8bc3b03f37bbd11e0c5bdf381f6bcbcdf4cbb97e5c6bba8b047bc42a3a0bdcd9146b85651c1bcae1c9a3cdb63393da71cf6bcd6c967bdc3855ebdca553fbda85722bc917eb4bcdeb7b23db2ebb13cfad5dbbcd7ce023d440728bd8627493dbe024f3d51c723bc7af2ddbc0b1a62bdb1e2cdbcac4524bd372f0bbdbaacfabcbb128abd2e0a74bd311a33bdb065d23c3f66c73c3aea9b3c0095953d780c0b3defd890bdb4b6b0bc655e633dbd9c8fbce78602bd53bd48bda9b237bc1615ce3d56bfe93c21eb703c01a6bc3a59aeb8bc98df293dab7271bd05f8083df001c5bdf16bcd3ce4ba91bcbdda20bcf3d0293d39c8703c8d8e323ccde14bbd2f96003cb56f0c3d8ebbab3cb788163d6f97813c1f76773d22fb7a3dce66f33cbed3493c38456d3d3af6ea3c2dcbddbcb57383bd12bb103d9d898abd66d7003df43b0b3d4d17c9b97c79833ca05549bd9fc3d13ac4ebd7bc6df3123c13b39a3cbf8980bdbc18883db604ddbccf7812bd2e84143dd075a23cc1f5923be8114dbc1640093c52a541bd429cab3c810b613d6762353cd94e743d98a3ab3c42a0973c6e4c91ba5a7893bd4ec7363d275b6dbd233b213dd613b6bda02b79bdd9f6803d2de89fbc9aeb07bd034c9b3d899410bc94d439bc25c4c1bb813e19bc9a4fb33db94ec53cb2b59fbc15172e3daab74dbb768e24bc31fc7c3d99fc98bc82e5523ddfdf9b3cb833e5bc6d73a63c96882f3d01223a3c93c9c0bc9df9f93cad112b3dc5dd04bd2f4373bc608cb53ba7624f3d7a65c73deea9513d343db83ab4738f3c1ff2053b10964c3da28f2c3df7fb0c3dcfe9233bfa2869bbbb0d313b8f02793c73e3423da2e2f5bc3216e4bcb9928f3cd4e6063d9bea5fbca2c7283d54b6563d282266398ca2283d6badb6bdeafd5cbda73152bd3efad2bc81d5553c61819fbb6e179bbc3bc48c3c769163bd4dfc9d3c26fcd9bcebdda43cbf9082bb51760d3d79b797bc29af8cbc92407c3dcc804d3d53d6913c07e29ebd5164983c263d18bd3281f13c78a019bd2454933d4bc3d4395ec331ba5f959dbbf16bddba12472cbc5fb10fbbd5b25a3d8f7e4bbac9f00a3d7c59d43b5ba5813cd979bb3cee43f0bae955263d1e46a6bd67c4dd3c84c0c4bb78bd273cff1e99bd609969bcf7fb8d3d1eed23bdb5e38d3d4e7d46bbd87719bd4b4646ba3128513d678f823d981e0c3ad8f0683c630ad23c69391f3d04c0a83b85490cbd783604bddc567dbd2793d2ba7cbe5e3dda29adbc9c65c63c1a13903c7bc5ac3c75ae08bdf67a963c6cac80bb10376d3dd2e3293d329193bd3a2885bd265e80bd2843803d8fa951bd3a5f0abcff90b5bd151fdd3c48102fbd971de4bc4366cb3dad8d0cbd61dee73c45d54f3d03f5113d506824bd8092a73cf647dfbdeaeecfbde5dbd33c2149c3bb6c7005bd985ef0bca9bb35bdc8c8fbbc0161f739654ab1bde3ec7b3dab9edd3c1da72e3d1549af3c00c2e03cc870f13aa9f0b5bc999a193c99ed203d12ff2e3dec0fee3c2cd6a0bd54cb4f3d555802be0cc42cbd45f0c03c0c050abd3e5614bc0495bcbc547da03df49d17bcbc1c64bd11d6643c53bcc2bd4e3cbdbd57c8ac3b0a2178bc46b88f3c833d18bd894b1abd9711653c6b6bf13b0ba4dc3c999aa5ba11aeda3c0fd3fe3c3dd8c03cdaa3d7ba0cf15cbc3f201d3c20b00d3cc0831abd40bca03d11b78c3dcb09873d9c0101bd20d565bd951297ba77bb1dbddc57ac3c95f5a7bb40a3ca3c1f07f23c90323c3d66aaba3c09150fbdf042293d8e043d3d1fde09bd56171b3d35e468bd55fa983c42e8bebc6b5376bc909c003d41a7cdbddf9026bd	2025-12-26 09:54:52.173	active
cmjolble20002uww4eeqi9nej	cmjolbldy0000uww4t2nbrkwr	cmjhf864m000fuwp44amopano	\\x909c8a3db6d7e5bdbfc200bde6d650bd413954bdb933d63dae02363be2e2273dcef1e5bc8f2d90bbcf88f9bc3ec504bd71e69abba2e0dc3c658cbcbcb75c213cfb5f8d3b390d03bd8b2df0bb18c7ec3cd841483d81c7ca3dfa459e3dce6830bcbb89463d02005d3cc61153bddf5d91bdb708e9baf1cfcf3cd4d2a13adc5810bdd180923cbabfc8bc05fbe73cccb299bd7a1402bd6084393d54e0d2bcbcce89bdd5800c3d3803943cae97653d2c7ffa3c677c973bc05818bdf093b63c3c012e3d92bb54bd73bf06bd207d703df4844dbde23cf8bcf576203d403ef2baf0b6a23c8c8ae83c4f540b3c1dd4dfbdb3bac43c873d82bb6f3382bd5bbddcbcf6f8843ce2c62c3a60c0453c9b493f3a87fa1fbdb51f80bce678083df6a36c3dc03ee6bb28ba24bce2a092bc60d081bdefdd9ebd5328fabc2305b73b24c30bbcd788123dbd6144bdeaa932bd8da522bcc85cbd3c2c8ab93c70c2ccbae0c9f23cc7481fbd3ffdadbc4154c2bd3ceb4dbd5840c8bcf1da29bc57a8b93cde4589bc651015bb7dc59d3cbfb1dc3c8fd82fbbdd99db3bad9b59bc99f0f43c4524373d63aea83d9440313c3330dbbd6d43493d59f57cbd9fd9f8bb2adbf03b07b9d33ced4274bc684878bdb82c2d3d3df4e23d55a9e5bb0a89263c789fc0bdcadb9b3c43c4dcbb0d592dbc1f9e743d5856503d7d7d6d3d9b16f43c1d53133b2a772fb705b6693dc0c4fc3c0c110b3b52214fbbd316ca3d0b340fbdacc9b5bdd096273c5f6924bdc5a0b93c8f9d1abdbb7d96bd10b50ebd81b23abd7d638dbd609f353c8bc805bdb5a017bd727f163dc168593dd01fa13d0e7195bc45ad983bf0bd8e3d0576ba3d12ef5fbd04b890bd2745f5bc5ac736bdaff6c8bb5c44f9bc7364cf3ace9e203ad3e9163d0ca5c9bc291d94bd6fbafdbc0049c6bc4ece38bc2e7b813c8fe472bcb54330bc485798bba5bf79bd6f7ba03d8440a0bd2437a63c8e8e533d4573403db786ecbb4525813d7f4d813c7dbba53db1e4ce3d02832dbcfd36ae3df5cf2f3d055fa4bc8949823c8e3f36bcc02472bdad20023dde66cbbdbfb5b83b97c8ccbccd14013d39edb1bc765584bd05abafbd86c77c3db9a63cbde2a0913cbcd56ebdb2ebd6bbf3b6c1bbcaf5973d5391bc3c028c3fbdcc1c823d37612d3ca200b9bd1c60c83d3d585d3d37251b3afef29b3d9d40023b42db80bd13bd2dbd63747a3d1f86893c019198bc3c00f9bb26e217bd6a643a3b628610bdcf171abdd0100fbd50dcd8bb81751cbd06de9ebb3157c4bc1992b93d2e43a2bdeb58203d3d5e8dbd9b1f863d440fa23c7fd1963c44d89b3c302e80bd9f0853bd5ea6273cb4f58a3dce6e3bbdcd099ebdf3c106bdc37f393d3dd0823dd922733d3e02d13c81a2393c960dac3ce5e812bd75efa13b20c880bd2c9ef53c107c963ba0c998bdf2d94abc0f0b02bbd2fcb7bced7d3ebd5ff8023edb43edbc5c3b2b3d4b99e13cc9026abdc02c7abdea107bbd2afce33cc2d07a3d018a04bdff0a9ebde669b93c16cd943c71c06e3d9b268e3d80f108bd866986bddb141cbde911e53cfbff663d4a05013df71343bba54c2ebd7845783c46700bbc40fee23ce19374bde4a21fbdeb61d3bccae84e3d9f9b2c3c4f26d03d47bdbbbc238224bbf1db9e3b4819e13cef88ab3c62ca0d3dad682a3cd730283d6f97483d757794bdba9604bcb7737ebc03132ebce3d9b9bc15c6ee3aaf045fbaca1febbdd2758f3d8dc127bd602512bde3cabfbc2310e43b65de433d629406bd8fce98bdd97b2e3b50a3a2bdbdbf02bcbd8be7bd0e75acbcbacf66bd344992bb480b02bd5600873bf0fb253d0e6a68bd16a2383cc25bc7bd9828e6bca545f73ad66dd83cd06cb1bcc1474fbc1ed743bd8530853c043a00bd91e4633dd3463cbcedaead3db9a422bdef343bbca09b43bd743500bd87a6a4baf994463cf597ba3cbc01003d87e4853b138d533c2e480ebcbdf6133d7fada0bdcf170dbd5a1425bd460ae4bbd6a2ce3a6071ec3be2a71c3dafc364bd55a4c63c8457833d378d523c0b00fbbcb947083dc4102d3db8b4a23bf3d5ccbce16e3cbd3fab0a3b2681c33d5327973d6fba06bd05803cbd486fa6bda92b3c3db0e752bd6d2767bdf915b73c372405bd4d8b6cbd05514f3d49bc80bd153c753c6b11d53c4068773dc5938f3d349959bdeb9772bcbe56733cf4ad903ca54cabbcbe513abd5a48a33cfec416bd4d5e4a3db1c6c73c69386f3dca435d3c295bcd3cbb6158bd9b0c903bbdae28b758b57e3d22f08ebc95c3abbc50b54cbd47019cbd863601bd1e4e113c991749bc59310a3da81393bcf0c5863c4ae910bcde6d55bc6c63ec3b631b15bc46f8123d8f26b93ab44420bda0ea433b2733dcbd0e8b363dc06c5bbdcaff013d6a451d3cb0a38bbd11cbad3b892ab13d397ba0bb3d2a903cf20e333dc1d13dbcc9e2a5b9e44656bc6a6ca1bcbe5c8539d8af2d3d1b709b3c4f0e813b5e2db6bd03e3433d7e94ea3b1fe8873c77d12fbdc2e228bdd8b5e1bc95bdf33cf1b179bdad9270bc961fd83ba4e60abdeb2811bd090a44bd888e493d259c46bd686f61bdc6ab173d7c93663d51ee9dbce5532cbd579950bcb541073d9f577cbc3c52893c26c91cbd58fe23bcd6a9f03b46ea183c4f9f60bd6dedf43c393452bdce96c83dc6e0933d7a8ad7bcfc21e5bc36da683c61c5b83c528311bd1542473c45d389bbefd0c43c4ad1cb3c3ff1943cf4bd73bdf5e23d3c3a3189bc61cae2bcf64e8c3dfda8b03db788ddbc966a81bb33b5ea3c420a3b3df1cc34b97ecb80bc0c833b3cfeb272bb06eaebb7b3e2833d2df25c3d7ff3a33d5eae113df3f663bdcaafbebc8522453d25e56dbd86f4d1bc7e1ca73c455119bd3e44bbbb	2025-12-27 17:44:35.588	active
\.


--
-- Data for Name: Teacher; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Teacher" (id, "userId", "departmentId") FROM stdin;
cmi1tfnzj0003uw9clylz25ae	cmi1teqxn0000uw9cwkx47rad	cmi1tfhog0001uw9c3noro212
cmjheyarr0003uwp426mxjui8	cmjhewasr0001uwp4ih04dzfu	cmjhev7nn0000uwp4t7wkx40j
cmjhf08z40006uwp49dc4fxqs	cmjheze1e0004uwp4wdiaw812	cmjhev7nn0000uwp4t7wkx40j
cmjhf19iw0009uwp4qzxupcx3	cmjhf0ycu0007uwp4iv5myhgf	cmi1tfhog0001uw9c3noro212
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."User" (id, name, email, password, role, "createdAt", "updatedAt") FROM stdin;
cmi1tbepp0000uwnckm6v6vd2	Super Admin	admin@gauhati.ac.in	$2b$10$QYp5rxzoqvUe7os4G18MJ.nd2I.bzvYrelcYyYig7Y2vj4caWTBlO	ADMIN	2025-11-16 14:29:59.485	2025-11-16 14:29:59.485
cmi1teqxn0000uw9cwkx47rad	Arijit Banik	arijitb017@gmail.com	$2b$10$744Vy.QkHRWmIpqSAfNwPuk1WAae2u/F1dhb4/TjM2STZd5Icogje	TEACHER	2025-11-16 14:32:35.291	2025-11-16 14:32:35.291
cmjhewasr0001uwp4ih04dzfu	Monaswi Kumar Bharadwaj	monaswik12@gmail.com	$2b$10$wAYybCiXvzO5EKMGP0vGluDReK5hQC4IZ1RViqq9YXZ9Cy241TV6m	TEACHER	2025-12-22 17:10:21.099	2025-12-22 17:10:21.099
cmjheze1e0004uwp4wdiaw812	Shubrajit Deb	shubra123@gmail.com	$2b$10$JhVzFQrJORavEM.mEXhGOeqobmH68Q329WprGqp786vb.tsHrkkPG	TEACHER	2025-12-22 17:12:45.267	2025-12-22 17:12:45.267
cmjhf0ycu0007uwp4iv5myhgf	Shweta Dey	shweta13@gmail.com	$2b$10$FJEl3rytvNCtPXLpAnmnie3JArmivKyzolgLEPSiRdsdga1X02Jt6	TEACHER	2025-12-22 17:13:58.255	2025-12-22 17:13:58.255
cmjmoth64000fuw68m9cjpigi	Arjun Gautam Baruah	arjungautambaruah@gauhati.ac.in	$2b$10$o7LEpdm2BHrb0drGt4qfR.E0RWSA0hqJeBXKnTEHdSmom4SNdOoMy	STUDENT	2025-12-26 09:46:56.429	2025-12-26 09:46:56.429
cmjmoti6n000iuw68pboii828	Shubrajit Deb	shubrajitdeb@gauhati.ac.in	$2b$10$226ctkIQdOj/vRICe4rrgOAjS/PP3i4Jbi7uzbTfZJoaHz/pS6kti	STUDENT	2025-12-26 09:46:57.743	2025-12-26 09:46:57.743
cmjmotirp000luw68lqrd4vmv	Monaswi Kumar Bharadwaj	monaswikumarbharadwaj@gauhati.ac.in	$2b$10$JkSYTShFvNT1ZhnXacyQPON534Zse77zglOx5R8.oRKHykdsykHfq	STUDENT	2025-12-26 09:46:58.502	2025-12-26 09:46:58.502
cmjmotjb8000ouw68kxrrpbpq	Liza Kalita	lizakalita@gauhati.ac.in	$2b$10$VEDXfEXqkdRg/5r7kHDuAe4fXe4AHMFSAfv3lkU/0yA/eEUcPjVjC	STUDENT	2025-12-26 09:46:59.204	2025-12-26 09:46:59.204
cmjmotjvx000ruw68p0cj76od	Bikash Nath	bikashnath@gauhati.ac.in	$2b$10$RKphoJdNrzS7mtPstTPrluQX61jFb2NY4iQy4yLVkaFB/aYwJtU7u	STUDENT	2025-12-26 09:46:59.949	2025-12-26 09:46:59.949
cmjmotkfp000uuw68li35qf5h	Shikhar Kashyap Jyoti	shikharkashyapjyoti@gauhati.ac.in	$2b$10$PbolTUB9YqyAwmwgE74SiOz.6eWh/fS.EUV/FmWQzDVsyigvD2dmq	STUDENT	2025-12-26 09:47:00.661	2025-12-26 09:47:00.661
cmjmotkz8000xuw68ipc8w5rz	Bikash Bora	bikashbora@gauhati.ac.in	$2b$10$TMUATYTKJisLxnBX8UgFZutUQrJoMnRVrDH.uf4pnAJXA0dqUze9W	STUDENT	2025-12-26 09:47:01.364	2025-12-26 09:47:01.364
cmjmotlii0010uw68wulaem8c	Abhisekh Roy	abhisekhroy@gauhati.ac.in	$2b$10$NAmMB7QqBF0IGTK7/XH2TuI6oox3SxcFIK9ivvu6isuJsQSTYAHU.	STUDENT	2025-12-26 09:47:02.059	2025-12-26 09:47:02.059
cmjmotm1v0013uw68309900m8	Binit Krishna Goswami	binitkrishnagoswami@gauhati.ac.in	$2b$10$5qneZKy.9U/i10BAlKBLDOPqov.UZG5rVay8bDiUdcfJcy.EXXVMy	STUDENT	2025-12-26 09:47:02.755	2025-12-26 09:47:02.755
cmjmotmli0016uw682sce9pdd	Abhiraj Chakraborty	abhirajchakraborty@gauhati.ac.in	$2b$10$mpnydT5AAv9e2ulww0iLfusz4rQwiEa8R4tFVigDMUqvt7Uf8l956	STUDENT	2025-12-26 09:47:03.463	2025-12-26 09:47:03.463
cmjmozqoi0019uw68lzf0ba35	Snehal Kalita	snehalkalita@gauhati.ac.in	$2b$10$kLR.EkAwdKk7ItNnknQ3SOeH7RzeRdf2nsuKZdxt4wGD4pTGIYPd.	STUDENT	2025-12-26 09:51:48.691	2025-12-26 09:51:48.691
cmjmozs79001cuw68n81c522n	Rishab Kalita	rishabkalita@gauhati.ac.in	$2b$10$SxK5h5gFJsmbRY31vBgZI.JB9HuhQcJ4a5bZKQ.jBpXV1kDKlc.JG	STUDENT	2025-12-26 09:51:50.661	2025-12-26 09:51:50.661
cmjmozspz001fuw68zan8kf0b	Pratiksha Sarma	pratikshasarma@gauhati.ac.in	$2b$10$tuMYnpwmN3QEnHUKGbgBGOyA/zMgMjdYhkp04i5sKaDGszIV3fv5C	STUDENT	2025-12-26 09:51:51.335	2025-12-26 09:51:51.335
cmjmozt8s001iuw68edwxx91j	Geetartha Bordoloi	geetarthabordoloi@gauhati.ac.in	$2b$10$Xb7BhP1AjDgc9LLeLyXsW.ft7QjIx5qdCQK/vrjpVmHvv904bGeoa	STUDENT	2025-12-26 09:51:52.013	2025-12-26 09:51:52.013
cmjmozuc3001luw685v3g0zny	Ashmit Karmakar	ashmitkarmakar@gauhati.ac.in	$2b$10$rsnkNjaWBlug4fmZyhBd1ewsGbgojD6TgTFcDEFK0uUKM1QE0zTQi	STUDENT	2025-12-26 09:51:53.427	2025-12-26 09:51:53.427
cmjmozuy3001ouw685uga4759	Kaushik Sarma	kaushiksarma@gauhati.ac.in	$2b$10$lB22rZN.yTfsyRD82Uk3Iel1E16oSLM2Fqr04ec3VbNyv6019.n..	STUDENT	2025-12-26 09:51:54.22	2025-12-26 09:51:54.22
cmjmp3j9d001ruw68fr0v54h7	Prasun Chakraborty	prasunchakraborty@gauhati.ac.in	$2b$10$IEJuHAKkIAgZ2c0Lt/duKeivpR/eNMhUQgUbfJvIFivgGM18Hbw.u	STUDENT	2025-12-26 09:54:45.698	2025-12-26 09:54:45.698
cmjmp3nqr001uuw68weh9sbcg	Shweta Dey	shwetadey@gauhati.ac.in	$2b$10$3uAkYMVND1WAquVz2z9Q3eUx6a1a4fsgkIwQMuu/sTFmimDzNYACC	STUDENT	2025-12-26 09:54:51.508	2025-12-26 09:54:51.508
cmjmp3o98001xuw68eba1iw8f	Purab Jyoti Kashyap	purabjyotikashyap@gauhati.ac.in	$2b$10$v01.oQsS9cdCcPdRc7k3Ee6/eNt6PJZuM8qhqrNwtsU0sS3KtZgFW	STUDENT	2025-12-26 09:54:52.173	2025-12-26 09:54:52.173
cmjolbldy0000uww4t2nbrkwr	Arijit Banik	arijitb000017@gmail.com	$2b$10$JzkZkJI036fDFlrBa50jZ.W4HEUqNp8wDVKgrGQVGNzBdsK2dSKy2	STUDENT	2025-12-27 17:44:35.588	2025-12-27 17:44:35.588
\.


--
-- Data for Name: _CourseStudents; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."_CourseStudents" ("A", "B") FROM stdin;
cmjhffwhw000xuwp4a9wetdiq	cmjmoth65000huw68ccd5lcum
cmjhffwhw000xuwp4a9wetdiq	cmjmoti6n000kuw6833e9g8fr
cmjhffwhw000xuwp4a9wetdiq	cmjmotirp000nuw68id39qyhh
cmjhffwhw000xuwp4a9wetdiq	cmjmotjb8000quw68xhfdwm78
cmjhffwhw000xuwp4a9wetdiq	cmjmotjvx000tuw68op9coyz1
cmjhffwhw000xuwp4a9wetdiq	cmjmotkfp000wuw68qz9bsq2s
cmjhffwhw000xuwp4a9wetdiq	cmjmotkz8000zuw68ill1bls5
cmjhffwhw000xuwp4a9wetdiq	cmjmotlii0012uw6852e1cgvs
cmjhffwhw000xuwp4a9wetdiq	cmjmotm1v0015uw68sq6vm3kl
cmjhffwhw000xuwp4a9wetdiq	cmjmotmli0018uw6849d5t2tg
cmjhfjbal0017uwp4f068vsfb	cmjmotirp000nuw68id39qyhh
cmjhfjbal0017uwp4f068vsfb	cmjmotkfp000wuw68qz9bsq2s
cmjhfjbal0017uwp4f068vsfb	cmjmozqoi001buw68v2kq5vkq
cmjhfjbal0017uwp4f068vsfb	cmjmoti6n000kuw6833e9g8fr
cmjhfjbal0017uwp4f068vsfb	cmjmozs79001euw68l7msny2x
cmjhfjbal0017uwp4f068vsfb	cmjmozspz001huw6865e7z8ja
cmjhfjbal0017uwp4f068vsfb	cmjmozt8s001kuw682c5ohejr
cmjhfjbal0017uwp4f068vsfb	cmjmoth65000huw68ccd5lcum
cmjhfjbal0017uwp4f068vsfb	cmjmozuc3001nuw68t3gikoeq
cmjhfjbal0017uwp4f068vsfb	cmjmozuy3001quw681bktrj6n
cmjhfc2bv000ruwp46tw5y3q6	cmjmotirp000nuw68id39qyhh
cmjhfc2bv000ruwp46tw5y3q6	cmjmp3j9e001tuw68p5vrat7j
cmjhfc2bv000ruwp46tw5y3q6	cmjmozuc3001nuw68t3gikoeq
cmjhfc2bv000ruwp46tw5y3q6	cmjmozuy3001quw681bktrj6n
cmjhfc2bv000ruwp46tw5y3q6	cmjmoth65000huw68ccd5lcum
cmjhfc2bv000ruwp46tw5y3q6	cmjmozqoi001buw68v2kq5vkq
cmjhfc2bv000ruwp46tw5y3q6	cmjmoti6n000kuw6833e9g8fr
cmjhfc2bv000ruwp46tw5y3q6	cmjmp3nqr001wuw68rhiuoz5l
cmjhfc2bv000ruwp46tw5y3q6	cmjmp3o98001zuw686r7i6uqi
cmjhfc2bv000ruwp46tw5y3q6	cmjmotm1v0015uw68sq6vm3kl
cmjhfi59p0013uwp4phh6bazf	cmjmozuc3001nuw68t3gikoeq
cmjhfi59p0013uwp4phh6bazf	cmjmotmli0018uw6849d5t2tg
cmjhfi59p0013uwp4phh6bazf	cmjmotkfp000wuw68qz9bsq2s
cmjhfi59p0013uwp4phh6bazf	cmjmozqoi001buw68v2kq5vkq
cmjhfi59p0013uwp4phh6bazf	cmjmozt8s001kuw682c5ohejr
cmjhfi59p0013uwp4phh6bazf	cmjmoti6n000kuw6833e9g8fr
cmjhfi59p0013uwp4phh6bazf	cmjmozs79001euw68l7msny2x
cmjhfi59p0013uwp4phh6bazf	cmjmp3o98001zuw686r7i6uqi
cmjhfi59p0013uwp4phh6bazf	cmjmotirp000nuw68id39qyhh
cmjhfi59p0013uwp4phh6bazf	cmjmotkz8000zuw68ill1bls5
cmjhffwhw000xuwp4a9wetdiq	cmjolble20002uww4eeqi9nej
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
\.


--
-- Name: AcademicYear AcademicYear_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."AcademicYear"
    ADD CONSTRAINT "AcademicYear_pkey" PRIMARY KEY (id);


--
-- Name: Attendance Attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_pkey" PRIMARY KEY (id);


--
-- Name: Course Course_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_pkey" PRIMARY KEY (id);


--
-- Name: Department Department_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Department"
    ADD CONSTRAINT "Department_pkey" PRIMARY KEY (id);


--
-- Name: Program Program_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Program"
    ADD CONSTRAINT "Program_pkey" PRIMARY KEY (id);


--
-- Name: Semester Semester_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Semester"
    ADD CONSTRAINT "Semester_pkey" PRIMARY KEY (id);


--
-- Name: Student Student_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_pkey" PRIMARY KEY (id);


--
-- Name: Teacher Teacher_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Teacher"
    ADD CONSTRAINT "Teacher_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _CourseStudents _CourseStudents_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."_CourseStudents"
    ADD CONSTRAINT "_CourseStudents_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Course_code_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Course_code_key" ON public."Course" USING btree (code);


--
-- Name: Course_entryCode_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Course_entryCode_key" ON public."Course" USING btree ("entryCode");


--
-- Name: Student_userId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Student_userId_key" ON public."Student" USING btree ("userId");


--
-- Name: Teacher_userId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Teacher_userId_key" ON public."Teacher" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: _CourseStudents_B_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "_CourseStudents_B_index" ON public."_CourseStudents" USING btree ("B");


--
-- Name: AcademicYear AcademicYear_programId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."AcademicYear"
    ADD CONSTRAINT "AcademicYear_programId_fkey" FOREIGN KEY ("programId") REFERENCES public."Program"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Attendance Attendance_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Attendance Attendance_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Course Course_semesterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES public."Semester"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Course Course_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."Teacher"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Program Program_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Program"
    ADD CONSTRAINT "Program_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public."Department"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Semester Semester_academicYearId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Semester"
    ADD CONSTRAINT "Semester_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES public."AcademicYear"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Student Student_programId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_programId_fkey" FOREIGN KEY ("programId") REFERENCES public."Program"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Student Student_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Teacher Teacher_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Teacher"
    ADD CONSTRAINT "Teacher_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public."Department"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Teacher Teacher_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Teacher"
    ADD CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: _CourseStudents _CourseStudents_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."_CourseStudents"
    ADD CONSTRAINT "_CourseStudents_A_fkey" FOREIGN KEY ("A") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _CourseStudents _CourseStudents_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."_CourseStudents"
    ADD CONSTRAINT "_CourseStudents_B_fkey" FOREIGN KEY ("B") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: neondb_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict apX2gaj2f3ZWdE0ZlJKbWgSLRj0hkI8HnD8gb4OX5Sf5Wpf3KAsphIU1gEwcHNd

