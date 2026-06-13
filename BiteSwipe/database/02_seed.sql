-- ============================================================
-- BiteSwipe - Date de test pentru demo
-- Ruleaza DUPA 01_schema.sql
-- ============================================================

insert into companies (id, name) values
  ('11111111-1111-1111-1111-111111111111', 'Crama Veche Group'),
  ('22222222-2222-2222-2222-222222222222', 'Urban Eats SRL');

insert into restaurants (company_id, name, description, address, city, cuisine_type, price_range, capacity, image_url) values
  (
    '11111111-1111-1111-1111-111111111111',
    'Crama Veche - Centru',
    'Bucatarie romaneasca traditionala intr-un cadru rustic autentic.',
    'Str. Lipscani 42', 'București', 'romaneasca', 2, 60,
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Crama Veche - Floreasca',
    'Aceeasi reteta, alta locatie. Terasa de vara cu 40 de locuri.',
    'Str. Floreasca 12', 'București', 'romaneasca', 2, 80,
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Urban Pizza',
    'Pizza napoletana autentica, cuptor cu lemne, ingrediente importate din Italia.',
    'Calea Victoriei 88', 'București', 'italiana', 1, 40,
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Sushi Garden',
    'Japoneza moderna cu ingrediente proaspete aduse zilnic.',
    'Str. Dorobanti 55', 'București', 'japoneza', 3, 35,
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'The Burger Lab',
    'Burgeri artizanali, carne de vita maturata 30 de zile, sosuri secrete.',
    'Str. Academiei 7', 'București', 'americana', 1, 50,
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800'
  );
