INSERT INTO public.professeurs (prenom, nom, email, bio, diplome, specialites, localisation, experience_years, rate_per_session)
VALUES
  ('Alain', 'Cornet', 'alain.cornet@example.com', 'Professeur expérimenté en navigation côtière avec plus de 30 ans d''expérience.', 'Moniteur Fédéral de Voile', ARRAY['Voile', 'Navigation côtière', 'Technique de manœuvre'], 'Bretagne', 30, 50),
  ('Sophie', 'Bestel', 'sophie.bestel@example.com', 'Experte en sécurité maritime et gestion de crise en mer.', 'Maître en Gestion Maritime', ARRAY['Sécurité maritime', 'Premiers secours', 'Gestion de crise'], 'Normandie', 25, 48),
  ('Michel', 'Busnel', 'michel.busnel@example.com', 'Spécialiste de la météorologie maritime et de la stratégie de route.', 'Ingénieur Météorologique', ARRAY['Météorologie maritime', 'Stratégie de route', 'Navigation océanique'], 'Côte d''Azur', 20, 52),
  ('Catherine', 'Chaland', 'catherine.chaland@example.com', 'Pédagogue passionnée par l''enseignement de la navigation.', 'Diplôme d''Etat de Voile', ARRAY['Pédagogie', 'Initiation', 'Navigation'], 'Provence', 18, 45),
  ('Jean', 'Lelong', 'jean.lelong@example.com', 'Navigateur de compétition avec plusieurs prix en régate.', 'Champion Fédéral', ARRAY['Régate', 'Compétition', 'Technique avancée'], 'Méditerranée', 22, 55),
  ('Martine', 'Ungier', 'martine.ungier@example.com', 'Experte en navigation au moteur et en gestion de yacht.', 'Monitrice Navigation Moteur', ARRAY['Navigation moteur', 'Gestion de yacht', 'Sécurité à bord'], 'Atlantique', 19, 46)
ON CONFLICT (email) DO NOTHING;
