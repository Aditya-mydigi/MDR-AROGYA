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
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || '5432';
  const dbNameIndia = process.env.DB_NAME_IN;
  const dbNameUSA = process.env.DB_NAME!;

  // Validate required parameters
  if (!user || !password || !host || !dbNameIndia) {
    const missing = [];
    if (!user) missing.push('DB_USER');
    if (!password) missing.push('DB_PASSWORD');
    if (!host) missing.push('DB_HOST');
    if (!dbNameIndia) missing.push('DB_NAME_IN');
    
    console.error('❌ Missing required database configuration:', missing.join(', '));
    console.error('Please set the following environment variables:');
    console.error('  - DB_USER');
    console.error('  - DB_PASSWORD');
    console.error('  - DB_HOST');
    console.error('  - DB_PORT (optional, defaults to 5432)');
    console.error('  - DB_NAME_IN');
    console.error('  - DB_NAME_USA (optional, defaults to DB_NAME_IN)');
    
    // Set empty strings to prevent Prisma from crashing with undefined
    process.env.DATABASE_URL_INDIA = '';
    process.env.DATABASE_URL_USA = '';
  } else {
    // Construct and set the connection URLs
    try {
      process.env.DATABASE_URL_INDIA = constructDatabaseUrl(user, password, host, port, dbNameIndia);
      process.env.DATABASE_URL_USA = constructDatabaseUrl(user, password, host, port, dbNameUSA);
      console.log('✓ Database connection URLs constructed successfully');
    } catch (error) {
      console.error('❌ Error constructing database URLs:', error);
      process.env.DATABASE_URL_INDIA = '';
      process.env.DATABASE_URL_USA = '';
    }
  }
}

