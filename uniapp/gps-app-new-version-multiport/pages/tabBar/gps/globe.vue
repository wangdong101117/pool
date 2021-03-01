<template>
    <!-- #ifdef APP-PLUS -->
   <view id="map-container" name="olmap" class="map-container uni-container">
        <view class="map-tool">
            <view>
                <view id="world_btn">国家</view>
                <view id="china_btn">省</view>
                <view id="province_btn">市</view>
                <view id="city_btn">县</view>
            </view>
        </view>
        <view id="map" class="mapBox"></view>
    </view>
    <!-- #endif -->
    <!-- #ifdef MP-WEIXIN -->
    <web-view :src='`http://localhost:8080/home/?Cookie=${Cookie}`'></web-view>
    <!-- #endif -->
</template>

<script>
    export default {
        data() {
            return {
                // #ifdef MP-WEIXIN
                Cookie: getApp().globalData.header.Cookie
                // #endif
            }
        }
    }
</script>

<script lang="renderjs" module="mapBox">
    import '@/components/ol/ol.css'
    import {
        Map,
        View
    } from '@/components/ol'
    import {
        getCenter
    } from '@/components/ol/extent'
    import mapconfig from './mapconfig'
    import layerconfig from './layerconfig'
    import {
        defaults as defaultControls
    } from '@/components/ol/control.js'
    import VectorSource from '@/components/ol/source/Vector'
    import VectorLayer from '@/components/ol/layer/Vector'
    import Feature from '@/components/ol/Feature'

    import {
        defaults as defaultInteractions,
        Pointer as PointerInteraction
    } from '@/components/ol/interaction'

    import {
        Circle as CircleStyle,
        Fill,
        Style,
        Stroke,
        Color,
        Icon,
        Text
    } from '@/components/ol/style.js'

    import {
        WFS,
        WKT,
        GeoJSON
    } from '@/components/ol/format.js'

    import mixin from '@/common/mixin.js'

    /** 使用indexedDB */
    /** 1. 打开数据库 window.indexedDB.open(databaseName, version)*/
    var requestDB = window.indexedDB.open('geomDB', 1)
    /** error事件 */
    requestDB.onerror = function(event) {
        console.log('数据库打开报错')
    }

    var db
    var objectStore
    var readObj = {
        geom_md5: '',
        geom_txt: ''
    }
    /** success事件 */
    requestDB.onsuccess = function(event) {
        /** 拿到数据库对象 */
        db = requestDB.result
        console.log('数据库打开成功', db)
        if (!db.objectStoreNames.contains('globe_geomDB')) {
            objectStore = db.createObjectStore('globe_geomDB', {
                keyPath: 'id'
            })
            /** 参数分别为 索引名称 / 索引所在的属性 / 配置对象(是否唯一) */
            objectStore.createIndex('geom_md5', 'geom_md5', {
                unique: true
            })
            objectStore.createIndex('geom_txt', 'geom_txt', {
                unique: true
            })
        }
    }

    /** upgradeneeded 事件 */
    requestDB.onupgradeneeded = function(event) {
        console.log('upgradeneeded 事件')
        db = event.target.result
        /** 判断是否存在 globe_geomDB 表格, 不存在就创建 */
        if (!db.objectStoreNames.contains('globe_geomDB')) {
            objectStore = db.createObjectStore('globe_geomDB', {
                keyPath: 'id'
            })
            /** 参数分别为 索引名称 / 索引所在的属性 / 配置对象(是否唯一) */
            objectStore.createIndex('geom_md5', 'geom_md5', {
                unique: true
            })
            objectStore.createIndex('geom_txt', 'geom_txt', {
                unique: true
            })
        }
    }

    export default {
        mixins: [mixin],
        data() {
            let img_url = require('./my_icon.png');
            return {
                img_url,
                level: '',
                // txngps002
                locateQueryParams: {
                    input: {
                        longitude: '',
                        latitude: '',
                        region_level: ''
                    }
                },
                timer: null,
                gpsQueryParams: {
                    input: {
                        region_level: ''
                    }
                },
                lastLevel: '',
                res: [{
                        //世界
                        center: [1.5373844923691449, 0.5824610970244106],
                        zoom: 1.0,
                        maxres: 0.2319447499405479,
                        minres: 0.05627038962088
                    },
                    {
                        //省份
                        center: [102.67677456339595, 33.42833563812146],
                        zoom: 3.4233333333333255,
                        maxres: 0.15627038962088,
                        minres: 0.010986328126
                    },
                    {
                        //市
                        center: [102.67677456339595, 33.42833563812146],
                        zoom: 7,
                        maxres: 0.010986328126,
                        minres: 0.00274658203126
                    },
                    {
                        //县
                        center: [102.67677456339595, 33.42833563812146],
                        zoom: 9,
                        maxres: 0.00274658203126,
                        minres: 0
                    }
                ],
                geoserverUrl: 'http://geoserver.tlsk.com.cn/geoserver/',
                map: null,
                view: null,
                basicL: null,
                gpsL: null, //gps个数图层
                curL: null, //当前级别图层
                backL: null, //父背景
                proF: null, //点击的省份feature
                cityF: null, //点击的市
                worldL: null,
                chinaL: null,
                proL: null,
                cityL: null,
                countyL: null,
                basicLayers: [this.worldL, this.proL, this.cityL, this.countyL],
                /** 用于控制 点击事件, 避免上一次点击事件未执行完, 就又开始执行下一次点击事件 */
                state: '',
                /** 给跳转的页面 传递的参数 */
                code: '',
                name: '',
                canNavigateTo: true,
                world_btn: '',
                china_btn: '',
                province_btn: '',
                city_btn: ''
            }
        },
        watch: {
            level: function(val, oldval) {
                this.getGps();
                if (this.timer) {
                    clearInterval(this.timer);
                    this.timer = null
                }
                this.timer = setInterval(() => {
                    this.getGps()
                }, 12000)
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.initMap()
            });
            this.world_btn = document.querySelector('#world_btn')
            this.china_btn = document.querySelector('#china_btn')
            this.province_btn = document.querySelector('#province_btn')
            this.city_btn = document.querySelector('#city_btn')
            this.world_btn.onclick = () => {

                this.level = '1'
                this.world_btn.classList.add('activebtn')
                this.china_btn.classList.remove('activebtn')
                this.province_btn.classList.remove('activebtn')
                this.city_btn.classList.remove('activebtn')
                this.change_level('1')
                console.log(this.world_btn.classList.contains('activebtn'));
            }

            this.china_btn.onclick = () => {
                this.level = '2'
                this.world_btn.classList.remove('activebtn')
                this.china_btn.classList.add('activebtn')
                this.province_btn.classList.remove('activebtn')
                this.city_btn.classList.remove('activebtn')
                this.change_level('2')
            }
            document.querySelector('#province_btn').onclick = () => {
                this.level = '3'
                this.world_btn.classList.remove('activebtn')
                this.china_btn.classList.remove('activebtn')
                this.province_btn.classList.add('activebtn')
                this.city_btn.classList.remove('activebtn')
                this.change_level('3')
            }
            document.querySelector('#city_btn').onclick = () => {
                this.level = '4'
                this.world_btn.classList.remove('activebtn')
                this.china_btn.classList.remove('activebtn')
                this.province_btn.classList.remove('activebtn')
                this.city_btn.classList.add('activebtn')
                this.change_level('4')
            }
        },
        methods: {
            getGps() {
                this.gpsQueryParams.input.region_level = parseInt(this.level);
                var xhr = new XMLHttpRequest();
                xhr.open('POST', `${this.api}txngpsp00.ajson`);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                let msg =
                    `input:region_level=${this.gpsQueryParams.input.region_level}`
                xhr.send(msg);
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        var datas = JSON.parse(xhr.responseText);
                        if (datas.error_code === '000000') {
                            this.gpsCount(datas.region)
                        }
                    }
                }
            },
            onContextmenu(event, ownerInstance) {
                let timer = setInterval(() => {
                    if (this.state == '') {
                        ownerInstance.callMethod('getNavigatePageData', {
                            name: this.name,
                            code: this.code,
                            level: this.level,
                            canNavigateTo: this.canNavigateTo
                        })
                        clearInterval(timer)
                    }
                }, 100)
            },
            /** 向indexDB中 新增数据 */
            addInformation(code, md5, txt) {
                var request = db.transaction(['globe_geomDB'], 'readwrite')
                    /** 得到表格对象 */
                    .objectStore('globe_geomDB')
                    .add({
                        id: code,
                        geom_md5: md5,
                        geom_txt: txt
                    })

                request.onsuccess = function(event) {
                    console.log('数据写入成功')
                }

                request.onerror = function(event) {
                    console.log('数据写入失败')
                }
            },
            /** 读取 indexDB 中的数据 */
            readInformation(code, data) {
                let _this = this
                var transaction = db.transaction(['globe_geomDB'])
                var objectStore = transaction.objectStore('globe_geomDB')
                /** 通过主键读取数据 */
                var request = objectStore.get(code)

                request.onerror = function(event) {
                    console.log('事务失败')
                }
                request.onsuccess = (event) => {
                    plus.nativeUI.closeWaiting();
                    if (request.result) {
                        console.log('geom_md5: ' + code, request.result.geom_md5)
                        // console.log('geom_txt: ' + code,  request.result.geom_txt)
                        if (data.geom_md5 === request.result.geom_md5) {
                            /** 如果缓存中有当前地区的边界数据 */
                            if (request.result.geom_txt) {
                                let geom = new WKT().readGeometry(request.result.geom_txt)
                                let f = new Feature({
                                    geometry: geom
                                })
                                this.backL.getSource().addFeature(f)
                                let maxres = this.res[parseInt(this.level)].maxres
                                let _a = maxres.toString()
                                let _b = parseFloat(_a.substring(0, _a.length - 1))
                                this.view.setCenter(getCenter(geom.getExtent()))
                                this.view.setResolution(_b)

                                /** 处理完毕, 重新设置state 为 '', 以便下一次的点击事件能够触发 */
                                this.state = ''

                                this.level = parseInt(this.level) + 1 + ''
                                if (this.level == '3') {
                                    this.world_btn.classList.remove('activebtn')
                                    this.china_btn.classList.remove('activebtn')
                                    this.province_btn.classList.add('activebtn')
                                    this.city_btn.classList.remove('activebtn')
                                } else if (this.level == '4') {
                                    this.world_btn.classList.remove('activebtn')
                                    this.china_btn.classList.remove('activebtn')
                                    this.province_btn.classList.remove('activebtn')
                                    this.city_btn.classList.add('activebtn')
                                }
                            } else {
                                /** 如果缓存中没有txt 或者 md5不相同, 调用002 */
                                console.log('222')
                                this.getGeom_text(request.result.geom_md5, request.result.geom_txt)
                            }
                        } else {
                            console.log('333')
                            /** 如果缓存中的md5与001返回的不相同 或者 没有对应code 的 md5, 调用002 */
                            this.getGeom_text(request.result.geom_md5, request.result.geom_txt)
                        }
                    } else {
                        console.log('未获得数据记录')
                        this.getGeom_text()
                    }
                }
            },
            /** 更新修改 indexDB 中的数据 */
            updateInformation(code, md5, txt) {
                var request = db.transaction(['globe_geomDB'], 'readwrite')
                    .objectStore('globe_geomDB')
                    .put({
                        id: code,
                        geom_md5: md5,
                        geom_txt: txt
                    })

                request.onsuccess = function(event) {
                    console.log('数据更新成功')
                }

                request.onerror = function(event) {
                    console.log('数据更新失败')
                }
            },
            /** 调用txngps002: 获取边界数据 */
            getGeom_text(md5, txt) {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', `${this.api}txngps002.ajson`);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                let msg =
                    `input:longitude=${this.locateQueryParams.input.longitude}&input:latitude=${this.locateQueryParams.input.latitude}&input:region_level=${this.locateQueryParams.input.region_level}`
                xhr.send(msg);
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        var datas = JSON.parse(xhr.responseText);
                        let data = datas.region[0];
                        // uni.hideLoading()
                        if (data.code) {
                            this.name = data.name;
                            this.code = data.code;

                            if (md5) {
                                /** 需要修改 并 存储在 indexDB中 */
                                this.updateInformation(data.code, data.geom_md5, data.geom_txt)
                            } else {
                                /** 添加存储在 indexDB中 */
                                this.addInformation(data.code, data.geom_md5, data.geom_txt)
                            }

                            let geom = new WKT().readGeometry(data.geom_txt)
                            let f = new Feature({
                                geometry: geom
                            })
                            this.backL.getSource().addFeature(f)
                            this.view.fit(geom)

                            /** 处理完毕, 重新设置state 为 '', 以便下一次的点击事件能够触发 */
                            this.state = ''
                        } else {
                            plus.nativeUI.toast('当前点击的是无效区域')
                            /** 处理完毕, 重新设置state 为 '', 以便下一次的点击事件能够触发 */
                            this.state = ''
                        }
                    } else {
                        /** 处理完毕, 重新设置state 为 '', 以便下一次的点击事件能够触发 */
                        this.state = ''
                    }
                }
            },
            
            /** 点击(单击)事件处理程序 */
            identify(evt) {
                // 调用nativeUI的 关闭系统等待对话框方法
                plus.nativeUI.closeWaiting();
                this.backL.getSource().clear();
                // 调用显示系统等待对话框方法
                plus.nativeUI.showWaiting();
                /** 设置控制点击事件的 state 为 pending, 当下次点击时, 如果 state的值 仍为pending, 阻止事件的触发 */
                this.state = 'pending';
                this.locateQueryParams.input.longitude = evt.coordinate[0];
                this.locateQueryParams.input.latitude = evt.coordinate[1];
                this.locateQueryParams.input.region_level = this.level;

                /** 先调用001,查看geom_md5, 如果md5跟缓存的md5相同, 查看本地的边界数据, 如果没有md5 或者不同, 调002 */
                var xhr = new XMLHttpRequest();
                xhr.open('POST', `${this.api}txngps001.ajson`);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                let msg =
                    `input:longitude=${this.locateQueryParams.input.longitude}&input:latitude=${this.locateQueryParams.input.latitude}&input:region_level=${this.locateQueryParams.input.region_level}`
                xhr.send(msg);
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        var datas = JSON.parse(xhr.responseText);
                        if (datas.error_code === '000000') {
                            let data = datas.region[0];
                            this.readInformation(data.code, data)
                        }
                    }
                }
            },
            /** 得到聚合 车辆数量 */
            gpsCount(data) {
                if (!data || data.length == 0) {
                    this.curL.getSource().clear();
                    this.gpsL.getSource().clear();
                    return
                }
                if (this.lastLevel == this.level) {
                    let fs = [];
                    let features = this.gpsL.getSource().getFeatures();

                    features.forEach(f => {
                        //清除原来有 现在没有数据的
                        if (
                            !data.some(d => {
                                return d.code == f.getId()
                            })
                        ) {
                            this.gpsL.getSource().removeFeature(f)
                        }
                    });
                    data.forEach((item) => {
                        let f = this.gpsL.getSource().getFeatureById(item.code);
                        if (f) {
                            f.set('count', item.count)
                        } else {
                            let count = item.count;
                            let geom = new WKT().readGeometry(item.center);
                            let f = new Feature({
                                geometry: geom,
                                count: count
                            });
                            f.setId(item.code);
                            fs.push(f)
                        }
                    });
                    this.gpsL.getSource().addFeatures(fs)
                } else {
                    this.curL.getSource().clear();
                    this.gpsL.getSource().clear();
                    let fs = [];

                    data.forEach(function(item) {
                        let count = item.count
                        let geom = new WKT().readGeometry(item.center);
                        let f = new Feature({
                            geometry: geom,
                            count: count
                        });
                        f.setId(item.code);
                        fs.push(f)
                    });
                    this.gpsL.getSource().addFeatures(fs)
                }
            },
            change_level(l) {
                this.backL.getSource().clear();
                let oldval = l
                // if (oldval == '1') {
                //     this.res[2].center = this.res[3].center = this.res[0].center
                // } else {
                //     this.res[2].center = this.res[3].center = this.view.getCenter()
                // }
                switch (l) {
                    case '1': //世界
                        this.view.animate({
                            center: this.res[0].center,
                            zoom: this.res[0].zoom,
                            duration: 500
                        });
                        break;
                    case '2': //省
                        this.view.animate({
                            center: this.res[1].center,
                            zoom: this.res[1].zoom,
                            duration: 500
                        });
                        break;
                    case '3': //市
                        this.view.animate({
                            center: this.res[2].center,
                            zoom: this.res[2].zoom,
                            duration: 500
                        });
                        break;
                    case '4': //县
                        this.view.animate({
                            center: this.res[3].center,
                            zoom: this.res[3].zoom,
                            duration: 500
                        });
                        break;
                    default:
                        break
                }
                this.level = l;
            },
            /** 地图初始化 */
            initMap() {
                /** 地图容器 */
                let mapcontainer = document.querySelector("#map");
                this.view = new View({
                    projection: mapconfig.getPro(),
                    center: this.res[0].center,
                    zoom: this.res[0].zoom,
                    minZoom: this.res[0].zoom
                });
                let dzL = mapconfig.streetmap(0);
                let dzLabel = mapconfig.streetmap(2);
                /** 世界图层 */
                this.worldL = layerconfig.getLayer({
                    serviceUrl: this.geoserverUrl + 'world/wms',
                    type: 'tilewms',
                    layers: 'world:world',
                    visible: true
                });
                /** china 中国图层 */
                this.chinaL = layerconfig.getLayer({
                    serviceUrl: this.geoserverUrl + 'world/wms',
                    type: 'tilewms',
                    layers: 'world:china',
                    visible: true
                });
                /** china 中国省份 */
                this.proL = layerconfig.getLayer({
                    serviceUrl: this.geoserverUrl + 'world/wms',
                    type: 'tilewms',
                    layers: 'world:province',
                    visible: true,
                    min: this.res[1].minres,
                    max: this.res[1].maxres
                });
                /** 市图层 */
                this.cityL = layerconfig.getLayer({
                    serviceUrl: this.geoserverUrl + 'world/wms',
                    type: 'tilewms',
                    layers: 'world:city',
                    visible: true,
                    min: this.res[2].minres,
                    max: this.res[2].maxres
                });
                /** 县图层 */
                this.countyL = layerconfig.getLayer({
                    serviceUrl: this.geoserverUrl + 'world/wms',
                    type: 'tilewms',
                    layers: 'world:county',
                    visible: true,
                    min: this.res[3].minres,
                    max: this.res[3].maxres
                });
                /** 聚合图标的配置 */
                this.gpsL = new VectorLayer({
                    source: new VectorSource(),
                    id: 'gpsLayer',
                    style: (f, r) => {
                        let property = f.getProperties();
                        let count = property.count;
                        return new Style({
                            image: new CircleStyle({
                                radius: count > 999 ? 16 : 12,
                                /** 聚合图标 圆圈的填充颜色 */
                                fill: new Fill({
                                    color: '#fa605a'
                                }),
                                /** 圆圈 线的颜色 */
                                stroke: new Stroke({
                                    color: '#2b3561',
                                    width: 3
                                })
                            }),
                            // image: new Icon({
                            //     anchor: [0.55, 0.4],
                            //     src: this.img_url,
                            //     // src: require('./my_icon.png'),
                            //     rotateWithView: false,
                            //     // rotation: 0,
                            //     scale: count > 999 ? 2.0 : 1.6,
                            // }),
                            /** 聚合图标 文字配置 */
                            text: new Text({
                                font: '12px 微软雅黑',
                                text: count.toString(),
                                fill: new Fill({
                                    color: '#fff0c3'
                                })
                            })
                        })
                    }
                });
                this.curL = new VectorLayer({
                    source: new VectorSource(),
                    style: (f, r) => {
                        let property = f.getProperties();
                        let label = property.name;
                        if (!label) {
                            label = property.COUNTRY
                        }
                        let fillC = '#f6f6f6'; // cols[Math.floor(Math.random() * 4)];
                        return new Style({
                            stroke: new Stroke({
                                color: '#c5bfe8',
                                width: 2
                            }),
                            fill: new Fill({
                                color: fillC
                            }),
                            text: new Text({
                                font: '12px 微软雅黑',
                                text: label ? label : ''
                            })
                        })
                    },
                    name: '当前图层',
                    id: 'curLayer'
                });
                this.backL = new VectorLayer({
                    source: new VectorSource(),
                    style: (f, r) => {
                        let strokeC = '#f6f6f6';
                        let strokeW = 1;
                        if (this.level == '1') {
                            strokeC = '#373892';
                            strokeW = 2
                        } else if (this.level == '2') {
                            strokeC = '#f9ba84';
                            strokeW = 2
                        } else if (this.level == '3') {
                            strokeC = '#6daaf9';
                            strokeW = 2
                        }
                        strokeC = '#373892';
                        strokeW = 3
                        return new Style({
                            stroke: new Stroke({
                                color: strokeC,
                                width: strokeW
                            }),
                            fill: new Fill({
                                color: 'rgba(0,0,0,0)'
                            })
                        })
                    }
                });
                /** 创建Map 实例对象 */
                this.map = new Map({
                    /** 地图容器 */
                    target: mapcontainer,
                    /** 地图控件 */
                    controls: defaultControls({
                        attribution: false,
                        zoom: false
                    }).extend(
                        []
                    ),
                    interactions: defaultInteractions({
                        doubleClickZoom: false,
                        // mouseWheelZoom: false,
                        shiftDragZoom: false,
                        // dragPan: false,
                        altShiftDragRotate: false,
                        pinchRotate: false, // 禁用手指进行旋转, 针对触摸屏
                        // pinchZoom: false // 手指进行缩放, 针对触摸屏 
                    }),
                    /** 图层 */
                    layers: [
                        dzL,
                        this.worldL,
                        this.proL,
                        this.cityL,
                        this.countyL,
                        this.chinaL,
                        this.backL,
                        this.curL,
                        this.gpsL
                    ],
                    view: this.view
                });
                /** 单击事件, 通过state 来控制事件, 避免事件重复触发执行 */
                this.map.on('click', evt => {
                    if (this.state == 'pending') {
                        return
                    }
                    if (this.level == '1' || this.level == '4') return

                    this.identify(evt)
                });

                this.view.on('change:resolution', e => {
                    if (this.state) return
                    let res = e.target.getResolution()
                    this.res.forEach((item, index) => {
                        if (res > item.minres && res < item.maxres && parseInt(this.level) != index + 1) {
                            this.level = (index + 1).toString()
                            if (this.level == '1') {
                                this.world_btn.classList.add('activebtn')
                                this.china_btn.classList.remove('activebtn')
                                this.province_btn.classList.remove('activebtn')
                                this.city_btn.classList.remove('activebtn')
                            } else if (this.level == '2') {
                                this.world_btn.classList.remove('activebtn')
                                this.china_btn.classList.add('activebtn')
                                this.province_btn.classList.remove('activebtn')
                                this.city_btn.classList.remove('activebtn')
                            } else if (this.level == '3') {
                                this.world_btn.classList.remove('activebtn')
                                this.china_btn.classList.remove('activebtn')
                                this.province_btn.classList.add('activebtn')
                                this.city_btn.classList.remove('activebtn')
                            } else if (this.level == '4') {
                                this.world_btn.classList.remove('activebtn')
                                this.china_btn.classList.remove('activebtn')
                                this.province_btn.classList.remove('activebtn')
                                this.city_btn.classList.add('activebtn')
                            }
                        }
                    })
                });
                window.map = this.map;
                /** 设置图层 */
                this.china_btn.click();
                /** 地图自适应??? */
                this.map.updateSize()
            }
        },
        
        destroyed() {
            console.log(this.timer);
            clearInterval(this.timer);
        }
    }
</script>
<style lang="less">
    @import '../../../common/uni-nvue.css';

    #map-container {
        width: 100%;
        height: 100%;
        position: relative;
        padding: 0;

        #map {
            width: 100%;
            height: 100%;
        }

        // 右上角 层级按钮
        .activebtn {
            background-color: #00a0e8 !important;
            color: #fff;
        }

        .map-tool {
            position: absolute;
            bottom: 80rpx;
            right: 10rpx;
            z-index: 1;

            view {

                view {
                    width: 84rpx !important;
                    height: 48rpx !important;
                    line-height: 48rpx;
                    font-size: 24rpx;
                    text-align: center;
                    border: 1px solid #fff;
                    background-color: #ccc;
                }
            }
        }

        .uni-tip {
            width: 660rpx;
            padding: 30rpx 20rpx;
            background: #fff;
            box-sizing: border-box;
            border-radius: 20rpx;

            .uni-tip-title {
                color: #333;
                text-align: center;
                font-weight: bold;
                font-size: 32rpx;
            }

            .uni-tip-content {
                padding: 30rpx;
                color: #666;
                font-size: 28rpx;
                text-align: center;
            }

            .uni-tip-group-button {
                display: flex;
                margin-top: 20rpx;

                .uni-tip-button {
                    width: 100%;
                    color: #3b4144;
                    text-align: center;
                    font-size: 28rpx;
                    font-weight: 600;
                }

                view:nth-child(2) {
                    color: #dc1110;
                }
            }
        }
    }
</style>
