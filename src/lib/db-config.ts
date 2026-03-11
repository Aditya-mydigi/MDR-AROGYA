// Database configuration - constructs connection strings from individual parameters

function constructDatabaseUrl(user: string, password: string, host: string, port: string, dbName: string): string {
  // URL encode password and user to handle special characters
  const encodedUser = encodeURIComponent(user);
  const encodedPassword = encodeURIComponent(password);
  
  return `postgresql://${encodedUser}:${encodedPassword}@${host}:${port}/${dbName}?schema=public`;
}

// Set the environment variables for Prisma to use
// This MUST run at module load time, before Prisma clients are created
if (typeof process !== 'undefined' && process.env) {
  // Get individual database parameters
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  // Prefer region-specific hosts, but fall back to legacy DB_HOST if present
  const hostIndia = process.env.DB_HOST_IN || process.env.DB_HOST;
  const hostUSA = process.env.DB_HOST_US || process.env.DB_HOST;
  const port = process.env.DB_PORT || '5432';
  const dbNameIndia = process.env.DB_NAME_IN;
  const dbNameUSA = process.env.DB_NAME || process.env.DB_NAME_US;

  // Validate required parameters
  if (!user || !password || !hostIndia || !dbNameIndia || !hostUSA || !dbNameUSA) {
    const missing = [];
    if (!user) missing.push('DB_USER');
    if (!password) missing.push('DB_PASSWORD');
    if (!hostIndia) missing.push('DB_HOST_IN');
    if (!hostUSA) missing.push('DB_HOST_US');
    if (!dbNameIndia) missing.push('DB_NAME_IN');
    if (!dbNameUSA) missing.push('DB_NAME/DB_NAME_US');
    
    console.error('❌ Missing required database configuration:', missing.join(', '));
    console.error('Please set the following environment variables:');
    console.error('  - DB_USER');
    console.error('  - DB_PASSWORD');
    console.error('  - DB_HOST_IN');
    console.error('  - DB_HOST_US');
    console.error('  - DB_PORT (optional, defaults to 5432)');
    console.error('  - DB_NAME_IN');
    console.error('  - DB_NAME (USA) or DB_NAME_US');
    
    // Set empty strings to prevent Prisma from crashing with undefined
    process.env.DATABASE_URL_INDIA = '';
    process.env.DATABASE_URL_USA = '';
  } else {
    // Construct and set the connection URLs
    try {
      process.env.DATABASE_URL_INDIA = constructDatabaseUrl(user, password, hostIndia, port, dbNameIndia);
      process.env.DATABASE_URL_USA = constructDatabaseUrl(user, password, hostUSA, port, dbNameUSA);
      // Prisma defaults to env("DATABASE_URL") when not provided a per-datasource override.
      // Set it to India by default so generated clients never see an empty URL.
      process.env.DATABASE_URL = process.env.DATABASE_URL_INDIA;
      console.log('✓ Database connection URLs constructed successfully');
    } catch (error) {
      console.error('❌ Error constructing database URLs:', error);
      process.env.DATABASE_URL_INDIA = '';
      process.env.DATABASE_URL_USA = '';
    }
  }
}

