import Layout from '@/components/layout'

export default function TermsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <Layout>{children}</Layout>
}
