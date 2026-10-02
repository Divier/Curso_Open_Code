CREATE TABLE daycares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE daycares ENABLE ROW LEVEL SECURITY;

-- Política de lectura: cualquiera puede leer
CREATE POLICY "daycares_read" ON daycares
  FOR SELECT
  USING (true);

-- Políticas de escritura: restringidas
CREATE POLICY "daycares_insert" ON daycares
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "daycares_update" ON daycares
  FOR UPDATE
  USING (false);

CREATE POLICY "daycares_delete" ON daycares
  FOR DELETE
  USING (false);

-- Seed data: 4 daycares
INSERT INTO daycares (name, address) VALUES
  ('Guardería Sala Soles', 'Av. Principal 123, Centro'),
  ('Guardería Arcoíris', 'Calle Luna 456, Zona Norte'),
  ('Guardería Semillitas', 'Blvd. del Sol 789, Col. Jardines'),
  ('Guardería Estrellitas', 'Paseo de los Niños 321, Residencial');
