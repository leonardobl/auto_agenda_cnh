CREATE TABLE IF NOT EXISTS license_category (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

INSERT INTO license_category (id, code, name) VALUES
  ('b97b20ef-e0fb-457d-9ef2-fb4e487ac134', 'A', 'Motocicletas'),
  ('1eee82a4-ebc2-4505-b96d-e55194b116fd', 'B', 'Automóveis'),
  ('c15febae-0268-432c-9b75-758883c4edc4', 'AB', 'Automóveis e motocicletas'),
  ('c1c57459-2a46-4831-820f-9dabaf1c1701', 'C', 'Veículos de carga'),
  ('14d2fbdc-e9f2-4955-b67f-aeece0a00442', 'D', 'Veículos de passageiros'),
  ('d94c6401-f1f7-4656-9f8c-f82f8c9637e0', 'E', 'Combinação de veículos de carga');
