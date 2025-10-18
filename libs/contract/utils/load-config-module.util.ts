import { join } from 'path';
import { ConfigModule } from '@nestjs/config';

/**
 * Loads the configuration module with the specified environment file path.
 * @param envPath - The path to the environment file.
 * @param isGlobal - Whether the configuration should be global. Default is true.
 * @param cache - Whether to cache the configuration. Default is true.
 * @returns The configured ConfigModule
 * @throws Will throw an error if envPath is not provided.
 */
export default function loadConfigModule(
  envPath: string,
  isGlobal: boolean = true,
  cache: boolean = true,
) {
  if (!envPath) {
    throw new Error('envPath is required');
  }
  const paths = [join(process.cwd(), envPath), '.env.shared'];

  // The configuration module
  return ConfigModule.forRoot({
    isGlobal: isGlobal,
    envFilePath: paths,
    cache: cache,
  });
}

export { loadConfigModule };
