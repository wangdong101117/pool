import mapconfig from './mapconfig'
import ImageLayer from '@/components/ol/layer/Image'
import ImageWMS from '@/components/ol/source/ImageWMS'
import VectorLayer from '@/components/ol/layer/Vector'
import { Vector } from '@/components/ol/source'
import { GeoJSON } from '@/components/ol/format'
import OSM from '@/components/ol/source/OSM'
import XYZ from '@/components/ol/source/XYZ'
import TileLayer from '@/components/ol/layer/Tile'
import TileWMS from '@/components/ol/source/TileWMS'

let getLayer = (params) => {
  let layer
  let type = params.type
  switch (type) {
    case 'wms':
      var wmsSource = new ImageWMS({
        url: params.serviceUrl ? params.serviceUrl : mapconfig.geoServerUrl + '/wms',
        params: { 'LAYERS': params.layers },
        serverType: 'geoserver',
        crossOrigin: 'anonymous'
      })
      layer = new ImageLayer({
        source: wmsSource,
        id: params.id,
        name: params.name,
        visible: params.visible
      })
      break
    case 'tilewms':
      layer = new TileLayer({
        // extent: [-13884991, 2870341, -7455066, 6338219],
        source: new TileWMS({
          url: params.serviceUrl ? params.serviceUrl : mapconfig.geoServerUrl + '/wms',
          params: { 'LAYERS': params.layers, 'TILED': true },
          serverType: 'geoserver',
          // Countries have transparency, so do not fade tiles:
          transition: 0
        }),
        id: params.id,
        name: params.name,
        visible: params.visible,
        minResolution: params.min ? params.min : undefined,
        maxResolution: params.max ? params.max : undefined
      })
      break

    default:
      break
  }

  return layer
}

export default {
  getLayer: getLayer
}
