update certificate.certificates
set meta = jsonb_set(meta #-'{driver,total,km}', '{driver,total,distance}', meta#>'{driver,total,km}')
WHERE meta#>'{driver,total}' ? 'km';

update certificate.certificates
set meta = jsonb_set(meta #-'{passenger,total,km}', '{passenger,total,distance}', meta#>'{passenger,total,km}')
WHERE meta#>'{passenger,total}' ? 'km';

update certificate.certificates
set meta = jsonb_set(meta #-'{passenger,total,euros}', '{passenger,total,amount}', meta#>'{passenger,total,euros}')
WHERE meta#>'{passenger,total}' ? 'euros';

update certificate.certificates
set meta = jsonb_set(meta #-'{driver,total,euros}', '{driver,total,amount}', meta#>'{driver,total,euros}')
WHERE meta#>'{driver,total}' ? 'euros';
