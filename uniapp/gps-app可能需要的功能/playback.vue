<template>
    <view class="mapBox uni-container">
        <view class="progress">
            <progress :percent="percent" activeColor="#dc1110" :border-radius="5" active active-mode="forwards"
                stroke-width="10" :show-info="true" />
        </view>

        <view class="pb-speed-container" style="margin-left: 20rpx;">
            <text @click="toggle_speed">{{playbackSpeedLabel}}</text>
            <view class="pb-speed-list" v-show="show_pbSpeed_list">
                <text v-for="(item, index) in playbackXSpeedList" :key="index" @tap="select_speed(item)">{{item.label}}</text>
            </view>
        </view>
        <view class="icons-container" @tap="show_condition = true">
            <view hover-class="hoverStyle">
                <image src="@/static/tstati/option.png" mode="aspectFit" style=""></image>
            </view>
        </view>

        <!-- 条件选择弹框 -->
        <uni-popup class="fullscreen-popup" :show="show_condition" type="center" :custom="true" :mask-click="false">
            <view class="uni-tip uni-tip-fullscreen">
                <view class="uni-tip-title">
                    <image src="@/static/tstati/option.png" mode="aspectFit" style="width: 24px; height: 24px;"></image>
                    <view>条件选择</view>
                </view>
                <view class="uni-tip-content" style="padding: 10rpx;"></view>
                <view style="padding: 20rpx; text-align: center;">
                    <uni-combox label="选择国家:" :placeholder="selectedCountryName? selectedCountryName : '请选择国家'" :value="selectedCountryName"
                        @sendValue="selectedCountry" v-model="selectedCountryName" codeType="tlt_have_truck_country"
                        :s_id="refs[0]" :ref="refs[0]"></uni-combox>
                    <!-- <view style="position: static; overflow: hidden; padding: 0; height: 112rpx;" @click.prevent="isClick" -->
                    <!-- :class="isCanUse ? 'canUse' : 'uCanUse'"> -->
                    <view style="position: static; overflow: hidden; padding: 0; height: 112rpx;" @click.prevent="isClick"
                        v-if="isCanUse">
                        <uni-combox label="选择地区:" :placeholder="selectedDist" style="float: left; z-index: 0; width: 100%;"
                            :disabled="disabled" v-model="selectedDist">
                        </uni-combox>
                    </view>

                    <uni-combox label="所属组织:" :placeholder="selectedoOganizationName? selectedoOganizationName : '请选择所属组织'"
                        :s_id="refs[1]" :value="selectedoOganizationName" @sendValue="selectedOganization" v-model="selectedoOganizationName"
                        codeType="tlt_organization" :ref="refs[1]"></uni-combox>

                    <uni-combox label="整车编号:" :placeholder="selectedVehicleIDName? selectedVehicleIDName : '请选择整车编号'"
                        :s_id="refs[2]" :value="selectedVehicleIDName" :region_code="region_code" @sendValue="selectedVehicleID"
                        v-model="selectedVehicleIDName" codeType="tlt_vehicle_in_region" :uid="selectedoOganizationValue"
                        :ref="refs[2]"></uni-combox>

                    <view style="border-bottom: 1px solid #ccc; height: 64rpx; line-height: 64rpx; display: flex; font-size: 30rpx; padding: 20rpx 0;">
                        <text>选择日期:</text>
                        <text style="flex: 1; color: #848b9a;" @tap="dateIcon_click">{{queryParam.select_key.start_time? `${queryParam.select_key.start_time} - ${queryParam.select_key.stop_time}` : '请选择日期'}}</text>
                    </view>
                </view>

                <view class="uni-tip-group-button" style="margin-top: 30px;">
                    <view class="uni-tip-button" @click="cancel_condition()">取消</view>
                    <view class="uni-tip-button" @click="confirm_condition()">确定</view>
                </view>

                <mx-date-picker :show="showDateModal" type="rangetime" :show-tips="true" :show-seconds="true" @confirm="onSelected"
                    @cancel="showDateModal=false" />

                <uni-popup :show="isShow" type="bottom" mode="fixed" msg="选择收货地址" @hidePopup="togglePopup('')">
                    <semp-city @confirmSelect="onCityClick" @cancelSelect="cancelSelectedDist"></semp-city>
                </uni-popup>
            </view>
        </uni-popup>
        <view id="map" ref="rootmap" name="olmap" class="mapBox" :gpsListJson="gpsListJson" :change:gpsListJson="mapBox.getGpsList"
            :playbackSpeedValue="playbackSpeedValue" :change:playbackSpeedValue="mapBox.getPlayBackSpeedValue">
            <view class="playBack_listBox" ref="propList">
                <!-- <ul>
                    <li>总时长：{{total_time}}</li>
                    <li>总里程：{{total_mileage}}</li>
                    <li>车辆型号：{{veh_model === '201'? 'SKT90' : 'PX90' }}</li>
                    <li>当前日期：{{nowTime | momentDate}}</li>
                    <li>当前时间：{{nowTime | momentTime}}</li>
                    <li>当前里程：{{mileage}}公里</li>
                    <li>当前速度：{{Vspeed}}km/h</li>
                </ul> -->
            </view>
        </view>
        <view id="popup" class="ol-popup popup">
            <a href="#" id="popup-closer" class="ol-popup-closer popup-closer" tap="closerClick()"></a>
            <view class="popup-content" ref="popupContent" style="color: #19be6b; font-size: 24rpx;"></view>
        </view>
    </view>
</template>

<script>
    // 图标
    import uniIcons from '@/components/uni-icons/uni-icons.vue'

    // popup 弹出层
    import uniPopup from "@/components/uni-popup/uni-popup.vue"
    // 类似于下拉框
    import uniCombox from "@/components/uni-combox/uni-combox"
    // 省市县
    import sempCity from "@/components/semp-city/semp-city/semp-city.vue"

    // 日期
    import MxDatePicker from "@/components/mx-datepicker/mx-datepicker.vue";
    import dyDatePicker from '@/components/dy-Date/dy-Date.vue'
    import mixin from '@/common/mixin.js'
    export default {
        components: {
            uniIcons,
            uniPopup,
            uniCombox,
            sempCity,
            MxDatePicker,
            dyDatePicker
        },
        mixins: [mixin],
        data() {
            return {
                show_pbSpeed_list: false,
                gpsListJson: [],
                percent: 0,
                show_condition: false, // 控制条件选择框的显示隐藏
                queryParam: {
                    select_key: {
                        region_code: '',
                        start_time: '',
                        /** 开始日期 */
                        stop_time: '',
                        /** 结束日期 */
                        district_uid: '',
                        /** 地区UID */
                        vehicle_uid: '' /** 车辆UID */
                    }
                },
                /** 播放倍速配置项 */
                playbackXSpeedList: [
                    {
                        value: 1,
                        label: '1倍速'
                    },
                    {
                        value: 10,
                        label: '10倍速'
                    },
                    {
                        value: 20,
                        label: '20倍速'
                    },
                    {
                        value: 50,
                        label: '50倍速'
                    },
                    {
                        value: 100,
                        label: '100倍速'
                    }
                ],
                playbackSpeedValue: 1,
                playbackSpeedLabel: '1倍速',
                // == 以下为选择地区依赖的数据
                isCanUse: false, // 控制选择地区样式背景: 灰色(禁用) / 白色(启用)
                disabled: true, // 控制选择地区禁用/启用
                refs: ['combox1', 'combox2', 'combox3'],
                /** 选择国家 选中的代码集name / value */
                selectedCountryName: '',
                selectedCountryValue: '',
                /** 选择地区文字展示 */
                selectedDist: '请选择地区',
                /** 选择地区 依赖的属性值 */
                region_code: '', // 地区编码
                provinceName: '', // 省name
                provinceValue: '', // 省code
                cityName: '', // 市name
                cityValue: '', // 市code
                countyName: '', // 县name
                countyValue: '', // 县code
                // 控制选择地区 popup 弹框的显示 / 隐藏
                isShow: false,
                // == 以下为选中组织机构弹框依赖的数据
                /** 选择所属组织 选中的代码集的name / value */
                selectedoOganizationName: '',
                selectedoOganizationValue: '',
                // == 以下为选中整车编号弹框依赖的数据
                /** 选择整车编号 选中的代码集的name / value */
                selectedVehicleIDName: '',
                selectedVehicleIDValue: '',
                // ==>以下为选择日期期间依赖的数据
                showDateModal: false, // 控制日期选择弹框的显示/隐藏
                startDate: '',
                endDate: '',
                start_time: '',
                stop_time: '',
                value: '',
                rangetime: ['2019/01/08 14:00', '2019/01/16 13:59']
            }
        },
        methods: {
            select_speed(item) {
                console.log(item)
                this.playbackSpeedValue = item.value
                this.playbackSpeedLabel = item.label
                this.show_pbSpeed_list = false
            },
            toggle_speed() {
                this.show_pbSpeed_list = !this.show_pbSpeed_list
            },
            cancel_condition() {
                this.show_condition = false

                this.startDate = '';
                this.endDate = '';
                this.queryParam.select_key.start_time = '';
                this.queryParam.select_key.stop_time = '';
                this.stop_time = '';
                // 设置地区选择禁用
                this.isCanUse = false;
                this.disabled = true;
                this.selectedDist = '请选择地区';
                /** 以下: 清空重置选择地区 属性值 */
                this.region_code = '';
                this.selectedCountryValue = '';
                this.selectedCountryName = '';
                this.provinceName = '';
                this.provinceValue = '';
                this.cityName = '';
                this.cityValue = '';
                this.countyName = '';
                this.countyValue = '';

                // 清空 选择的组织机构 依赖的数据
                this.selectedoOganizationName = '';
                this.selectedoOganizationValue = '';
                /** 清空 选择车辆编号依赖的数据 */
                this.selectedVehicleIDName = '';
                this.selectedVehicleIDValue = '';
            },
            confirm_condition() {
                this.search()
            },
            // 选择日期/时间 图标上绑定的点击事件
            dateIcon_click() {
                this.showDateModal = true;
                uni.showLoading()

                this.value = this.rangetime;
                this.showDateModal = true;
                let timer = setTimeout(() => {
                    uni.hideLoading();
                    clearTimeout(timer)
                }, 1200)
            },
            onSelected(e) {
                if (e) {
                    console.log(e.value)
                    this.rangetime = e.value;
                    let time = e.value + '';
                    this.startDate = new Date(time.split(',')[0]).getTime();
                    this.endDate = new Date(time.split(',')[1]).getTime();
                    if (this.startDate && this.endDate) {
                        if ((this.endDate - this.startDate) / 86400000 > 1) {
                            uni.showToast({
                                title: '间隔时间不能超过1天, 请重新选择',
                                icon: 'none'
                            })

                        } else {
                            let time1 = time.split(',')[0] + ''
                            let time2 = time.split(',')[1] + ''
                            this.queryParam.select_key.start_time = time1.replace(/-+|\s|:|\/+/g, '')
                            this.queryParam.select_key.stop_time = time2.replace(/-+|\s|:|\/+/g, '')

                            this.showDateModal = false;
                        }
                    }
                }
            },
            search() {
                this.btnDisable = true

                if (!this.queryParam.select_key.start_time || !this.queryParam.select_key.stop_time) {
                    uni.showToast({
                        title: '请选择要查询的日期期间',
                        icon: 'none'
                    })
                    this.btnDisable = false
                    return
                }

                if (!this.selectedVehicleIDValue) {
                    uni.showToast({
                        title: '请选择要查询的车辆',
                        icon: 'none'
                    })
                    this.btnDisable = false
                    return
                }
                /** 播放速度 */
                this.mapTimerTime = 12000 / this.speed;
                /** 每次进行查询操作, 重置进度条 */
                this.percent = 0;

                uni.request({
                    url: `${this.api}txngpspb2.ajson`,
                    data: {
                        ...this.queryParam
                    },
                    method: 'POST',
                    dataType: 'json',
                    success: (res) => {
                        if (res.data.error_code === '000000') {
                            // this.$refs.propList.style.display = 'block';
                            /** 隐藏form表单 */
                            // this.$refs['queryParam.select_key'].$el.style.display = 'none';
                            /** 设置下面两个盒子 高度 */
                            // document.querySelector('.top').style.height = '60px';
                            // document.querySelector('#map').style.height = 'calc(100% - 60px)';
                            // this.searchLock = 1;
                            /** 将 gpsList的 第一条数据的经纬度 放入到 location 数组中, 表示该辆车 第一个点的坐标 */
                            this.gpsListJson = JSON.parse(res.data.gpsList);
                        } else {
                            this.toastRequestErr(res.data)
                        }
                    },
                    fail: (err) => {
                        this.toastErr()
                    }
                })

                this.show_condition = false
            },
            /** 选择地区 */
            isClick(e) {
                if (this.selectedCountryValue && this.selectedCountryValue == '156') {
                    this.isShow = true
                    uni.hideKeyboard()
                }
            },
            /** 三级联动 确定按钮 注册的 确定选择事件 */
            onCityClick(e) {
                this.selectedDist = ''
                this.provinceName = e.province.label;
                this.provinceValue = e.province.value;
                this.cityName = e.city.label;
                this.cityValue = e.city.value;
                this.countyName = e.county.label;
                this.countyValue = e.county.value;
                // this.townName = e.town.label;
                if (this.provinceName) {
                    this.selectedDist = this.provinceName
                }
                if (this.cityName) {
                    this.selectedDist = this.provinceName + '-' + this.cityName
                }
                if (this.countyName) {
                    this.selectedDist = this.provinceName + '-' + this.cityName + '-' + this.countyName
                }

                /** 清空 选择车辆编号依赖的数据 */
                this.selectedVehicleIDName = '';
                this.selectedVehicleIDValue = '';
                console.log(this.selectedDist)
                this.togglePopup()
            },
            /** 三级联动 取消按钮 注册的 取消选择事件 */
            cancelSelectedDist(e) {
                this.togglePopup()
                this.provinceName = e.province.label;
                this.provinceValue = e.province.value;
                this.cityName = e.city.label;
                this.cityValue = e.city.value;
                this.countyName = e.county.label;
                this.countyValue = e.county.value;
                this.selectedDist = '请选择地区'
            },
            /** 关闭popup 弹框 */
            togglePopup() {
                this.isShow = false

                if (this.countyValue) {
                    this.region_code = this.countyValue
                } else if (!this.countyValue && this.cityValue) {
                    this.region_code = this.cityValue
                } else if (!this.cityValue && this.provinceValue) {
                    this.region_code = this.provinceValue
                } else if (!this.provinceValue && this.selectedCountryValue) {
                    this.region_code = this.selectedCountryValue
                }
            },
            /** 选中的 国家 value */
            selectedCountry(value) {
                this.selectedCountryValue = value
                this.region_code = value
                /** 清空 选择车辆编号依赖的数据 */
                this.selectedVehicleIDName = '';
                this.selectedVehicleIDValue = '';
                // 选择的是中国, 设置地区选择可用
                if (this.selectedCountryValue && this.selectedCountryValue == '156') {
                    this.isCanUse = true;
                    this.disabled = false
                } else {
                    // 选择的不是中国, 设置地区选择不可用
                    this.isCanUse = false;
                    this.disabled = true
                    this.provinceName = '';
                    this.provinceValue = '';
                    this.cityName = '';
                    this.cityValue = '';
                    this.countyName = '';
                    this.countyValue = '';
                    this.selectedDist = '请选择地区'
                }
            },
            /** 选中的 组织value: 赋值选择的组织value */
            selectedOganization(value) {
                this.selectedoOganizationValue = value

                /** 清空 选择车辆编号依赖的数据 */
                this.selectedVehicleIDName = '';
                this.selectedVehicleIDValue = '';
            },
            /** 选中的整车编号 value */
            selectedVehicleID(value) {
                // 赋值选择的车辆编号value
                this.selectedVehicleIDValue = value
                this.queryParam.select_key.vehicle_uid = value
            }
        },
        onLoad() {
            /** 监听 下拉框组件 注册的全局自定义事件 */
            uni.$on('comBoxToggle', (data) => {
                for (let k in this.$refs) {
                    if (k != data.data) {
                        this.$refs[k].showSelector = false
                    }
                }
            })
        }
    }
</script>
<script lang="renderjs" module="mapBox">
    import '@/components/ol/ol.css'
    import {
        Map,
        View
    } from '@/components/ol'

    // 绘制点和线
    import Point from '@/components/ol/geom/Point';
    import LineString from '@/components/ol/geom/LineString'
    import {
        Tile as TileLayer,
        Vector as VectorLayer
    } from '@/components/ol/layer';

    import {
        defaults as defaultControls,
        ZoomToExtent,
        MousePosition
    } from '@/components/ol/control.js'
    import VectorSource from '@/components/ol/source/Vector'
    import XYZ from "@/components/ol/source/XYZ";
    import Feature from '@/components/ol/Feature'
    import Overlay from '@/components/ol/Overlay';

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
    
    // import carUrl from '@/static/gps/car.png'
    export default {
        watch: {
            playbackSpeed: function(newV, oldV) {
                this.scaleValue = newV / oldV;
            }
        },
        data() {
            let startIconUrl = require('./marker-start.png');
            let endIconUrl = require('./marker-end.png');
            let carUrl = require('@/static/gps/car.png');
            return {
                /** icon图标 */
                startIconUrl,
                endIconUrl,
                carUrl: carUrl,
                container: null,
                content: null,
                closer: null,
                myRoute: '',
                /** 绘制路线 */
                vectorLayer: '',
                routeFeature: '',
                /** 路线图层 */
                startMarker: '',
                /** 开始位置 marker */
                endMarker: '',
                /** 结束位置 marker */
                geoMarker: '',
                /** 播放时 车图标 */
                overlay: '',
                styles: '',
                animating: false,
                speed: 1 / 12, /** 播放倍速 */
                now: '',
                center: [],  /** 中心点坐标 */
                searchLock: 0,
                lock: 0,
                playbackSpeed: 1,
                speedChange: false, /** 标识播放倍速 是否改变过 */
                scaleValue: 1,  /** 切换倍速的比例 */

                geoserverUrl: 'http://geoserver.tlsk.com.cn/geoserver/',
                map: null,
                view: null,
                /** 层级 */
                zoom: 6,
                /** 最小层级 */
                minZoom: 3,
                /** 绘制线 依赖的 经纬度 二维数组 [[51.505,-0.09],[52,-1],[51,-0.05],[51.3,-0.06]] */
                latlngs: [],
                // lat: '',
                // lng: '',
                routeCoords: '',
                routeLength: '',
                /** 最大/小 经/纬度 */
                lngMax: '',
                lngMin: '',
                latMin: '',
                latMax: '',

                mapTimerTime: 12000,
                /** 地图刷新定时器毫秒数默认12秒 */
                percent: 0,
                /** 控制进度条的进度 */
                elapsedTime: 0,
                /** 经过的时间, 可能是暂停之后, 再次播放时 到目前为止 之间播放的时间 */
                saveElapsedTime: 0,
                /** 保存经过的时间(从第一次开始播放 到 目前 所播放的时间) */

                index: 0,

                veh_uid: '',
                /** 查询一辆车轨迹回放,返回的标识 */
                total_time: '',
                /** 返回的总时长 */
                total_mileage: '',
                /** 返回的总里程 */
                veh_model: '',
                /** 查询一辆车轨迹回放, 返回的车辆型号 */

                Vspeed: '',
                /** 速度 */
                nowTime: '',
                /** 时间 */
                mileage: '',
                /** 里程 */
                height: '',
                /** 高度 */
                gpsList: []
            }
        },
        filters: {
            momentDate: function(value) {
                let str1 = value.slice(0, 4);
                let str2 = value.slice(4, 6);
                let str3 = value.slice(6, 8);
                return str1 + '/' + str2 + '/' + str3
            },
            momentTime: function(value) {
                let str4 = value.slice(8, 10);
                let str5 = value.slice(10, 12);
                let str6 = value.slice(12, 14);
                return str4 + ': ' + str5 + ': ' + str6
            }
        },
        onLoad() {
            console.log('3333333333333333')
            this.$nextTick(() => {
                this.initMap()
            })
        },
        mounted() {
            this.$nextTick(() => {
                console.log('22222222222')
                this.container = document.querySelector(".popup");
                this.content = document.querySelector(".popup-content");
                this.closer = document.querySelector(".popup-closer");
                this.initMap()
            })
        },
        beforeDestroy() {
            this.resetParam()
        },
        methods: {
            getPlayBackSpeedValue(newValue, oldValue, ownerInstance, instance) {
                console.log('oooooooooooooooooo', newValue)
                this.playbackSpeed = newValue
                this.onChangeSelect()
               
            },
            getGpsList(newValue, oldValue, ownerInstance, instance) {
                console.log('nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn', newValue)
                if (newValue.vehiclePlaybackList.length) {
                    console.log('mmmmmmmmmmmmmmmmmmmm')
                    this.searchLock = 1
                    this.lock = 1
                    this.getGpsJson()
                }
            },
            initMap() {
                /** 地图容器 */
                let mapcontainer = document.querySelector("#map")
                this.view = new View({
                    center: [102.16157190000001, 30.2707431],
                    projection: 'EPSG:4326',
                    zoom: 3.5,
                    minZoom: 3.2,
                    maxZoom: 20
                });

                let googleMapLayer = new TileLayer({
                    source: new XYZ({
                        url: 'http://mt2.google.cn/vt/lyrs=y&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=G'
                    })
                });

                this.overlay = new Overlay({
                    element: this.container,
                    autoPan: true,
                    autoPanAnimation: {
                        duration: 250
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
                    }).extend([]),
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
                        googleMapLayer
                    ],
                    overlays: [this.overlay],
                    view: this.view
                });
                window.map = this.map;

                console.log('55555555555555', this.map)
                /** 地图自适应??? */
                this.map.updateSize()
            },
            /** 关闭 popup弹框 */
            closerClick() {
                this.overlay.setPosition(undefined);
                this.closer.blur();
                return false
            },

            moveFeature(event) {
                let vectorContext = event.vectorContext;
                let frameState = event.frameState;
                var elapsedTime = '';
                if (this.animating) {
                    this.elapsedTime = frameState.time - this.now;
                    /**  此处逻辑较为复杂:
                     *    因为 该实现的原理 是通过控制 播放过的时间 (默认是 一秒 经过一个 坐标点, 项目是 12 秒 得到一次坐标点, 所以, 对 speed/12, 即: 12秒经过一个点)
                     *    index 表示 当前播放到 第几个点, 通过 speed * 经过的时间 / 1000 得到播放到第几个 坐标点
                     *    当暂停时:
                     *      - 为了能够 从上一个播放位置 继续开始播放, 要保存经过的时间, 这样, 暂停之后 再次播放时, 加上暂停时保存的 时间, 计算所得到的 index 就是继续上一次播放的坐标点
                     *    当 播放倍速切换时:
                     *      - 更改 speed: speed * 倍速, 设置播放倍速切换了的标识: speedChange, 设置播放倍速前后之比: scaleValue
                     *      - 比较复杂: 逻辑分析
                     *        1. 当更改倍速后: 例如: 之前1倍速时, 12秒经过一个坐标点, 如果变为10倍速: 那么1.2秒经过一个坐标点, 此时, 之前1倍速所经过的时间, 10倍速只需0.1倍的时间
                     *        2. 因此, 需要在切换倍速时, 同样暂停一下, 保存之前倍速经过的时间
                     *        3. 当切换完倍速再次进行播放时, 经过的时间需要进行处理:
                     *          用再次播放时经过的时间 + 之前倍速经过的时间 / 倍速切换之比 得到转换为10倍速 播放时 需要多长时间 播放到当前点, 以此得到 index, 以便能够从上一个点开始 继续播放
                     * */
                    if (this.speedChange) {
                        // elapsedTime = elapsedTime / this.playbackSpeed
                        elapsedTime = this.elapsedTime + this.saveElapsedTime / this.scaleValue;
                    } else {
                        elapsedTime = this.elapsedTime + this.saveElapsedTime;
                    }
                    /** index: 表示当前 播放到第几个 坐标点 - 通过 speed * 经过的时间 / 1000 得到 */
                    this.index = Math.floor(this.speed * elapsedTime / 1000);

                    if (this.index >= this.routeLength - 1) { //当时间间隔大于所有点的长度的时候，结束动作
                        // this.percent = 100;
                        this.stopAnimation(true);
                        return;
                    } else {
                        let scale = Math.floor(this.speed * elapsedTime / 10) - this.index * 100; //线段长度的比例
                        let currentPoint;
                        let startpoint = this.routeCoords[this.index]; // 上一个点
                        let stoppoint = this.routeCoords[this.index + 1]; // 下一个点
                        let currentx = startpoint[0] + 0.01 * scale * (stoppoint[0] - startpoint[0]);
                        let currenty = startpoint[1] + 0.01 * scale * (stoppoint[1] - startpoint[1]);
                        currentPoint = new Point([currentx, currenty]);

                        let feature = new Feature(currentPoint);

                        // 设置 popup弹框文字内容
                        this.overlay.setPosition([currentx, currenty]);
                        document.querySelector('.popup-content').innerHTML =
                            `<p>经度: ${this.routeCoords[this.index][0]}; 纬度: ${this.routeCoords[this.index][1]}</p>`;

                        // 为避免 全屏非全屏切换时, 导致弹框位置出现异常, 调用map.updateSize()
                        this.map.updateSize();
                        // vectorContext.drawFeature(feature, this.styles.geoMarker);// 这里的style请用自己定义的点的style替换

                        // this.percent = Math.floor((this.index / this.gpsList.vehiclePlaybackList.length) * 100);
                        /** 设置右下角 自定义控件 的 时间 / 速度 / 里程 */
                        this.nowTime = this.gpsList.vehiclePlaybackList[this.index].datetime;
                        /** 时间 */
                        this.Vspeed = (this.gpsList.vehiclePlaybackList[this.index].speed + '').slice(0, 5) / 10;
                        /** 速度 */
                        this.mileage = (this.gpsList.vehiclePlaybackList[this.index].sum_mileage) / 1000; /** 总里程 */
                        // this.lng = this.gpsList.vehiclePlaybackList[this.index].longitude
                        // this.lat = this.gpsList.vehiclePlaybackList[this.index].latitude
                        /** 设置车 行驶方向与 路线方向保持一致 */
                        if (this.routeCoords[this.index] && this.routeCoords[this.index + 1]) {
                            let dx = this.routeCoords[this.index][0] - this.routeCoords[this.index + 1][0];
                            let dy = this.routeCoords[this.index][1] - this.routeCoords[this.index + 1][1];

                            // 计算弧度: 应为 openlayers中 rotation: 属性使用: 弧度
                            let rotation = Math.atan2(dy, dx);
                            if (rotation !== this.rotation) {
                                if (dx !== 0 || dy !== 0) {
                                    if (-rotation < 0) {
                                        this.rotation = -rotation + Math.PI / 2 * 3
                                    } else {
                                        this.rotation = -rotation - Math.PI / 2
                                    }
                                }
                            }
                            this.styles.geoMarker = new Style({
                                // image: new Icon({
                                //     anchor: [0.5, 0.5],
                                //     src: this.carUrl,
                                //     rotateWithView: false,
                                //     rotation: this.rotation, // 使用弧度值
                                //     scale: 0.1,
                                // })
                                image: new CircleStyle({
                                    radius: 12,
                                    /** 聚合图标 圆圈的填充颜色 */
                                    fill: new Fill({
                                        color: '#fff'
                                    }),
                                    /** 圆圈 线的颜色 */
                                    stroke: new Stroke({
                                        color: '#ff9900',
                                        width: 3
                                    })
                                }),
                                /** 聚合图标 文字配置 */
                                text: new Text({
                                    font: '12px 微软雅黑',
                                    text: '车',
                                    fill: new Fill({
                                        color: '#ff9900'
                                    })
                                })
                            })
                        }
                        vectorContext.drawFeature(feature, this.styles.geoMarker)
                    }
                }
                this.map.render();
            },
            startAnimation() {
                plus.nativeUI.closeWaiting()
                if (this.searchLock === 0) {
                    plus.nativeUI.toast("请先查询要回放的车辆, 在进行轨迹回放操作");
                    return;
                }
                this.lock = 1;
                /** 根据 锁: lock的状态 来执行后续操作 */
                // if (this.percent === 100) {
                //     this.$Modal.confirm({
                //         title: "提示",
                //         content: "当前轨迹回放已经播放完毕, 要重新播放吗?",
                //         onOk: () => {
                //             this.index = 0;
                //             this.percent = 0;
                //             /** 暂停按钮显示 播放按钮隐藏 */
                //             let pauseBtn = document.querySelector(".pause"); // 暂停按钮
                //             pauseBtn.style.display = "block";
                //             let startBtn = document.querySelector(".start"); // 播放按钮
                //             startBtn.style.display = "none";
                //             setTimeout(() => {
                //                 this.playBack()
                //             }, 200)
                //         }
                //     });
                //     return;
                // }

                if (this.gpsList.length === 0) {
                    plus.nativeUI.toast("当前查询操作没有查询到相关数据");
                    return;
                }
                plus.nativeUI.toast("开始进行轨迹回放")

                /** 播放按钮显示 暂停按钮隐藏 */
                // let pauseBtn = document.querySelector(".pause"); // 暂停按钮
                // pauseBtn.style.display = "block";
                // let startBtn = document.querySelector(".start"); // 播放按钮
                // startBtn.style.display = "none";

                /** 延迟调用, 不然会报错, 原因, 可能结构没渲染好, 导致调用某个方法时出问题 */
                setTimeout(() => {
                    this.playBack()
                }, 200)
            },
            playBack() {
                if (this.animating) {
                    this.stopAnimation(false);
                } else {
                    this.animating = true;
                    this.now = new Date().getTime();
                    // 隐藏 geoMarker
                    this.geoMarker.setStyle(null);
                    // just in case you pan somewhere else
                    // this.vectorLayer.on('postrender', this.moveFeature)
                    this.map.on('postcompose', this.moveFeature);
                    this.map.render(); //告诉OpenLayers继续postcompose渲染动画
                }
            },
            /** 暂停按钮 */
            pause() {
                /** 切换 播放/暂停 按钮的 显示/隐藏 */
                let pauseBtn = document.querySelector(".pause");
                pauseBtn.style.display = "none";
                let startBtn = document.querySelector(".start");
                startBtn.style.display = "block";
                plus.nativeUI.closeWaiting()
                plus.nativeUI.toast(`暂停播放`);
                /** 设置 lock = 0, 标识处于暂停播放状态 */
                this.lock = 0;

                /** 判断一下 播放倍速 是否改变 */
                /** index: 是当前播放倍速 * 当前倍速下播放过的时间  / 1000
                 *  内置动画 默认 1倍速 就是1 秒, 数据返回的是12秒一次, 所以. 实际项目中的 1倍速 是  1/12 倍的 speed
                 *      当倍速 改变时, 如果变为原来的 10 倍, 原来是1倍, 1倍情况下, 10秒 经过10个坐标点, 那么10倍播放速度, 1秒就播放10个坐标点, 所以对 改变倍速前的 时间进行处理
                 * */
                if (this.speedChange) {
                    this.saveElapsedTime = this.elapsedTime + this.saveElapsedTime / this.scaleValue;
                } else {
                    this.saveElapsedTime = this.elapsedTime + this.saveElapsedTime;
                }

                this.animating = false; // - 控制 暂停动画

                this.speedChange = false;
            },
            stopAnimation(ended) {
                // let pauseBtn = document.querySelector(".pause");
                // pauseBtn.style.display = "none";
                // let startBtn = document.querySelector(".start");
                // startBtn.style.display = "block";
                plus.nativeUI.toast(`播放轨迹结束`);
                this.lock = 0;

                this.animating = false;
                this.elapsedTime = 0;
                this.saveElapsedTime = 0;
                // if animation cancelled set the marker at the beginning
                let coord = ended ? this.routeCoords[this.routeLength - 1] : this.routeCoords[0];
                let geometry = this.geoMarker.getGeometry();
                geometry.setCoordinates(coord);
                //remove listener
                this.map.un('postcompose', this.moveFeature);
            },

            /** 切换菜单图标按钮 上绑定的点击事件 */
            // shrink() {
            //     let FormBox = document.getElementsByClassName('Form_sub')[0].style.display;
            //     let topBox = document.querySelector('.top');
            //     let map = document.querySelector('#map ');
            //     if (FormBox === 'none') {
            //         this.$refs['queryParam.select_key'].$el.style.display = 'block';
            //         topBox.style.height = '120px';
            //         map.style.height = "calc(100% - 120px)"
            //     } else {
            //         this.$refs['queryParam.select_key'].$el.style.display = 'none';
            //         topBox.style.height = '60px';
            //         map.style.height = "calc(100% - 60px)"
            //     }
            // },

            /** 清空按钮 */
            resetParam(name) {
                /** 设置 锁：lock 为0 */
                this.lock = 0;
                this.searchLock = 0;
                /** 设置 animating 为false */
                this.animating = false;

                /** 重置gpsList, 内部保存的是 返回的 经纬度数据 */
                this.gpsList = [];
                /** 清空绘制的线条 */
                this.latlngs = [];

                /** 重置 index 轨迹回放到第几个点 / 清空定时器  / 隐藏右下角 窗口 */
                this.index = 0;
                this.elapsedTime = 0;
                this.saveElapsedTime = 0;
                this.percent = 0;

                /** 清空之前绘制的 feature */
                this.vectorLayer.getSource().clear();

                /** 关闭popup弹框 */
                this.closerClick();

                /** 暂停按钮显示 播放按钮隐藏 */
                let pauseBtn = document.querySelector('.pause'); // 暂停按钮
                pauseBtn.style.display = 'none';
                let startBtn = document.querySelector('.start'); // 播放按钮
                startBtn.style.display = 'block';
                this.$refs.propList.style.display = 'none'
            },

          
            /** 调用查询一辆车轨迹回放数据的 接口 */
            getGpsJson() {
                this.gpsList = this.gpsListJson
                let that = this;
                plus.nativeUI.showWaiting()

                this.gpsList.vehiclePlaybackList.forEach((item, index) => {
                    if (index > 0 && this.gpsList.vehiclePlaybackList[index].datetime === this.gpsList
                        .vehiclePlaybackList[index - 1].datetime) {
                        this.gpsList.vehiclePlaybackList.splice(index, 1);
                    }
                });

                /** 保存返回的 车辆 uid vehicle_uid , 之后可能会有用 */
                this.veh_uid = this.gpsList.vehicle_id;
                /** 总时长 */
                this.total_time = this.gpsList.total_time;
                /** 总里程 */
                this.total_mileage = this.gpsList.total_mileage;
                /** 车辆型号 */
                this.veh_model = this.gpsList.vehicle_model;

                this.nowTime = this.gpsList.vehiclePlaybackList[0].datetime; /** 时间 */

                /** 起始点: 经纬度坐标 里程 速度 */
                // let lng = this.gpsList.vehiclePlaybackList[0].longitude;
                // let lat = this.gpsList.vehiclePlaybackList[0].latitude;
                /** 里程 */
                this.mileage = (this.gpsList.vehiclePlaybackList[0].sum_mileage) / 1000;
                /** 每条数据中的 高度 */
                this.height = this.gpsList.vehiclePlaybackList[0].height.toFixed(2);
                /** 速度 */
                this.Vspeed = (this.gpsList.vehiclePlaybackList[0].speed + '').slice(0, 5) / 10;

                let lngList = [];
                /** 所有点的经度 */
                let latList = []; /** 所有点的纬度 */

                /** 绘制线 */
                let list = this.gpsList.vehiclePlaybackList;
                for (let j = 0; j < list.length; j++) {
                    this.latlngs.push([list[j].longitude, list[j].latitude]);
                    lngList.push(list[j].longitude);
                    latList.push(list[j].latitude)
                }
                /** 得到中心点坐标 / 求得经度数组 / 维度数组 中的最大最小值, 取平均值 */
                this.lngMax = Math.max(...lngList);
                this.lngMin = Math.min(...lngList);
                this.latMax = Math.max(...latList);
                this.latMin = Math.min(...latList);
                /** 设置中心点坐标 */
                this.map.getView().setCenter([(this.lngMax + this.lngMin) / 2, (this.latMax + this.latMin) /
                    2
                ]);
                this.map.getView().setZoom(15);

                this.routeCoords = this.latlngs;

                console.log('线', this.routeCoords);
                this.myRoute = new LineString(this.routeCoords);
                this.routeLength = this.routeCoords.length;

                this.routeFeature = new Feature({
                    type: 'route',
                    geometry: this.myRoute
                });

                this.geoMarker = /** @type Feature<import("../src/ol/geom/Point").default> */ (new Feature({
                    type: 'geoMarker',
                    geometry: new Point(this.routeCoords[0])
                }));
         
                /** 开始位置图标 */
                this.startMarker = new Feature({
                    type: 'icon',
                    geometry: new Point(this.routeCoords[0]) /** 开始位置经纬度 */
                });
               
                /** 结束位置图标 */
                this.endMarker = new Feature({
                    type: 'icon',
                    geometry: new Point(this.routeCoords[this.routeLength - 1]) /** 结束位置经纬度 */
                });
                
                this.startMarker.setStyle(new Style({
                    // image: new Icon({
                    //     anchor: [0.5, 1],
                    //     src: this.startIconUrl
                    // })
                    image: new CircleStyle({
                        radius: 12,
                        /** 聚合图标 圆圈的填充颜色 */
                        fill: new Fill({
                            color: '#fff'
                        }),
                        /** 圆圈 线的颜色 */
                        stroke: new Stroke({
                            color: '#19be6b',
                            width: 3
                        })
                    }),
                    /** 聚合图标 文字配置 */
                    text: new Text({
                        font: '12px 微软雅黑',
                        text: '起',
                        fill: new Fill({
                            color: '#19be6b'
                        })
                    })
                }));

                this.endMarker.setStyle(new Style({
                    // image: new Icon({
                    //     anchor: [0.5, 1],
                    //     crossOrigin: 'anonymous',
                    //     src: this.endIconUrl,
                    //     scale: 1.3
                    // })
                    image: new CircleStyle({
                        radius: 12,
                        /** 聚合图标 圆圈的填充颜色 */
                        fill: new Fill({
                            color: '#fff'
                        }),
                        /** 圆圈 线的颜色 */
                        stroke: new Stroke({
                            color: '#ed4014',
                            width: 3
                        })
                    }),
                    /** 聚合图标 文字配置 */
                    text: new Text({
                        font: '12px 微软雅黑',
                        text: '终',
                        fill: new Fill({
                            color: '#ed4014'
                        })
                    })
                }));
                /** atan2() 返回一个 -pi 到 pi 之间的数值, 表示 点(x,y)对应的偏转角度,
                 *  这是一个逆时针角度, 以弧度为单位, 正x轴 和 点(x, y) 与原点连线之间
                 *    第一个参数是 y
                 * */
                this.styles = {
                    'route': new Style({
                        stroke: new Stroke({
                            width: 3,
                            color: [0, 191, 255, 0.8]
                        })
                    }),
                    'geoMarker': new Style({
                        image: new Icon({
                            anchor: [0.5, 0.5],
                            src: this.carUrl,
                            // src: 'https://openlayers.org/en/v4.6.5/examples/data/icon.png',
                            rotateWithView: false,
                            rotation: 0,
                            scale: 0.1,
                        })
                    })
                };

                this.vectorLayer = new VectorLayer({
                    source: new VectorSource({
                        features: [this.routeFeature, this.geoMarker, this.startMarker,
                            this.endMarker
                        ]
                    }),
                    style: function(feature) {
                        // hide geoMarker if animation is active
                        if (that.animating && feature.get('type') === 'geoMarker') {
                            return null;
                        }
                        return that.styles[feature.get('type')];
                    }
                });

                this.map.addLayer(this.vectorLayer);
                /** 调用全局销毁 $Message消息提示的方法 销毁掉上面设置的 显示20秒的 正在加载数据全局消息提示 */
                plus.nativeUI.closeWaiting()
                // /** 设置marker 文字描述opacity 为1 */

                this.startAnimation();
                // this.$refs.propList.style.visibility = 'visible'; /** 显示右下角 数据窗口 */
            },

            /** 改变播放速度 */
            onChangeSelect() {
                console.log('uuuuuuuuuuuuuuuuu', this.lock, this.searchLock)
                /** 如果 searchLock = 0, 说明此时还没有进行查询操作, 不执行后续操作 */
                /** 如果 lock = 0, 说明处于暂停播放状态 */
                if (this.lock === 0 || this.searchLock === 0) {
                    return false
                }

                this.animating = false; // - 设置控制动画播放的 animating 为 false 暂停动画
                if (this.speedChange) {
                    this.saveElapsedTime = this.elapsedTime + this.saveElapsedTime / this.scaleValue;
                } else {
                    this.saveElapsedTime = this.elapsedTime + this.saveElapsedTime;
                }
                console.log(this.saveElapsedTime);
                this.speed = 1 / 12 * this.playbackSpeed; // - 改变播放倍速
                this.speedChange = true; // - 修改 speedChange : true, 标识 播放倍速修改过
                setTimeout(() => {
                    this.playBack() // - 调用动画播放
                }, 100)
            },
        }
    }
</script>

<style lang="less">
    // @import '~@/components/ol/ol.css';
    @import '../../../common/uni-nvue.css';

    .mapBox {
        width: 100%;
        height: 100%;
        padding: 0;

        // .top {
        //     width: 100%;
        //     height: 180rpx;
        //     padding: 60rpx 10rpx 20rpx 30rpx;
        //     box-sizing: border-box;

        .pb-speed-container {
            position: absolute;
            top: 120rpx;
            // width: 130rpx;
            z-index: 999;
            background: #ccc;
            padding: 5rpx;
            font-size: 28rpx;

            .pb-speed-list {
                position: absolute;
                // left: 130rpx;
                background: #fff;
                border-radius: 10rpx;

                text {
                    text-align: center;
                    width: 120rpx;
                    display: block;
                    padding: 5rpx 10rpx;
                    z-index: 999;
                    height: 36rpx;
                    line-height: 36rpx;
                    border-bottom: 1px solid #ccc;
                }
            }
        }

        .icons-container {
            font-size: 28rpx;
            background: #ccc;
            padding: 5rpx;
            position: absolute;
            z-index: 999;
            top: 120rpx;
            right: 40rpx;

            &>view {
                display: inline-block;
                margin-top: 4rpx;

                image {
                    width: 48rpx;
                    height: 46rpx;
                    vertical-align: top;
                }

                text {
                    padding: 0 5rpx;
                    display: inline-block;
                    height: 46rpx;
                    line-height: 46rpx;
                }
            }
        }

        .progress {
            width: 100%;
            padding: 0 10rpx;
            position: absolute;
            z-index: 999;
            top: 60rpx;
        }


        /* 地图容器 */
        #map {
            width: 100%;
            height: 100%;
            // height: ~"calc(100% - 80px)";
            overflow: hidden;
            position: relative;

            .playBack_listBox {
                position: absolute;
                z-index: 999;
                top: 20px;
                left: 20px;
                padding: 20px;
                /* 字体间隔 */
                letter-spacing: 1px;
                width: 220px;
                height: 242px;
                color: #fff;
                font-size: 14px;
                font-weight: 500;
                font-family: 宋体;
                border-radius: 6px;
                background-color: rgba(81, 81, 78, 0.7);
                visibility: hidden;

                ul li {
                    list-style: none;
                    margin-bottom: 8px;
                }
            }
        }

        .ol-popup {
            position: absolute;
            background-color: white;
            -webkit-filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
            filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
            padding: 30rpx;
            border-radius: 10px;
            border: 1px solid #cccccc;
            bottom: 24rpx;
            left: -100rpx;
            min-width: 400rpx;
            opacity: 0.85;
        }

        .ol-popup:after,
        .ol-popup:before {
            top: 100%;
            border: solid transparent;
            content: " ";
            height: 0;
            width: 0;
            position: absolute;
            pointer-events: none;
        }

        .ol-popup:after {
            border-top-color: white;
            border-width: 20rpx;
            left: 96rpx;
            margin-left: -20rpx;
        }

        .ol-popup:before {
            border-top-color: #cccccc;
            border-width: 22rpx;
            left: 96rpx;
            margin-left: -22rpx;
        }

        .ol-popup-closer {
            text-decoration: none;
            position: absolute;
            top: 2px;
            right: 8px;
        }

        .ol-popup-closer:after {
            content: "✖";
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
