declare module '*Map Visualization Data.json' {
  type VisualizationCategory = 'restaurant' | 'culture'

  export interface MapVisualizationEntry {
    id: string
    category: VisualizationCategory
    name: string
    address: string
    lat: string
    lng: string
    url: string
    type?: string
    audience?: string
  }

  const entries: MapVisualizationEntry[]
  export default entries
}
