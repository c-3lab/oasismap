'use client'
import React from 'react'
import { Grid, Typography, Link } from '@mui/material'

type Library = {
  name: string
  copyright: string
  license: string
  licenseUrl?: string
  note?: string
}

const LibraryEntry: React.FC<{ item: Library }> = ({ item }) => {
  return (
    <Grid sx={{ mb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
        {item.name}
      </Typography>
      {item.copyright && (
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 0.5 }}>
          {item.copyright}
        </Typography>
      )}
      <Typography variant="body2" sx={{ mt: 0.5 }}>
        License: {item.license}
      </Typography>
      {item.licenseUrl && (
        <Typography variant="body2" sx={{ mt: 0.5, wordBreak: 'break-all' }}>
          License URL:{' '}
          <Link href={item.licenseUrl} target="_blank" rel="noopener">
            {item.licenseUrl}
          </Link>
        </Typography>
      )}
      {item.note && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 0.5 }}
        >
          {item.note}
        </Typography>
      )}
    </Grid>
  )
}

const fonts: Library[] = [
  {
    name: 'Inter',
    copyright:
      'Copyright (c) 2016 The Inter Project Authors (https://github.com/rsms/inter)',
    license: 'SIL Open Font License 1.1',
    licenseUrl: 'https://github.com/rsms/inter/blob/master/LICENSE.txt',
  },
]

const frontendLibraries: Library[] = [
  {
    name: '@emotion/react',
    copyright: 'Copyright (c) Emotion team and other contributors',
    license: 'MIT',
  },
  {
    name: '@emotion/styled',
    copyright: 'Copyright (c) Emotion team and other contributors',
    license: 'MIT',
  },
  {
    name: '@mui/icons-material',
    copyright: 'Copyright (c) 2014 Call-Em-All',
    license: 'MIT',
  },
  {
    name: '@mui/material',
    copyright: 'Copyright (c) 2014 Call-Em-All',
    license: 'MIT',
  },
  {
    name: '@mui/material-nextjs',
    copyright: 'Copyright (c) 2014 Call-Em-All',
    license: 'MIT',
  },
  {
    name: '@react-leaflet/core',
    copyright:
      '@react-leaflet/core Copyright 2020 Paul Le Cam and contributors (“Licensor”)',
    license: 'Hippocratic-2.1',
  },
  {
    name: 'exifr',
    copyright: 'Copyright (c) 2020 Mike Kovařík, Mutiny.cz',
    license: 'MIT',
  },
  {
    name: 'jsonwebtoken',
    copyright:
      'Copyright (c) 2015 Auth0, Inc. <support@auth0.com> (http://auth0.com)',
    license: 'MIT',
  },
  {
    name: 'jwks-rsa',
    copyright: 'Copyright (c) 2016 Sandrino Di Mattia',
    license: 'MIT',
  },
  {
    name: 'leaflet',
    copyright:
      'Copyright (c) 2010-2023, Volodymyr Agafonkin\nCopyright (c) 2010-2011, CloudMade\nAll rights reserved.',
    license: 'BSD-2-Clause',
  },
  {
    name: 'leaflet.markercluster',
    copyright: 'Copyright 2012 David Leaver',
    license: 'MIT',
  },
  {
    name: 'luxon',
    copyright: 'Copyright 2019 JS Foundation and other contributors',
    license: 'MIT',
  },
  {
    name: 'next',
    copyright: 'Copyright (c) 2025 Vercel, Inc.',
    license: 'MIT',
  },
  {
    name: 'next-auth',
    copyright:
      'Copyright (c) 2018-2021, Iain Collins\nCopyright (c) 2021-2025, Better Auth Inc.',
    license: 'ISC',
  },
  {
    name: 'react',
    copyright: 'Copyright (c) Meta Platforms, Inc. and affiliates.',
    license: 'MIT',
  },
  {
    name: 'react-dom',
    copyright: 'Copyright (c) Meta Platforms, Inc. and affiliates.',
    license: 'MIT',
  },
  {
    name: 'react-leaflet',
    copyright:
      'react-leaflet Copyright 2020 Paul Le Cam and contributors (“Licensor”)',
    license: 'Hippocratic-2.1',
  },
  {
    name: 'recharts',
    copyright: 'Copyright (c) 2015-present recharts',
    license: 'MIT',
  },
]

const backendLibraries: Library[] = [
  {
    name: '@nestjs/common',
    copyright:
      'Copyright (c) 2017-2024 Kamil Mysliwiec <https://kamilmysliwiec.com>',
    license: 'MIT',
  },
  {
    name: '@nestjs/core',
    copyright:
      'Copyright (c) 2017-2024 Kamil Mysliwiec <https://kamilmysliwiec.com>',
    license: 'MIT',
  },
  {
    name: '@nestjs/platform-express',
    copyright:
      'Copyright (c) 2017-2024 Kamil Mysliwiec <https://kamilmysliwiec.com>',
    license: 'MIT',
  },
  {
    name: '@nestjs/typeorm',
    copyright:
      'Copyright (c) 2017-2022 Kamil Mysliwiec <https://kamilmysliwiec.com>',
    license: 'MIT',
  },
  {
    name: 'axios',
    copyright: 'Copyright (c) 2014-present Matt Zabriskie & Collaborators',
    license: 'MIT',
  },
  {
    name: 'class-transformer',
    copyright: 'Copyright (c) 2015-2020 TypeStack',
    license: 'MIT',
  },
  {
    name: 'class-validator',
    copyright: 'Copyright (c) 2015-2020 TypeStack',
    license: 'MIT',
  },
  {
    name: 'es-set-tostringtag',
    copyright: 'Copyright (c) 2022 ECMAScript Shims',
    license: 'MIT',
  },
  {
    name: 'jsonwebtoken',
    copyright:
      'Copyright (c) 2015 Auth0, Inc. <support@auth0.com> (http://auth0.com)',
    license: 'MIT',
  },
  {
    name: 'jwks-rsa',
    copyright: 'Copyright (c) 2016 Sandrino Di Mattia',
    license: 'MIT',
  },
  {
    name: 'luxon',
    copyright: 'Copyright 2019 JS Foundation and other contributors',
    license: 'MIT',
  },
  {
    name: 'papaparse',
    copyright: 'Copyright (c) 2015 Matthew Holt',
    license: 'MIT',
  },
  {
    name: 'pg',
    copyright: 'Copyright (c) 2010 - 2021 Brian Carlson',
    license: 'MIT',
  },
  {
    name: 'reflect-metadata',
    copyright: 'Copyright (C) Microsoft. All rights reserved.',
    license: 'Apache-2.0',
  },
  {
    name: 'rxjs',
    copyright:
      'Copyright (c) 2015-2018 Google, Inc., Netflix, Inc., Microsoft Corp. and contributors',
    license: 'Apache-2.0',
  },
  {
    name: 'typeorm',
    copyright: 'Copyright (c) 2015-2025 TypeORM. http://typeorm.github.io',
    license: 'MIT',
  },
  {
    name: 'uuid',
    copyright: 'Copyright (c) 2010-2020 Robert Kieffer and other contributors',
    license: 'MIT',
  },
]

const infrastructureSoftware: Library[] = [
  {
    name: 'FIWARE Orion',
    copyright: '© 2025 Telefonica Investigación y Desarrollo, S.A.U',
    license: 'AGPL-3.0',
    licenseUrl:
      'https://github.com/telefonicaid/fiware-orion/blob/4.3.0/LICENSE',
    note: 'Version 4.3.0',
  },
  {
    name: 'Keycloak',
    copyright:
      'Copyright 2016 Red Hat, Inc. and/or its affiliates\nand other contributors as indicated by the @author tags.',
    license: 'Apache-2.0',
    licenseUrl: 'https://github.com/keycloak/keycloak/blob/26.5.1/LICENSE.txt',
    note: 'Version 26.5.1',
  },
  {
    name: 'PostgreSQL',
    copyright:
      'Portions Copyright © 1996-2025, The PostgreSQL Global Development Group\nPortions Copyright (c) 1994, The Regents of the University of California',
    license: 'PostgreSQL License',
    licenseUrl: 'https://www.postgresql.org/about/licence/',
    note: 'Version 17.5',
  },
  {
    name: 'MongoDB',
    copyright: 'Copyright (C) 2018-present MongoDB, Inc.',
    license: 'SSPL',
    licenseUrl:
      'https://www.mongodb.com/legal/licensing/server-side-public-license',
    note: 'Version 8.0.17',
  },
]

const PrivacyPolicy: React.FC = () => {
  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{ px: '32px' }}
    >
      <Grid item xs={12} md={6}>
        <Grid item textAlign="center" sx={{ my: 2 }}>
          <Typography variant="h4">
            サードパーティ
            <br />
            ライセンス
          </Typography>
        </Grid>

        <Grid item textAlign="left" sx={{ my: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            地図データ・地図サービス
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            OpenStreetMap&apos;s Standard tile layer
          </Typography>
          <Link variant="body1" href="http://osm.org/copyright">
            © OpenStreetMap
          </Link>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Vector Map Level 0
          </Typography>
          <Link
            variant="body1"
            href="https://maps.gsi.go.jp/development/ichiran.html"
          >
            出典：地理院タイル「Shoreline data is derived from: United States.
            National Imagery and Mapping Agency. \Vector Map Level 0 (VMAP0).\
            Bethesda, MD: Denver, CO: The Agency; USGS Information Services,
            1997.」
          </Link>

          <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 4 }}>
            フォント
          </Typography>
          {fonts.map((font) => (
            <LibraryEntry key={font.name} item={font} />
          ))}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 4 }}>
            同梱ソフトウェア（Infrastructure）
          </Typography>
          {infrastructureSoftware.map((software) => (
            <LibraryEntry key={software.name} item={software} />
          ))}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 4 }}>
            利用ライブラリ（Frontend）
          </Typography>
          {frontendLibraries.map((library) => (
            <LibraryEntry key={library.name} item={library} />
          ))}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 4 }}>
            利用ライブラリ（Backend）
          </Typography>
          {backendLibraries.map((library) => (
            <LibraryEntry key={library.name} item={library} />
          ))}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default PrivacyPolicy
