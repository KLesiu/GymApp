UPDATE "User"
SET
  "passwordHash" = '$argon2id$v=19$m=65536,t=3,p=4$hvtKSWgQ966Br7n1M5ddkQ$jW6eI5at4J8bDExqmKY237d/LSVcUAv/QKGq2k0rKq0',
  "isVisibleInRanking" = false,
  "updatedAt" = NOW()
WHERE "email" = 'admin@liftcontext.local';
