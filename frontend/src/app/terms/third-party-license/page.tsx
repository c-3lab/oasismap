'use client'
import React from 'react'
import { Grid, Typography, Link } from '@mui/material'

type LicenseItem = {
  name: string
  copyright: string
  license: string
  licenseUrl?: string
  note?: string
}

const LicenseEntry: React.FC<{ item: LicenseItem }> = ({ item }) => {
  return (
    <Grid sx={{ mb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
        {item.name}
      </Typography>
      {item.copyright && (
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>
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

const fonts: LicenseItem[] = [
  {
    name: 'Inter',
    copyright:
      'Copyright (c) 2016 The Inter Project Authors (https://github.com/rsms/inter)',
    license: 'SIL Open Font License 1.1',
    licenseUrl: 'https://github.com/rsms/inter/blob/master/LICENSE.txt',
  },
]

const infrastructureSoftware: LicenseItem[] = [
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

const frontendLibraries: LicenseItem[] = [
  {
    name: '@emotion/react',
    copyright: 'Copyright (c) Emotion team and other contributors',
    license: 'MIT',
    licenseUrl: 'https://github.com/emotion-js/emotion/blob/main/LICENSE',
  },
  {
    name: '@emotion/styled',
    copyright: 'Copyright (c) Emotion team and other contributors',
    license: 'MIT',
    licenseUrl: 'https://github.com/emotion-js/emotion/blob/main/LICENSE',
  },
  {
    name: '@mui/icons-material',
    copyright: 'Copyright (c) 2014 Call-Em-All',
    license: 'MIT',
    licenseUrl: 'https://github.com/mui/material-ui/blob/master/LICENSE',
  },
  {
    name: '@mui/material',
    copyright: 'Copyright (c) 2014 Call-Em-All',
    license: 'MIT',
    licenseUrl: 'https://github.com/mui/material-ui/blob/master/LICENSE',
  },
  {
    name: '@mui/material-nextjs',
    copyright: 'Copyright (c) 2014 Call-Em-All',
    license: 'MIT',
    licenseUrl: 'https://github.com/mui/material-ui/blob/master/LICENSE',
  },
  {
    name: '@react-leaflet/core',
    copyright:
      'Copyright 2020-present Paul Le Cam and contributors (“Licensor”)',
    license: 'Hippocratic-2.1',
    licenseUrl:
      'https://github.com/PaulLeCam/react-leaflet/blob/master/LICENSE.md',
  },
  {
    name: 'exifr',
    copyright: 'Copyright (c) 2020 Mike Kovařík, Mutiny.cz',
    license: 'MIT',
    licenseUrl: 'https://github.com/MikeKovarik/exifr/blob/master/LICENSE',
  },
  {
    name: 'jsonwebtoken',
    copyright:
      'Copyright (c) 2015 Auth0, Inc. <support@auth0.com> (http://auth0.com)',
    license: 'MIT',
    licenseUrl:
      'https://github.com/auth0/node-jsonwebtoken/blob/master/LICENSE',
  },
  {
    name: 'jwks-rsa',
    copyright: 'Copyright (c) 2016 Sandrino Di Mattia',
    license: 'MIT',
    licenseUrl: 'https://github.com/auth0/node-jwks-rsa/blob/master/LICENSE',
  },
  {
    name: 'leaflet',
    copyright:
      'Copyright (c) 2010-2026, Volodymyr Agafonkin\nCopyright (c) 2010-2011, CloudMade\nAll rights reserved.',
    license: 'BSD-2-Clause',
    licenseUrl: 'https://github.com/Leaflet/Leaflet/blob/main/LICENSE',
  },
  {
    name: 'leaflet.markercluster',
    copyright: 'Copyright 2012 David Leaver',
    license: 'MIT',
    licenseUrl:
      'https://github.com/Leaflet/Leaflet.markercluster/blob/master/MIT-LICENCE.txt',
  },
  {
    name: 'luxon',
    copyright: 'Copyright 2019 JS Foundation and other contributors',
    license: 'MIT',
    licenseUrl: 'https://github.com/moment/luxon/blob/master/LICENSE.md',
  },
  {
    name: 'next',
    copyright: 'Copyright (c) 2025 Vercel, Inc.',
    license: 'MIT',
    licenseUrl: 'https://github.com/vercel/next.js/blob/canary/license.md',
  },
  {
    name: 'next-auth',
    copyright: 'Copyright (c) 2022-2024, Balázs Orbán',
    license: 'ISC',
    licenseUrl: 'https://github.com/nextauthjs/next-auth/blob/main/LICENSE',
  },
  {
    name: 'react',
    copyright: 'Copyright (c) Meta Platforms, Inc. and affiliates.',
    license: 'MIT',
    licenseUrl: 'https://github.com/react/react/blob/main/LICENSE',
  },
  {
    name: 'react-dom',
    copyright: 'Copyright (c) Meta Platforms, Inc. and affiliates.',
    license: 'MIT',
    licenseUrl: 'https://github.com/react/react/blob/main/LICENSE',
  },
  {
    name: 'react-leaflet',
    copyright:
      'Copyright 2020-present Paul Le Cam and contributors (“Licensor”)',
    license: 'Hippocratic-2.1',
    licenseUrl:
      'https://github.com/PaulLeCam/react-leaflet/blob/master/LICENSE.md',
  },
  {
    name: 'recharts',
    copyright: 'Copyright (c) 2015-present recharts',
    license: 'MIT',
    licenseUrl: 'https://github.com/recharts/recharts/blob/main/LICENSE',
  },
]

const backendLibraries: LicenseItem[] = [
  {
    name: '@nestjs/common',
    copyright:
      'Copyright (c) 2017-present Kamil Mysliwiec <https://kamilmysliwiec.com>',
    license: 'MIT',
    licenseUrl: 'https://github.com/nestjs/nest/blob/master/LICENSE',
  },
  {
    name: '@nestjs/core',
    copyright:
      'Copyright (c) 2017-present Kamil Mysliwiec <https://kamilmysliwiec.com>',
    license: 'MIT',
    licenseUrl: 'https://github.com/nestjs/nest/blob/master/LICENSE',
  },
  {
    name: '@nestjs/platform-express',
    copyright:
      'Copyright (c) 2017-present Kamil Mysliwiec <https://kamilmysliwiec.com>',
    license: 'MIT',
    licenseUrl: 'https://github.com/nestjs/nest/blob/master/LICENSE',
  },
  {
    name: '@nestjs/typeorm',
    copyright:
      'Copyright (c) 2017-2022 Kamil Mysliwiec <https://kamilmysliwiec.com>',
    license: 'MIT',
    licenseUrl: 'https://github.com/nestjs/typeorm/blob/master/LICENSE',
  },
  {
    name: 'axios',
    copyright: 'Copyright (c) 2014-present Matt Zabriskie & Collaborators',
    license: 'MIT',
    licenseUrl: 'https://github.com/axios/axios/blob/v1.x/LICENSE',
  },
  {
    name: 'class-transformer',
    copyright: 'Copyright (c) 2015-2020 TypeStack',
    license: 'MIT',
    licenseUrl:
      'https://github.com/typestack/class-transformer/blob/develop/LICENSE',
  },
  {
    name: 'class-validator',
    copyright: 'Copyright (c) 2015-2020 TypeStack',
    license: 'MIT',
    licenseUrl:
      'https://github.com/typestack/class-validator/blob/develop/LICENSE',
  },
  {
    name: 'es-set-tostringtag',
    copyright: 'Copyright (c) 2022 ECMAScript Shims',
    license: 'MIT',
    licenseUrl:
      'https://github.com/es-shims/es-set-tostringtag/blob/main/LICENSE',
  },
  {
    name: 'jsonwebtoken',
    copyright:
      'Copyright (c) 2015 Auth0, Inc. <support@auth0.com> (http://auth0.com)',
    license: 'MIT',
    licenseUrl:
      'https://github.com/auth0/node-jsonwebtoken/blob/master/LICENSE',
  },
  {
    name: 'jwks-rsa',
    copyright: 'Copyright (c) 2016 Sandrino Di Mattia',
    license: 'MIT',
    licenseUrl: 'https://github.com/auth0/node-jwks-rsa/blob/master/LICENSE',
  },
  {
    name: 'luxon',
    copyright: 'Copyright 2019 JS Foundation and other contributors',
    license: 'MIT',
    licenseUrl: 'https://github.com/moment/luxon/blob/master/LICENSE.md',
  },
  {
    name: 'papaparse',
    copyright: 'Copyright (c) 2015 Matthew Holt',
    license: 'MIT',
    licenseUrl: 'https://github.com/mholt/PapaParse/blob/master/LICENSE',
  },
  {
    name: 'pg',
    copyright: 'Copyright (c) 2010 - 2021 Brian Carlson',
    license: 'MIT',
    licenseUrl: 'https://github.com/brianc/node-postgres/blob/master/LICENSE',
  },
  {
    name: 'reflect-metadata',
    copyright: 'Copyright (c) Microsoft Corporation. All rights reserved.',
    license: 'Apache-2.0',
    licenseUrl:
      'https://github.com/microsoft/reflect-metadata/blob/main/LICENSE',
  },
  {
    name: 'rxjs',
    copyright:
      'Copyright (c) 2015-2025\n    Ben Lesh <ben@benlesh.com>\n    Google, Inc.\n    Netflix, Inc.\n    Microsoft Corp.\n    and contributors',
    license: 'Apache-2.0',
    licenseUrl: 'https://github.com/ReactiveX/rxjs/blob/master/LICENSE.txt',
  },
  {
    name: 'typeorm',
    copyright: 'Copyright (c) 2015-2025 TypeORM. http://typeorm.github.io',
    license: 'MIT',
    licenseUrl: 'https://github.com/typeorm/typeorm/blob/master/LICENSE',
  },
  {
    name: 'uuid',
    copyright: 'Copyright (c) 2010-2020 Robert Kieffer and other contributors',
    license: 'MIT',
    licenseUrl: 'https://github.com/uuidjs/uuid/blob/main/LICENSE.md',
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
            <LicenseEntry key={font.name} item={font} />
          ))}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 4 }}>
            同梱ソフトウェア（Infrastructure）
          </Typography>
          {infrastructureSoftware.map((software) => (
            <LicenseEntry key={software.name} item={software} />
          ))}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 4 }}>
            利用ライブラリ（Frontend）
          </Typography>
          {frontendLibraries.map((library) => (
            <LicenseEntry key={library.name} item={library} />
          ))}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 4 }}>
            利用ライブラリ（Backend）
          </Typography>
          {backendLibraries.map((library) => (
            <LicenseEntry key={library.name} item={library} />
          ))}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default PrivacyPolicy
