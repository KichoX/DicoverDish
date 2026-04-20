import { redirect } from 'next/navigation'

export default async function DineInPage({
  params,
}: {
  params: Promise<{ slug: string; tableId: string }>
}) {
  const { slug, tableId } = await params
  const tableNumber = tableId.replace('table-', '')
  redirect(`/r/${slug}/menu?table=${tableNumber}&mode=dine-in`)
}
