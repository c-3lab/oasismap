import Layout from '@/components/simple-layout'

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <Layout>{children}</Layout>
}
