ALTER TABLE cee.cee_applications
  DROP column identity_key,
  ADD column identity_key VARCHAR (128);
