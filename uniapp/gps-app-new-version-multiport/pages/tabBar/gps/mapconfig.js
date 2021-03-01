import TileLayer from "@/components/ol/layer/Tile" // TileLayer: 用于加载 地图 底图 瓦片
import WMTS from '@/components/ol/source/WMTS.js'; // WMTS: web地图瓦片服务, 该文件用于加载 web地图瓦片 服务器
import WMTSTileGrid from '@/components/ol/tilegrid/WMTS.js';
import { register } from "@/components/ol/proj/proj4.js";
import proj4 from "@/components/proj4";
import Projection from "@/components/ol/proj/Projection.js";
import XYZ from '@/components/ol/source/XYZ'
// es6 语法, import as xxx 是将 get对象 整体 导出为 getProjection, 避免出现关键字冲突, 使用getProjection 代替 get
import { get as getProjection, getTransform } from "@/components/ol/proj.js";
// applyTransform 在可视范围内 应用转换变换函数  getWidth: 获取可视范围范围的宽度  getTopLeft() 获取可视范围内 左上角坐标
import { applyTransform, getWidth, getTopLeft } from "@/components/ol/extent.js";
//0表示部署的离线瓦片地图，1表示OSM,2表示使用Arcgis在线午夜蓝地图服务

// 根据传入的 maptype, 可以加载不同的 地图底图图层
var streetmap = function (maptype) {
    var mapLayer = null;
    let projection = getPro();
    var projectionExtent = projection.getExtent();
    var size = getWidth(projectionExtent) / 256;
    var resolutions = [];
    var matrixIds = [];
    for (var z = 0; z < 20; ++z) {
        resolutions[z] = size / Math.pow(2, z);
        matrixIds[z] = z;
    }
    // 加载的是天地图地图图层 天地图地图服务二级域名包括t0-t7，您可以随机选择使用，如http://t2.tianditu.gov.cn/vec_c/wmts?tk=您的密钥
    switch (maptype) {
        case 0:
            // 生成 WMTS 资源
            let tdtSource = new WMTS({
                // 加载天地图 矢量底图-经纬度投影 瓦片底图 服务 的url
                url: 'http://t{0-6}.tianditu.gov.cn/vec_c/wmts?tk=e572fbc5463123860234760bdc8d7dbd',
                layer: 'vec', // 在 WMTS功能中公布的 层名称
                matrixSet: 'c', // 矩阵集
                format: 'tiles', // 要加载的 瓦片 图片格式,
                projection: projection, // 投影
                tileGrid: new WMTSTileGrid({ // 设置 WMTS 平铺 图像服务器  瓦片网格 图案
                    origin: getTopLeft(projectionExtent), // 平铺网格 原点
                    resolutions: resolutions, // 每个分辨率数组 多音需要与 缩放级别匹配
                    matrixIds: matrixIds // 矩阵id, 数组类型, 数组的长度需要与resolutions 数组的长度匹配
                }),
                style: 'default', // WMTS 功能中公布的 样式名称
                wrapX: true // 是否横向包裹世界
            });
            // 加载天地图底图资源
            mapLayer = new TileLayer({
                id: 'rasterlayer',
                name: '地图',
                source: tdtSource
            })
            break;
        case 1:
            let rasterSource = new WMTS({
                // 影像底图-经纬度投影
                url: 'http://t{0-6}.tianditu.gov.cn/img_c/wmts?tk=e572fbc5463123860234760bdc8d7dbd',
                layer: 'img',
                matrixSet: 'c',
                format: 'tiles',
                projection: projection,
                tileGrid: new WMTSTileGrid({
                    origin: getTopLeft(projectionExtent),
                    resolutions: resolutions,
                    matrixIds: matrixIds
                }),
                style: 'default',
                wrapX: true
            });
            mapLayer = new TileLayer({
                id: 'rasterlayer',
                name: '卫星',
                source: rasterSource
            })
            break;
        case 2:
            let tdtLabelSource = new WMTS({
                // 加载矢量注记-经纬度投影底图
                url: 'http://t{0-6}.tianditu.gov.cn/cva_c/wmts?tk=e572fbc5463123860234760bdc8d7dbd',
                layer: 'cva',
                matrixSet: 'c',
                format: 'tiles',
                projection: projection,
                tileGrid: new WMTSTileGrid({
                    origin: getTopLeft(projectionExtent),
                    resolutions: resolutions,
                    matrixIds: matrixIds
                }),
                style: 'default',
                wrapX: true
            });
            mapLayer = new TileLayer({
                id: 'tdtLabel',
                name: '地图标注',
                source: tdtLabelSource
            })
            break;
        case 3:
            let rasterLabelSource = new WMTS({
                // 影像注记-经纬度投影
                url: 'http://t{0-6}.tianditu.gov.cn/cia_c/wmts?tk=e572fbc5463123860234760bdc8d7dbd',
                layer: 'cia',
                matrixSet: 'c',
                format: 'tiles',
                projection: projection,
                tileGrid: new WMTSTileGrid({
                    origin: getTopLeft(projectionExtent),
                    resolutions: resolutions,
                    matrixIds: matrixIds
                }),
                style: 'default',
                wrapX: true
            });
            mapLayer = new TileLayer({
                id: 'rasterLabel',
                name: '卫星标注',
                source: rasterLabelSource
            })
            break;

        case 4:
                mapLayer = new TileLayer({
                id: 'rasterlayer',
                name: '谷歌影像图',
                source: new XYZ({
                    url: 'http://mt2.google.cn/vt/lyrs=y&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=G'
                })
            })
            break;
    }
    return mapLayer;
}
function getPro() {
    // proj4.js: 转换空间坐标
    // 在proj4.js中预定义了 三种坐标系: WGS84(EPSG:4326) web墨卡托投影(EPSG: 3857)

    // proj4.defs 定义4326坐标系，且与其他 WGS84(4326)的互相转换 (定义需要转换的坐标系)
    // 各种坐标系 格式定义列表 查看: epsg proj4格式定义列表
    proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");
    //
    register(proj4);
    // getProjection(): 就是ol/proj 中的 get(), 参数1: code: proj4.defs()参数1定义的坐标系(标识符代码)
    var newProj = getProjection("EPSG:4326");
    /* getTransform(): 给定 类投影对象, 搜索转换函数 用来 将坐标数组从 源投影 转换为 目标投影
     * 参数:
        * 参数1:  proj4.defs()参数1定义的坐标系(标识符代码)
        * 参数2:  getProjection() 的返回值
     */
    var fromLonLat = getTransform("EPSG:4326", newProj);
    // very approximate calculation of projection extent
    // var extent = applyTransform([73.62, 16.7, 134.77, 53.56], fromLonLat);
    // applyTransform 在可视范围内 应用转换变换函数
    var extent = applyTransform([-180, -90, 180, 90], fromLonLat);
    newProj.setExtent(extent);
    return newProj;
}
var mapconfig = {
    projection: 'EPSG:4326',
    center: [114.47266114017616, 22.59475938021733],
    zoom: 12,          //地图缩放级别
    streetmap: streetmap,
    geoServerUrl: "http://202.85.222.7:8080/geoserver/world/wms",
    getPro: getPro
};

export default mapconfig
