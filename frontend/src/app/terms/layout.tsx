import Layout from '@/components/layout'

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <Layout simple={true}>{children}</Layout>
}
