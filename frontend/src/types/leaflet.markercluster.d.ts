import 'leaflet'

declare module 'leaflet' {
  namespace L {
    interface MarkerClusterGroupOptions extends LayerOptions {
      chunkedLoading?: boolean
      maxClusterRadius?: number
      disableClusteringAtZoom?: number
      spiderfyOnMaxZoom?: boolean
      showCoverageOnHover?: boolean
      zoomToBoundsOnClick?: boolean
      removeOutsideVisibleBounds?: boolean
      animate?: boolean
      animateAddingMarkers?: boolean
      iconCreateFunction?: (cluster: MarkerCluster) => Icon | DivIcon
    }

    class MarkerClusterGroup extends LayerGroup {
      constructor(options?: MarkerClusterGroupOptions)
      addLayers(layers: Layer[]): this
      removeLayers(layers: Layer[]): this
      clearLayers(): this
      getChildCount(): number
      // LayerGroupはLayerを継承しているので、Layerのメソッドも使用可能
      addTo(map: Map): this
      remove(): this
      removeFrom(map: Map): this
    }

    class MarkerCluster extends Marker {
      getChildCount(): number
    }
  }
}

// L名前空間にmarkerClusterGroup関数を追加
declare module 'leaflet' {
  namespace L {
    function markerClusterGroup(
      options?: MarkerClusterGroupOptions
    ): MarkerClusterGroup
  }
}
