'use client'

import React, { createContext, useContext, ReactNode } from 'react'

export type RuntimeConfig = {
  NEXT_PUBLIC_MAP_DEFAULT_LATITUDE?: string
  NEXT_PUBLIC_MAP_DEFAULT_LONGITUDE?: string
  NEXT_PUBLIC_MAP_DEFAULT_ZOOM?: string
  NEXT_PUBLIC_BACKEND_URL?: string
  NEXT_PUBLIC_DEFAULT_ZOOM_FOR_COLLECTION_RANGE?: string
  NEXT_PUBLIC_DATASET_LIST_BY?: string
  NEXT_PUBLIC_MAX_CLUSTER_RADIUS?: string
}

const RuntimeConfigContext = createContext<RuntimeConfig | undefined>(undefined)

export const RuntimeConfigProvider: React.FC<{
  children: ReactNode
  initialConfig?: RuntimeConfig
}> = ({ children, initialConfig = {} }) => {
  return (
    <RuntimeConfigContext.Provider value={initialConfig}>
      {children}
    </RuntimeConfigContext.Provider>
  )
}

export const useRuntimeConfig = (): RuntimeConfig => {
  const context = useContext(RuntimeConfigContext)
  return context ?? {}
}
