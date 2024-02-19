import Layout from '@/components/layout'

export default function HappinessLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <Layout>{children}</Layout>
}
