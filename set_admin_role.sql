-- 1. Update the user's role to 'mentor' in the profiles table
UPDATE profiles 
SET role = 'mentor' 
WHERE email = 'gloriakerubo@gmail.com';

-- 2. Verify the update
SELECT * FROM profiles WHERE email = 'gloriakerubo@gmail.com';

-- 3. (Optional) Check if there are any sessions in the database
SELECT * FROM sessions;
