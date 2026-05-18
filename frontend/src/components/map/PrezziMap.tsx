'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import SubmitPriceModal from '@/components/SubmitPriceModal'

export interface BarPin {
  id: string
  nome: string
  citta: string
  cap: string | null
  lat: number
  lng: number
  espresso: number | null
  cappuccino: number | null
  ultimoAggiornamento: string | null
  googlePlaceId: string | null
}

// ── Colore per fascia prezzo espresso ─────────────────────
function prezzoColore(e: number | null): string {
  if (e === null) return '#94a3b8'
  if (e < 1.10) return '#22c55e'
  if (e < 1.30) return '#eab308'
  if (e < 1.60) return '#f97316'
  return '#ef4444'
}

function prezzoLabel(e: number | null): string {
  return e != null ? `€${e.toFixed(2)}` : '—'
}

function fasciaLabel(e: number | null): string {
  if (e === null) return 'non rilevato'
  if (e < 1.10) return `< €1.10`
  if (e < 1.30) return `€1.10–1.30`
  if (e < 1.60) return `€1.30–1.60`
  return `> €1.60`
}

// ── Popup HTML ────────────────────────────────────────────
function formatData(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function popupHtml(props: Record<string, unknown>): string {
  const nome = String(props.nome ?? '')
  const cap = String(props.cap ?? props.citta ?? '')
  const esp = props.espresso != null ? `€${Number(props.espresso).toFixed(2)}` : '—'
  const capp = props.cappuccino != null ? `€${Number(props.cappuccino).toFixed(2)}` : '—'
  const fascia = fasciaLabel(props.espresso != null ? Number(props.espresso) : null)
  const colore = prezzoColore(props.espresso != null ? Number(props.espresso) : null)
  const data = formatData(props.ultimoAggiornamento != null ? String(props.ultimoAggiornamento) : null)
  const mapsUrl = props.googlePlaceId
    ? `https://www.google.com/maps/place/?q=place_id:${props.googlePlaceId}`
    : `https://www.google.com/maps/search/?api=1&query=${props.lat},${props.lng}`

  return `
    <div style="font-family:system-ui;padding:4px 2px;min-width:180px">
      <div style="font-weight:600;font-size:13px">${nome}</div>
      <div style="color:#6b7280;font-size:11px;margin-bottom:6px">CAP ${cap}</div>
      <div style="display:flex;align-items:center;gap:5px;margin-bottom:6px">
        <span style="width:8px;height:8px;border-radius:50%;background:${colore};display:inline-block;flex-shrink:0"></span>
        <span style="font-size:11px;color:#374151">${fascia}</span>
      </div>
      <div style="font-size:12px;display:flex;flex-direction:column;gap:3px">
        <span>☕ Espresso: <b>${esp}</b></span>
        <span>🥛 Cappuccino: <b>${capp}</b></span>
      </div>
      ${data ? `<div style="font-size:10px;color:#9ca3af;margin-top:6px">Rilevato il ${data}</div>` : ''}
      <div style="display:flex;gap:10px;margin-top:8px;align-items:center">
        <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer"
           style="font-size:10px;color:#3b82f6;text-decoration:none">
          Google Maps →
        </a>
        <button onclick="window.__espressindexSubmit('${props.id}','${nome.replace(/'/g, "\\'")}')"
                style="font-size:10px;color:#8b7355;background:none;border:none;cursor:pointer;padding:0;text-decoration:underline">
          Prezzo aggiornato? Segnalalo
        </button>
      </div>
    </div>`
}

export default function PrezziMap({ bars }: { bars: BarPin[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [submitBar, setSubmitBar] = useState<{ id: string; nome: string } | null>(null)

  useEffect(() => {
    ;(window as any).__espressindexSubmit = (id: string, nome: string) => setSubmitBar({ id, nome })
    return () => { delete (window as any).__espressindexSubmit }
  }, [])

  const conPrezzo = bars.filter((b) => b.espresso !== null).sort((a, b) => a.espresso! - b.espresso!)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [9.19, 45.464],
      zoom: 11.5,
    })

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    mapRef.current = map

    map.on('load', () => {
      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: bars.map((bar) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [bar.lng, bar.lat] },
          properties: {
            id: bar.id,
            nome: bar.nome,
            citta: bar.citta,
            cap: bar.cap,
            lat: bar.lat,
            lng: bar.lng,
            espresso: bar.espresso,
            cappuccino: bar.cappuccino,
            ultimoAggiornamento: bar.ultimoAggiornamento,
            googlePlaceId: bar.googlePlaceId,
            colore: prezzoColore(bar.espresso),
          },
        })),
      }

      map.addSource('bars', {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 13,
        clusterRadius: 50,
      })

      // 1. Heatmap — intensità per livello prezzo (verde=economico, rosso=caro)
      map.addLayer({
        id: 'heatmap',
        type: 'heatmap',
        source: 'bars',
        maxzoom: 14,
        paint: {
          'heatmap-weight': [
            'case',
            ['!=', ['typeof', ['get', 'espresso']], 'number'], 0.1,
            ['interpolate', ['linear'], ['get', 'espresso'],
              0.80, 0.1,
              1.10, 0.3,
              1.30, 0.6,
              1.60, 1.0,
            ],
          ],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 12, 3],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0,   'rgba(34,197,94,0)',
            0.2, 'rgba(34,197,94,0.4)',
            0.4, 'rgba(234,179,8,0.55)',
            0.7, 'rgba(249,115,22,0.75)',
            1.0, 'rgba(239,68,68,0.9)',
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 4, 12, 25],
          'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 10, 0.9, 13, 0],
        },
      })

      // 2. Cluster circles
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'bars',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#6b4226',
          'circle-radius': ['step', ['get', 'point_count'], 18, 10, 26, 50, 34],
          'circle-opacity': 0.85,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      })

      // 3. Cluster count
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'bars',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: { 'text-color': '#ffffff' },
      })

      // 4. Marker individuali colorati per prezzo
      map.addLayer({
        id: 'unclustered',
        type: 'circle',
        source: 'bars',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'colore'],
          'circle-radius': 7,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#fff',
        },
      })

      // Click cluster → zoom in
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
        const clusterId = features[0].properties!.cluster_id as number
        ;(map.getSource('bars') as mapboxgl.GeoJSONSource)
          .getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err || zoom == null) return
            const coords = (features[0].geometry as GeoJSON.Point).coordinates as [number, number]
            map.easeTo({ center: coords, zoom })
          })
      })

      // Click marker → popup
      const popup = new mapboxgl.Popup({ offset: 12, closeButton: false })
      map.on('click', 'unclustered', (e) => {
        const props = e.features![0].properties as Record<string, unknown>
        const coords = (e.features![0].geometry as GeoJSON.Point).coordinates as [number, number]
        setSelectedId(String(props.id))
        popup.setLngLat(coords).setHTML(popupHtml(props)).addTo(map)
      })

      map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = '' })
      map.on('mouseenter', 'unclustered', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'unclustered', () => { map.getCanvas().style.cursor = '' })
    })

    return () => { map.remove(); mapRef.current = null }
  }, [bars])

  // Click sidebar → vola al bar
  function flyToBar(bar: BarPin) {
    setSelectedId(bar.id)
    mapRef.current?.flyTo({ center: [bar.lng, bar.lat], zoom: 15, duration: 800 })
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* ── Sidebar ────────────────────────────── */}
      <aside className="w-64 shrink-0 bg-white border-r flex flex-col overflow-hidden">
        <div className="px-3 py-2 border-b">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Prezzi espresso</p>
        </div>

        {/* Legenda */}
        <div className="px-3 py-2 border-b space-y-1">
          {[
            { col: '#22c55e', label: '< €1.10' },
            { col: '#eab308', label: '€1.10–1.30' },
            { col: '#f97316', label: '€1.30–1.60' },
            { col: '#ef4444', label: '> €1.60' },
            { col: '#94a3b8', label: 'non rilevato' },
          ].map(({ col, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: col }} />
              {label}
            </div>
          ))}
        </div>

        {/* Lista bar con prezzi */}
        <div className="flex-1 overflow-y-auto">
          {conPrezzo.length === 0 ? (
            <p className="px-3 py-4 text-xs text-gray-400">Nessun prezzo ancora raccolto.</p>
          ) : (
            conPrezzo.map((bar) => (
              <button
                key={bar.id}
                onClick={() => flyToBar(bar)}
                className={`w-full text-left px-3 py-2.5 border-b hover:bg-gray-50 transition-colors ${selectedId === bar.id ? 'bg-amber-50 border-l-2 border-l-amber-500' : ''}`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-medium text-gray-800 truncate">{bar.nome}</span>
                  <span
                    className="text-xs font-bold shrink-0"
                    style={{ color: prezzoColore(bar.espresso) }}
                  >
                    {prezzoLabel(bar.espresso)}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] text-gray-400">{bar.cap ? `CAP ${bar.cap}` : bar.citta}</span>
                  <span className="text-[10px] text-gray-300">·</span>
                  <span className="text-[10px] text-gray-400">{fasciaLabel(bar.espresso)}</span>
                </div>
                {bar.cappuccino != null && (
                  <div className="text-[10px] text-gray-400 mt-0.5">cappuccino {prezzoLabel(bar.cappuccino)}</div>
                )}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── Mappa ──────────────────────────────── */}
      <div ref={containerRef} className="flex-1 h-full" />

      {submitBar && (
        <SubmitPriceModal
          isOpen={true}
          onClose={() => setSubmitBar(null)}
          barId={submitBar.id}
          barNome={submitBar.nome}
          fonte="cliente"
        />
      )}
    </div>
  )
}
