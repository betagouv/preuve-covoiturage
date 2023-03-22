update certificate.certificates
set meta = jsonb_set(meta #-'{driver,total,distance}', '{driver,total,km}', meta#>'{driver,total,distance}')
WHERE meta#>'{driver,total}' ? 'distance';

update certificate.certificates
set meta = jsonb_set(meta #-'{passenger,total,distance}', '{passenger,total,km}', meta#>'{passenger,total,distance}')
WHERE meta#>'{passenger,total}' ? 'distance';

update certificate.certificates
set meta = jsonb_set(meta #-'{passenger,total,amount}', '{passenger,total,euros}', meta#>'{passenger,total,amount}')
WHERE meta#>'{passenger,total}' ? 'amount';

update certificate.certificates
set meta = jsonb_set(meta #-'{driver,total,amount}', '{driver,total,euros}', meta#>'{driver,total,amount}')
WHERE meta#>'{driver,total}' ? 'amount';
