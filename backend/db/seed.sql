-- Seed data for Tamil Nadu bus routes

-- Insert stops
INSERT INTO stops (name, lat, lng, district) VALUES
('Tindivanam', 12.2317, 79.6475, 'Villupuram'),
('Chennai', 13.0827, 80.2707, 'Chennai'),
('Puducherry', 11.9416, 79.8083, 'Puducherry'),
('Villupuram', 11.9401, 79.4861, 'Villupuram'),
('Madurai', 9.9252, 78.1198, 'Madurai'),
('Trichy', 10.7905, 78.7047, 'Tiruchirappalli'),
('Coimbatore', 11.0168, 76.9558, 'Coimbatore'),
('Salem', 11.6643, 78.1460, 'Salem');

-- Insert buses
INSERT INTO buses VALUES
('SKV-01', 'SKV Express', 'Tindivanam', 'Chennai', '21:00', '23:30', '2h 30m', 'Express', 'on-time', 'SKV Travels', 
 '["Tindivanam", "Melmaruvathur", "Chengalpattu", "Chennai"]', '["Daily"]', 150),

('SKV-02', 'SKV Deluxe', 'Tindivanam', 'Chennai', '06:30', '09:00', '2h 30m', 'Deluxe', 'on-time', 'SKV Travels',
 '["Tindivanam", "Melmaruvathur", "Chengalpattu", "Chennai"]', '["Daily"]', 200),

('PNR-01', 'Ponnar Travels', 'Tindivanam', 'Chennai', '23:00', '01:30', '2h 30m', 'Sleeper', 'on-time', 'Ponnar',
 '["Tindivanam", "Melmaruvathur", "Chengalpattu", "Chennai"]', '["Daily"]', 250),

('PNY-10', 'Pondy Express', 'Tindivanam', 'Puducherry', '08:00', '09:30', '1h 30m', 'Express', 'on-time', 'PRTC',
 '["Tindivanam", "Gingee", "Puducherry"]', '["Daily"]', 80),

('TNN-21', 'TN State Bus', 'Tindivanam', 'Villupuram', '07:00', '07:45', '45m', 'Ordinary', 'on-time', 'TNSTC',
 '["Tindivanam", "Villupuram"]', '["Daily"]', 30),

('CHN-MDU', 'Madurai King', 'Chennai', 'Madurai', '21:30', '05:30', '8h', 'AC Sleeper', 'on-time', 'KPN Travels',
 '["Chennai", "Chengalpattu", "Villupuram", "Trichy", "Dindigul", "Madurai"]', '["Daily"]', 800),

('CHN-TCY', 'Trichy Rider', 'Chennai', 'Trichy', '20:00', '02:00', '6h', 'Express', 'late', 'SRS Travels',
 '["Chennai", "Chengalpattu", "Villupuram", "Trichy"]', '["Daily"]', 400),

('CBE-CHN', 'Coimbatore Express', 'Coimbatore', 'Chennai', '22:00', '06:00', '8h', 'AC Sleeper', 'on-time', 'KPN Travels',
 '["Coimbatore", "Salem", "Villupuram", "Chennai"]', '["Daily"]', 750),

('SLM-CHN', 'Salem Special', 'Salem', 'Chennai', '19:30', '01:30', '6h', 'Express', 'on-time', 'SRS Travels',
 '["Salem", "Villupuram", "Chennai"]', '["Daily"]', 350);