--
-- PostgreSQL database dump
--

\restrict n14WWvfjpq5P44jJOq6ytCwiOHHKtRYys7hYWeYPGbkUCPfT5VXS0LBLhIhkk0f

-- Dumped from database version 16.11 (Debian 16.11-1.pgdg13+1)
-- Dumped by pg_dump version 16.11 (Debian 16.11-1.pgdg13+1)

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

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PAID',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'RETURNED'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Address; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Address" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    street text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    "zipCode" text NOT NULL,
    country text NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Address" OWNER TO postgres;

--
-- Name: Cart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Cart" (
    id text NOT NULL,
    "userId" text,
    "sessionToken" text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Cart" OWNER TO postgres;

--
-- Name: CartItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CartItem" (
    id text NOT NULL,
    "cartId" text NOT NULL,
    "variantId" text NOT NULL,
    quantity integer NOT NULL
);


ALTER TABLE public."CartItem" OWNER TO postgres;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    image text,
    "parentId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Category" OWNER TO postgres;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    "userId" text,
    "guestEmail" text,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "totalAmount" numeric(10,2) NOT NULL,
    "shippingCost" numeric(10,2) DEFAULT 0 NOT NULL,
    "shippingAddress" jsonb NOT NULL,
    "billingAddress" jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "variantId" text,
    "productName" text NOT NULL,
    sku text NOT NULL,
    size text,
    color text,
    quantity integer NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    "totalPrice" numeric(10,2) NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO postgres;

--
-- Name: Payment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    provider text NOT NULL,
    "transactionId" text,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Payment" OWNER TO postgres;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    "basePrice" numeric(10,2) NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    material text,
    care text,
    details text[],
    "categoryId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: ProductImage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductImage" (
    id text NOT NULL,
    url text NOT NULL,
    "altText" text,
    "isMain" boolean DEFAULT false NOT NULL,
    color text,
    "productId" text NOT NULL
);


ALTER TABLE public."ProductImage" OWNER TO postgres;

--
-- Name: ProductVariant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductVariant" (
    id text NOT NULL,
    sku text NOT NULL,
    "productId" text NOT NULL,
    size text,
    color text NOT NULL,
    "colorHex" text,
    price numeric(10,2),
    stock integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."ProductVariant" OWNER TO postgres;

--
-- Name: Review; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    rating integer NOT NULL,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Review" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "firstName" text,
    "lastName" text,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    phone text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Data for Name: Address; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Address" (id, "userId", type, street, city, state, "zipCode", country, "isDefault") FROM stdin;
\.


--
-- Data for Name: Cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Cart" (id, "userId", "sessionToken", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CartItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CartItem" (id, "cartId", "variantId", quantity) FROM stdin;
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Category" (id, name, slug, description, image, "parentId", "createdAt", "updatedAt") FROM stdin;
76b7d182-b24a-423b-9b43-424e2dc32616	Women	women	\N	\N	\N	2026-02-07 00:04:20.991	2026-02-07 00:04:20.991
cc4857ff-3cab-47c2-a2fb-366c942f965a	Men	men	\N	\N	\N	2026-02-07 00:04:20.994	2026-02-07 00:04:20.994
80281195-b257-4928-8554-a0be4477cc0f	Shoes	women-shoes	\N	\N	76b7d182-b24a-423b-9b43-424e2dc32616	2026-02-07 00:04:20.995	2026-02-07 00:04:20.995
1dea4783-d9fb-43f4-b656-e6f48715fa2a	Bags	women-bags	\N	\N	76b7d182-b24a-423b-9b43-424e2dc32616	2026-02-07 00:04:20.997	2026-02-07 00:04:20.997
6c8cc96c-931d-4c3d-9957-813eaa400e5a	Accessories	women-accessories	\N	\N	76b7d182-b24a-423b-9b43-424e2dc32616	2026-02-07 00:04:20.999	2026-02-07 00:04:20.999
ed78fe62-4ee2-4807-9a7f-4e82c15d9056	Shoes	men-shoes	\N	\N	cc4857ff-3cab-47c2-a2fb-366c942f965a	2026-02-07 00:04:21	2026-02-07 00:04:21
bee30072-2a61-4a85-9d74-86ae7c85c5ff	Bags	men-bags	\N	\N	cc4857ff-3cab-47c2-a2fb-366c942f965a	2026-02-07 00:04:21.002	2026-02-07 00:04:21.002
8769ee2f-841f-4d92-a5f7-3af85d346144	Accessories	men-accessories	\N	\N	cc4857ff-3cab-47c2-a2fb-366c942f965a	2026-02-07 00:04:21.003	2026-02-07 00:04:21.003
b9d44a1e-e440-4f50-9ee3-1fd5c1cdaf31	Heels	women-heels	\N	\N	80281195-b257-4928-8554-a0be4477cc0f	2026-02-07 00:04:21.005	2026-02-07 00:04:21.005
b6f9869f-f786-4e08-ae82-0dc2bfa10d2c	Boots	women-boots	\N	\N	80281195-b257-4928-8554-a0be4477cc0f	2026-02-07 00:04:21.006	2026-02-07 00:04:21.006
f439dd2e-1fd2-4eeb-a49e-901c96dfff56	Sneakers	women-sneakers	\N	\N	80281195-b257-4928-8554-a0be4477cc0f	2026-02-07 00:04:21.007	2026-02-07 00:04:21.007
08562399-f824-4484-ad58-1eab5330690d	Loafers	women-loafers	\N	\N	80281195-b257-4928-8554-a0be4477cc0f	2026-02-07 00:04:21.009	2026-02-07 00:04:21.009
d25f73d4-aec8-4c44-82ab-9d446222b929	Sandals	women-sandals	\N	\N	80281195-b257-4928-8554-a0be4477cc0f	2026-02-07 00:04:21.01	2026-02-07 00:04:21.01
5b9c4592-a9d2-4924-a8ba-2800b2860f21	Handbags	women-handbags	\N	\N	1dea4783-d9fb-43f4-b656-e6f48715fa2a	2026-02-07 00:04:21.011	2026-02-07 00:04:21.011
a75493a5-f72f-484f-92f2-ca3ada02bbf2	Totes	women-totes	\N	\N	1dea4783-d9fb-43f4-b656-e6f48715fa2a	2026-02-07 00:04:21.013	2026-02-07 00:04:21.013
decebb49-7257-4764-af17-5f19daba084a	Wallets	women-wallets	\N	\N	6c8cc96c-931d-4c3d-9957-813eaa400e5a	2026-02-07 00:04:21.014	2026-02-07 00:04:21.014
5e410384-4764-460c-873a-3ffaf725b91b	Jewelry	women-jewelry	\N	\N	6c8cc96c-931d-4c3d-9957-813eaa400e5a	2026-02-07 00:04:21.015	2026-02-07 00:04:21.015
4a1973d2-33ab-45c0-9866-ee3542c9edfc	Classic	men-classic	\N	\N	ed78fe62-4ee2-4807-9a7f-4e82c15d9056	2026-02-07 00:04:21.017	2026-02-07 00:04:21.017
f01b33c9-c6e1-4ca5-8335-06c2c03f3e71	Boots	men-boots	\N	\N	ed78fe62-4ee2-4807-9a7f-4e82c15d9056	2026-02-07 00:04:21.018	2026-02-07 00:04:21.018
5577d3ab-6661-4b87-a8ee-39ec54ffb087	Sneakers	men-sneakers	\N	\N	ed78fe62-4ee2-4807-9a7f-4e82c15d9056	2026-02-07 00:04:21.019	2026-02-07 00:04:21.019
23ebd7c6-e054-432c-a2c3-a55f9b6f4e18	Loafers	men-loafers	\N	\N	ed78fe62-4ee2-4807-9a7f-4e82c15d9056	2026-02-07 00:04:21.02	2026-02-07 00:04:21.02
f068b57b-1d82-488b-8867-74ff0f266d18	Backpacks	men-backpacks	\N	\N	bee30072-2a61-4a85-9d74-86ae7c85c5ff	2026-02-07 00:04:21.021	2026-02-07 00:04:21.021
37de981a-9c38-43fc-b6fd-903c180487a4	Briefcases	men-briefcases	\N	\N	bee30072-2a61-4a85-9d74-86ae7c85c5ff	2026-02-07 00:04:21.023	2026-02-07 00:04:21.023
64348020-85da-4771-8976-29cef6a648e1	Wallets	men-wallets	\N	\N	8769ee2f-841f-4d92-a5f7-3af85d346144	2026-02-07 00:04:21.024	2026-02-07 00:04:21.024
62100ad7-4a16-44fa-9ac8-db5acdd7a63d	Belts	men-belts	\N	\N	8769ee2f-841f-4d92-a5f7-3af85d346144	2026-02-07 00:04:21.025	2026-02-07 00:04:21.025
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, "orderNumber", "userId", "guestEmail", status, "totalAmount", "shippingCost", "shippingAddress", "billingAddress", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderItem" (id, "orderId", "variantId", "productName", sku, size, color, quantity, "unitPrice", "totalPrice") FROM stdin;
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payment" (id, "orderId", provider, "transactionId", status, amount, currency, "createdAt") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, name, slug, description, "basePrice", "isActive", material, care, details, "categoryId", "createdAt", "updatedAt") FROM stdin;
a4a8f528-edc0-4b3c-bf95-6554d8e4aae4	fasdfasd	fasdfasd	fasdf	3123.00	t	\N	Professional leather clean recommended.	{"Luxury Craftsmanship","Hand-stitched in Italy"}	4a1973d2-33ab-45c0-9866-ee3542c9edfc	2026-02-16 00:42:47.18	2026-02-16 00:42:47.18
60fdc925-a023-442a-8986-2250d29b33df	hasdfgasf	hasdfgasf	fasdfasdf	3123.00	t	\N	Professional leather clean recommended.	{"Luxury Craftsmanship","Hand-stitched in Italy"}	b9d44a1e-e440-4f50-9ee3-1fd5c1cdaf31	2026-02-16 00:12:32.081	2026-02-16 00:21:46.937
b6f21a6c-0315-4742-bf1d-720dff023e37	djfsdghsdh	djfsdghsdh	asdfasdf	3431.00	t	\N	Professional leather clean recommended.	{"Luxury Craftsmanship","Hand-stitched in Italy"}	b9d44a1e-e440-4f50-9ee3-1fd5c1cdaf31	2026-02-16 00:06:35.782	2026-02-16 00:21:51.353
98527a81-da09-47ea-b0af-6a8ca7008e1c	asdfasd	asdfasd	fasfda	3213.00	t	\N	Professional leather clean recommended.	{"Luxury Craftsmanship","Hand-stitched in Italy"}	4a1973d2-33ab-45c0-9866-ee3542c9edfc	2026-02-16 00:46:37.909	2026-02-16 00:46:37.909
48a1cda5-6c8f-4739-9b9d-2d660fca3209	kjhgfd	kjhgfd	fasdf	1233.00	t	\N	Professional leather clean recommended.	{"Luxury Craftsmanship","Hand-stitched in Italy"}	b9d44a1e-e440-4f50-9ee3-1fd5c1cdaf31	2026-02-15 23:05:26.676	2026-02-16 00:22:04.974
b6964ae1-6b63-4168-aa86-824ea47bcb03	fdasfdasfdas	fdasfdasfdas	fdsaadfsafds	333.00	t	\N	Professional leather clean recommended.	{"Luxury Craftsmanship","Hand-stitched in Italy"}	b9d44a1e-e440-4f50-9ee3-1fd5c1cdaf31	2026-02-15 22:34:22.259	2026-02-16 00:22:14.521
94e1e052-c929-478f-9f59-6170fcae529a	hasdf	hasdf	asdfhg	3132.00	t	\N	Professional leather clean recommended.	{"Luxury Craftsmanship","Hand-stitched in Italy"}	b9d44a1e-e440-4f50-9ee3-1fd5c1cdaf31	2026-02-16 00:28:16.425	2026-02-16 00:28:16.425
88af77cd-2628-44aa-8233-654888131523	afdsasdf	afdsasdf	fdsafads	3132.00	t	\N	Professional leather clean recommended.	{"Luxury Craftsmanship","Hand-stitched in Italy"}	4a1973d2-33ab-45c0-9866-ee3542c9edfc	2026-02-16 00:39:05.842	2026-02-16 00:39:05.842
b1c523aa-28c0-486c-abb2-37c825d0a48d	fasfsad	fasfsad	asfdasdf	2312.00	t	\N	Professional leather clean recommended.	{"Luxury Craftsmanship","Hand-stitched in Italy"}	5577d3ab-6661-4b87-a8ee-39ec54ffb087	2026-02-16 00:53:38.554	2026-02-16 00:53:38.554
91e70ec3-644d-4022-98d7-e95ba0583a73	afdsasdfh	afdsasdfh	fdasdsf	3412.00	t	\N	Professional leather clean recommended.	{"Luxury Craftsmanship","Hand-stitched in Italy"}	5577d3ab-6661-4b87-a8ee-39ec54ffb087	2026-02-16 00:59:52.97	2026-02-16 00:59:52.97
e76c4819-502f-4c60-8626-d0fc245b320d	gasdf	gasdf	asdfasdf	3123.00	t	\N	Professional leather clean recommended.	{"Luxury Craftsmanship","Hand-stitched in Italy"}	b9d44a1e-e440-4f50-9ee3-1fd5c1cdaf31	2026-02-16 00:21:12.12	2026-02-16 00:21:12.12
6c74efac-c27d-4d01-873d-df00478c8b6f	akakakakak	akakakakak	sadfasdfasdf	333.00	t	\N	Professional leather clean recommended.	{"Luxury Craftsmanship","Hand-stitched in Italy"}	b9d44a1e-e440-4f50-9ee3-1fd5c1cdaf31	2026-02-15 23:16:18.009	2026-02-16 00:21:55.496
be540992-5c46-41f2-804e-bbeafc611bdd	kfffhj	kfffhj		333.00	t	\N	Professional leather clean recommended.	{"Luxury Craftsmanship","Hand-stitched in Italy"}	b9d44a1e-e440-4f50-9ee3-1fd5c1cdaf31	2026-02-15 22:55:55.349	2026-02-16 00:22:09.945
e1a661cd-18d9-44c8-a575-5699e4f3be98	asdfasdf	asdfasdf	fadsasdf	1512.00	t	\N	Professional leather clean recommended.	{"Luxury Craftsmanship","Hand-stitched in Italy"}	08562399-f824-4484-ad58-1eab5330690d	2026-02-16 00:34:00.446	2026-02-16 00:34:00.446
0be16468-539e-4d19-af14-0c08341b3240	adsff	adsff	fasdsadf	3132.00	t	\N	Professional leather clean recommended.	{"Luxury Craftsmanship","Hand-stitched in Italy"}	5577d3ab-6661-4b87-a8ee-39ec54ffb087	2026-02-16 00:49:27.024	2026-02-16 00:49:27.024
\.


--
-- Data for Name: ProductImage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductImage" (id, url, "altText", "isMain", color, "productId") FROM stdin;
0604dec0-d41f-4f5a-9ba8-724aef6d88f0	/uploads/1771201509570-8.1.png	\N	t	\N	94e1e052-c929-478f-9f59-6170fcae529a
dc65d407-2277-4cdb-9d03-60c1ab7b00f6	/uploads/1771201564036-8.2.png	\N	f	\N	94e1e052-c929-478f-9f59-6170fcae529a
444fdf14-f268-4a02-9c79-5057b85b4d44	/uploads/1771201567020-8.3.png	\N	f	\N	94e1e052-c929-478f-9f59-6170fcae529a
9c7faa7e-6a11-4347-909d-87a4dcbe5b29	/uploads/1771201686404-8.4.png	\N	f	\N	94e1e052-c929-478f-9f59-6170fcae529a
aa98ce2d-edbd-449d-be8a-970ef47a6f54	/uploads/1771202866654-gemini_generated_image_jduw5qjduw5qjduw.png	\N	t	\N	0be16468-539e-4d19-af14-0c08341b3240
c1e7c4df-3968-4eca-9f6b-d8685ebc5dbb	/uploads/1771202894399-4.2.png	\N	f	\N	0be16468-539e-4d19-af14-0c08341b3240
df8f5081-4fdb-48bb-b9cd-b1a29aee358c	/uploads/1771202961916-4.3.png	\N	f	\N	0be16468-539e-4d19-af14-0c08341b3240
3992c765-b04f-4e7b-9a29-718878fc7636	/uploads/1771202963578-gemini_generated_image_3k1kli3k1kli3k1k.png	\N	f	\N	0be16468-539e-4d19-af14-0c08341b3240
859ba950-a40c-4fba-ac86-dad2da9a535d	/uploads/1771203140812-5.1.png	\N	t	\N	b1c523aa-28c0-486c-abb2-37c825d0a48d
17cc748e-55ad-45aa-8b45-06ce466db58d	/uploads/1771203142515-5.2.png	\N	f	\N	b1c523aa-28c0-486c-abb2-37c825d0a48d
ef274cc4-f0b6-4a79-aa61-0971a1600579	/uploads/1771203185557-5.3.png	\N	f	\N	b1c523aa-28c0-486c-abb2-37c825d0a48d
229fd30c-c94a-4a0b-b988-cb4ab9cdf966	/uploads/1771203203871-gemini_generated_image_kyyqsckyyqsckyyq.png	\N	f	\N	b1c523aa-28c0-486c-abb2-37c825d0a48d
519da9e8-24c4-4a3d-adbb-9433614543a3	/uploads/1771203454560-6.1.png	\N	t	\N	91e70ec3-644d-4022-98d7-e95ba0583a73
90009e55-72ee-45d9-951e-b5a95389c70e	/uploads/1771203456019-6.2.png	\N	f	\N	91e70ec3-644d-4022-98d7-e95ba0583a73
e9fe1119-5d6b-40be-8264-52002b4c8aff	/uploads/1771203457438-6.3.png	\N	f	\N	91e70ec3-644d-4022-98d7-e95ba0583a73
2f83402e-0061-47c5-998b-282a350c6141	/uploads/1771203572302-6.4.png	\N	f	\N	91e70ec3-644d-4022-98d7-e95ba0583a73
1ba2385e-6e01-4c2d-b363-9e27a29dfc65	/uploads/1771201185923-7.1.png	\N	t	\N	e76c4819-502f-4c60-8626-d0fc245b320d
5fc5cc15-f677-417f-96d5-00948a8e5bf0	/uploads/1771201188056-7.2.png	\N	f	\N	e76c4819-502f-4c60-8626-d0fc245b320d
70b03c5b-3e1e-4339-b262-c35be701d383	/uploads/1771201191256-7.3.png	\N	f	\N	e76c4819-502f-4c60-8626-d0fc245b320d
d968d2c8-0a2b-4563-98b9-f56bd0d84f64	/uploads/1771201265525-7.4.png	\N	f	\N	e76c4819-502f-4c60-8626-d0fc245b320d
9b939ee8-ccea-40b0-aa9c-c1f4b4753918		\N	f	\N	e76c4819-502f-4c60-8626-d0fc245b320d
7364af60-ce00-4026-84bc-b5a4e261ba7a	/uploads/1771200383252-5.1.png	\N	t	\N	b6f21a6c-0315-4742-bf1d-720dff023e37
d5358f96-fd0d-43e1-9558-c220dce446c2	/uploads/1771200385533-5.2.png	\N	f	\N	b6f21a6c-0315-4742-bf1d-720dff023e37
92830728-e089-459c-bb7a-19fb5628a98b	/uploads/1771200387565-5.3.png	\N	f	\N	b6f21a6c-0315-4742-bf1d-720dff023e37
984a9d67-1021-4434-a079-e444a78698a9	/uploads/1771200389484-gemini_generated_image_7pozj67pozj67poz.png	\N	f	\N	b6f21a6c-0315-4742-bf1d-720dff023e37
18152a0e-8773-4d36-a6ac-8ff39fe59611	/uploads/1771197303247-gemini_generated_image_k58cw1k58cw1k58c.png	\N	t	\N	6c74efac-c27d-4d01-873d-df00478c8b6f
417b0040-62a3-4cca-8089-1563ad0959e3	/uploads/1771197305954-gemini_generated_image_vshwukvshwukvshw.png	\N	f	\N	6c74efac-c27d-4d01-873d-df00478c8b6f
4a4dda5e-0724-4632-a17a-1f47488368c1	/uploads/1771197307832-gemini_generated_image_6m4gbh6m4gbh6m4g.png	\N	f	\N	6c74efac-c27d-4d01-873d-df00478c8b6f
85beba04-3892-4093-a072-26153fc0a086	/uploads/1771197375736-gemini_generated_image_yene8eyene8eyene.png	\N	f	\N	6c74efac-c27d-4d01-873d-df00478c8b6f
4d87eb2a-53b0-470a-849f-5254ba878633	/uploads/1771196714523-gemini_generated_image_bs4iiabs4iiabs4i.png	\N	t	\N	48a1cda5-6c8f-4739-9b9d-2d660fca3209
cbc98e5d-5628-4fe8-9e3a-8203c9050dab	/uploads/1771196717759-gemini_generated_image_pqifxpqifxpqifxp.png	\N	f	\N	48a1cda5-6c8f-4739-9b9d-2d660fca3209
0eea4808-ddd2-4d25-9c2e-10998651b3b1	/uploads/1771196719299-gemini_generated_image_3pw1n53pw1n53pw1.png	\N	f	\N	48a1cda5-6c8f-4739-9b9d-2d660fca3209
f3bcb9ef-3f80-4399-81a1-405b491df4ab	/uploads/1771196721343-gemini_generated_image_fipa5gfipa5gfipa.png	\N	f	\N	48a1cda5-6c8f-4739-9b9d-2d660fca3209
9d9d1694-b415-4cdb-b7e6-03bd4f9605de	/uploads/1771194834075-gemini_generated_image_c8khgc8khgc8khgc.png	\N	t	\N	b6964ae1-6b63-4168-aa86-824ea47bcb03
fb51c516-d3bd-4d56-b421-e2bbe9ce4d09	/uploads/1771194842535-gemini_generated_image_bwvcsebwvcsebwvc.png	\N	f	\N	b6964ae1-6b63-4168-aa86-824ea47bcb03
c4c9d446-0fe7-43fd-8d7e-80227f42c827	/uploads/1771194845545-gemini_generated_image_2xxyis2xxyis2xxy.png	\N	f	\N	b6964ae1-6b63-4168-aa86-824ea47bcb03
4a5e64d7-55dd-4934-a423-8dabfb20c5c2	/uploads/1771194848636-gemini_generated_image_73nu0i73nu0i73nu.png	\N	f	\N	b6964ae1-6b63-4168-aa86-824ea47bcb03
33fcf67c-ff76-46e7-b72e-7cccb7500c96	/uploads/1771201888286-9.1.png	\N	t	\N	e1a661cd-18d9-44c8-a575-5699e4f3be98
4e9f2d8d-b2e6-41d1-8eb5-d53a0c0d068d	/uploads/1771201890502-9.2.png	\N	f	\N	e1a661cd-18d9-44c8-a575-5699e4f3be98
1bb30326-aabc-4eb4-aae8-7d3e912d31ae	/uploads/1771201892269-9.3.png	\N	f	\N	e1a661cd-18d9-44c8-a575-5699e4f3be98
9db4ceef-60b6-484f-ac3f-752e4fb672cf	/uploads/1771202014512-9.4.png	\N	f	\N	e1a661cd-18d9-44c8-a575-5699e4f3be98
8ebd6e32-9c7b-4fb1-85ec-46fb4f82e905	/uploads/1771200730812-6.1.png	\N	t	\N	60fdc925-a023-442a-8986-2250d29b33df
37486e76-17e1-47c1-8b2e-d104476e20c0	/uploads/1771200733096-6.2.png	\N	f	\N	60fdc925-a023-442a-8986-2250d29b33df
c4d08894-9186-4053-8b6f-3426586fea04	/uploads/1771200735070-6.3.png	\N	f	\N	60fdc925-a023-442a-8986-2250d29b33df
2a00871d-62d3-437c-b312-71240db59917	/uploads/1771200746550-gemini_generated_image_9z8fnu9z8fnu9z8f.png	\N	f	\N	60fdc925-a023-442a-8986-2250d29b33df
6bf4d297-f990-4b9c-bec2-cc83174116e1	/uploads/1771196130590-gemini_generated_image_9n9ehk9n9ehk9n9e.png	\N	t	\N	be540992-5c46-41f2-804e-bbeafc611bdd
50d4ecf7-5e6f-46f9-9c07-2ae16fe0d965	/uploads/1771196137429-gemini_generated_image_9xi8ms9xi8ms9xi8.png	\N	f	\N	be540992-5c46-41f2-804e-bbeafc611bdd
a86f8e1e-64c8-428e-9c43-f7dafe314c7e	/uploads/1771196140406-gemini_generated_image_3gqbtw3gqbtw3gqb.png	\N	f	\N	be540992-5c46-41f2-804e-bbeafc611bdd
de6d74e5-976f-491c-a3ab-c308a201afab	/uploads/1771196144755-gemini_generated_image_5al0jy5al0jy5al0.png	\N	f	\N	be540992-5c46-41f2-804e-bbeafc611bdd
024b551b-410a-4b8f-8f57-51a6441a0995	/uploads/1771202333956-1.1.png	\N	t	\N	88af77cd-2628-44aa-8233-654888131523
be8f3d81-acc9-40fc-8078-da0d7b8e9819	/uploads/1771202335691-1.2.png	\N	f	\N	88af77cd-2628-44aa-8233-654888131523
9c23c59e-0d61-48f8-94f1-73341b9e6158	/uploads/1771202337298-1.3.png	\N	f	\N	88af77cd-2628-44aa-8233-654888131523
18125914-cf26-4dc1-9d67-966bb1b995d7	/uploads/1771202339181-1.4.png	\N	f	\N	88af77cd-2628-44aa-8233-654888131523
4f6df516-9239-4d91-bcc4-eeb5d04a166c	/uploads/1771202489546-gemini_generated_image_nsqy54nsqy54nsqy.png	\N	t	\N	a4a8f528-edc0-4b3c-bf95-6554d8e4aae4
3f64a635-47e5-43c3-92d9-9448fe026eb9	/uploads/1771202509268-2.2.png	\N	f	\N	a4a8f528-edc0-4b3c-bf95-6554d8e4aae4
4438fe74-45a4-426a-9d5f-e8c4d44af6e9	/uploads/1771202529923-2.3.png	\N	f	\N	a4a8f528-edc0-4b3c-bf95-6554d8e4aae4
786bae78-bcc4-4bf9-ab9f-723711719585	/uploads/1771202564637-gemini_generated_image_xw8rhtxw8rhtxw8r.png	\N	f	\N	a4a8f528-edc0-4b3c-bf95-6554d8e4aae4
c0b25c10-84db-4a28-872d-b5e314fba198	/uploads/1771202754044-3.1.png	\N	t	\N	98527a81-da09-47ea-b0af-6a8ca7008e1c
71f8a936-3fc4-4fe1-be00-f983c886824c	/uploads/1771202756145-3.2.png	\N	f	\N	98527a81-da09-47ea-b0af-6a8ca7008e1c
8f251b2c-cc46-47da-8f97-9827dfb1c859	/uploads/1771202773742-3.3.png	\N	f	\N	98527a81-da09-47ea-b0af-6a8ca7008e1c
c4f3fb66-adfd-4677-ab80-ce8223702d96	/uploads/1771202795627-gemini_generated_image_k10rkck10rkck10r.png	\N	f	\N	98527a81-da09-47ea-b0af-6a8ca7008e1c
\.


--
-- Data for Name: ProductVariant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductVariant" (id, sku, "productId", size, color, "colorHex", price, stock) FROM stdin;
fb358ebb-d371-4ee6-937d-6fa580dcd8f0	asdfasdf	e76c4819-502f-4c60-8626-d0fc245b320d	38	asdasd	#000000	3123.00	10
32ee269c-3fc7-483f-8b1e-f1784df8a6af	adfsadsf	60fdc925-a023-442a-8986-2250d29b33df	41	asdasd	#000000	3123.00	10
a7edcf2d-fc1d-436e-8290-fdf21dc987e2	asdfdas	b6f21a6c-0315-4742-bf1d-720dff023e37	37	asdasd	#000000	3431.00	10
78fda3cc-33ae-4c05-8093-b591f94101d0	fadasdf	6c74efac-c27d-4d01-873d-df00478c8b6f	37	fadsaf	#000000	333.00	10
e20e7ade-fe5f-443b-b4ee-5a5e9f7ecd6a	fasdfasdf	48a1cda5-6c8f-4739-9b9d-2d660fca3209	44	asdfasdf	#000000	1233.00	10
2ddb38fa-269a-487d-b19f-1af7365702d3	afasfd	be540992-5c46-41f2-804e-bbeafc611bdd	37	fasdf	#000000	333.00	10
fb076a25-37dc-474f-ac03-6164a50dafde	adssaddsa	b6964ae1-6b63-4168-aa86-824ea47bcb03	33	asdasd	#000000	333.00	10
e19182af-8b55-4974-bbc0-59696579cab9	adsff	94e1e052-c929-478f-9f59-6170fcae529a	39	asdasd	#000000	3132.00	10
9f46afba-8fbe-4001-8962-51a5f9c4c55d	asddas	e1a661cd-18d9-44c8-a575-5699e4f3be98	37	asdf	#000000	1512.00	10
7c87d53c-6374-4644-8b71-7c89f037a84e	afddfs	88af77cd-2628-44aa-8233-654888131523	43	asdasd	#000000	3132.00	10
cfa2c4c4-a9ff-470b-832e-6ba7451aaa43	adsfs	a4a8f528-edc0-4b3c-bf95-6554d8e4aae4	44	asd	#000000	3123.00	10
e3532960-958e-4a5f-a059-0304e371eab6	asfd	98527a81-da09-47ea-b0af-6a8ca7008e1c	44	asd	#000000	3213.00	10
0903027b-4a22-4de9-9b84-cf52cbe2502d	asdf	0be16468-539e-4d19-af14-0c08341b3240	44	asd	#000000	3132.00	10
d22098d1-f6e5-472f-9886-6734e1b1c786	asdf2	b1c523aa-28c0-486c-abb2-37c825d0a48d	44	asdd	#000000	2312.00	10
85024649-6535-40d1-af47-ae74f8e1ea24	123a6sd	91e70ec3-644d-4022-98d7-e95ba0583a73	44	faas	#000000	3412.00	10
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Review" (id, "userId", "productId", rating, comment, "createdAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, password, "firstName", "lastName", role, phone, "createdAt", "updatedAt") FROM stdin;
ec4a4cb5-cfe5-4c89-b807-90ef5d72c09e	mhmtonr01@gmail.com	$2b$12$c8QcPAbVy66KSMzxjmWdMO7ZesoSFGU7.Ps6O8t04YhC5MfU0USpi	Mehmet	Duman	USER	\N	2026-02-06 01:27:51.873	2026-02-06 01:27:51.873
06674521-b953-49ed-b9cc-da03de7c9ccc	admin@socrati.com	$2b$12$.kKpA7QCMfUYB9tOAwpVwe2Acbfmg3c7UvAMjEfJntZ82aeD7Ndz6	Admin	User	ADMIN	\N	2026-02-06 01:35:39.567	2026-02-06 01:35:39.567
b86d81a8-8c8d-4f3b-b206-b589b5727038	dodododo@hotmail.com	$2b$12$HHxwOH9uQrJmWegdq.TeUe06spqK9yunl7QKRnUcoUOEPz64TlhzW	doğancan	düşkün	USER	\N	2026-02-07 01:48:13.299	2026-02-07 01:48:13.299
8e1e1388-ce67-4b4d-893b-5b4e1daf611b	asdasdasd@hotmail.com	$2b$12$TlUIGQebWyENOZ7pw19L6ezBXV37Bg8.e3vpp.Q9loI4jv8ZbeaBy	asdfasdf	asdfasdf	USER	\N	2026-02-11 20:29:19.79	2026-02-11 20:29:19.79
\.


--
-- Name: Address Address_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_pkey" PRIMARY KEY (id);


--
-- Name: CartItem CartItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_pkey" PRIMARY KEY (id);


--
-- Name: Cart Cart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: ProductImage ProductImage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_pkey" PRIMARY KEY (id);


--
-- Name: ProductVariant ProductVariant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Cart_sessionToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Cart_sessionToken_key" ON public."Cart" USING btree ("sessionToken");


--
-- Name: Cart_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Cart_userId_key" ON public."Cart" USING btree ("userId");


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: Order_orderNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Order_orderNumber_key" ON public."Order" USING btree ("orderNumber");


--
-- Name: Payment_orderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Payment_orderId_key" ON public."Payment" USING btree ("orderId");


--
-- Name: ProductVariant_productId_size_color_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProductVariant_productId_size_color_key" ON public."ProductVariant" USING btree ("productId", size, color);


--
-- Name: ProductVariant_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProductVariant_sku_key" ON public."ProductVariant" USING btree (sku);


--
-- Name: Product_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Product_slug_key" ON public."Product" USING btree (slug);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Address Address_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CartItem CartItem_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public."Cart"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CartItem CartItem_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Cart Cart_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Category Category_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Payment Payment_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProductImage ProductImage_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductVariant ProductVariant_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict n14WWvfjpq5P44jJOq6ytCwiOHHKtRYys7hYWeYPGbkUCPfT5VXS0LBLhIhkk0f

