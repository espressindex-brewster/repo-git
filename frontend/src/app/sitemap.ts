import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('prices')
    .select('created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const lastModified = data?.created_at ? new Date(data.created_at) : new Date('2026-05-01')

  return [
    {
      url: 'https://espressindex.com',
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://espressindex.com/privacy',
      lastModified: new Date('2026-05-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://espressindex.com/contatti',
      lastModified: new Date('2026-05-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
