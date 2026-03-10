import type { RuntimeConfig } from '@/contexts/runtime-config-context'

const PUBLIC_CONFIG_KEYS: (keyof RuntimeConfig)[] = [
  'NEXT_PUBLIC_MAP_DEFAULT_LATITUDE',
  'NEXT_PUBLIC_MAP_DEFAULT_LONGITUDE',
  'NEXT_PUBLIC_MAP_DEFAULT_ZOOM',
  'NEXT_PUBLIC_BACKEND_URL',
  'NEXT_PUBLIC_DEFAULT_ZOOM_FOR_COLLECTION_RANGE',
  'NEXT_PUBLIC_DATASET_LIST_BY',
  'NEXT_PUBLIC_MAX_CLUSTER_RADIUS',
]

export function getRuntimeConfig(): RuntimeConfig {
  const config: RuntimeConfig = {}
  for (const key of PUBLIC_CONFIG_KEYS) {
    const value = process.env[key]
    if (value !== undefined) {
      config[key] = value
    }
  }
  return config
}
