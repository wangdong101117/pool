<template>
    <view id="map-container" name="olmap" class="map-container uni-container">
        <view class="map-tool" v-show="!show_tstati">
            <view>
                <view id="world_btn">国家</view>
                <view id="china_btn">省</view>
                <view id="province_btn">市</view>
                <view id="city_btn">县</view>
            </view>
        </view>
        <!--  右键出现导航菜单  -->
        <view class="modalBox" v-show="!show_tstati">
            <view class="nav-list" ref="navList">
                <view v-for="(item, index) in secondMenu" :key="index" @click.stop="navigatePage(item)">
                    {{item.title}}
                </view>
            </view>
        </view>

        <view id="map" @contextmenu="mapBox.onContextmenu" class="mapBox" v-show="show_map"></view>

        <view class="tstati-container" v-show="show_tstati" @touchstart="start" @touchend="end">
            <view class="icon-box" style="height: 150rpx; width: 100%; padding-top: 76rpx; overflow: hidden; padding-left: 30rpx; box-sizing: border-box;">
                <uni-icons :size="26" class="uni-icon-wrapper" style="float: left;" hover-class="hoverStyle" color="#dc1110"
                    type="settings" @tap="show_filterModal" />
                <view class="icons-container" @tap="show_condition = true" style="float: right; margin-right: 20rpx;">
                    <view hover-class="hoverStyle">
                        <!-- <image src="@/static/tstati/option.png" mode="aspectFit" style=""></image> -->
                        <text>条件选择</text>
                    </view>
                </view>
            </view>
            <view class="thead">
                <view style="width: 80rpx; text-align: center;"></view>
                <view style="flex: 2; text-align: center;">日期</view>
                <view style="flex: 3; text-align: center;">整车编号</view>
                <view style="flex: 2; text-align: center;">打火时长/h</view>
                <view style="flex: 2; text-align: center;">总里程/km</view>
                <view style="width: 100rpx; text-align: center;">#</view>
            </view>
            <view class="tbody">
                <view v-for="(item ,index) in list" :key="index" @tap="table_item_tap(item, index)" :class="selected_index === index? 'selectItem' : ''">
                    <view>
                        <view style="width: 80rpx; text-align: center;">
                            <uni-icons :size="14" class="uni-icon-wrapper" hover-class="hoverStyle" color="#333" v-if="selected_index !== index"
                                type="arrowright" />
                            <uni-icons :size="14" class="uni-icon-wrapper" hover-class="hoverStyle" color="#333" v-else
                                type="arrowdown" />
                        </view>
                        <view style="flex: 2; text-align: center;">{{item.m_date}}</view>
                        <view style="flex: 3; text-align: center;">
                            {{item.vehicle_id}}
                        </view>
                        <view style="flex: 2; text-align: center;">{{item.engine_hours}}</view>
                        <view style="flex: 2; text-align: center;">{{item.run_km}}</view>
                        <view style="width: 100rpx; text-align: center;">{{index + 1}}</view>
                    </view>
                    <view style="background: #fceee8; color: #333" v-if="selected_index === index">
                        <view style="flex: 2; text-align: center;">行车时长 {{item.run_hours}} h</view>
                        <view style="flex: 2; text-align: center;">平均时速 {{item.average_speed}} km/h</view>
                        <view style="flex: 2; text-align: center;">超速时长 {{item.over_speed}} 分钟</view>
                        <view style="flex: 2; text-align: center;">最高时速 {{item.max_speed}} km/h</view>
                    </view>
                </view>
            </view>

            <uni-load-more :status="loadMoreStatus"></uni-load-more>
            <!-- 选择统计/查询内容弹框 -->
            <uni-popup :show="showFilterModal" type="center" :custom="true" :mask-click="false">
                <view class="uni-tip">
                    <view class="uni-tip-title">
                        <!-- <image src="@/static/tstati/option.png" mode="aspectFit" style="width: 24px; height: 24px;"></image> -->
                        <view>选择功能</view>
                    </view>
                    <view class="uni-tip-content" style="padding: 5px;"></view>

                    <view class="uni-list" style="text-align: center;">
                        <radio-group @change="radioChange">
                            <label class="uni-list-cell uni-list-cell-pd radio-list" v-for="(item, index) in items"
                                :key="item.value">
                                <view class="img-box">
                                    <image :src="item.src"></image>
                                </view>
                                <view class="item-name">{{item.name}}</view>
                                <view class="item-radio">
                                    <radio :value="item.value" :checked="index === current" style="transform:scale(0.7)" />
                                </view>
                            </label>
                        </radio-group>
                    </view>
                    <view class="uni-tip-group-button" style="margin-top: 30px;">
                        <!-- <view class="uni-tip-button" @click="cancelFilter()">取消</view> -->
                        <view class="uni-tip-button" @click="confirmFilter()">确定</view>
                    </view>
                </view>
            </uni-popup>
            <!-- 条件选择弹框 -->
            <uni-popup class="fullscreen-popup" :show="show_condition" type="center" :custom="true" :mask-click="false">
                <view class="uni-tip uni-tip-fullscreen">
                    <view class="uni-tip-title">
                        <!-- <image src="@/static/tstati/option.png" mode="aspectFit" style="width: 24px; height: 24px;"></image> -->
                        <view>条件选择</view>
                    </view>
                    <view class="uni-tip-content" style="padding: 10rpx;"></view>
                    <view style="padding: 20rpx; text-align: center;">
                        <uni-combox label="选择国家:" :placeholder="selectedCountryName? selectedCountryName : '请选择国家'"
                            :value="selectedCountryName" @sendValue="selectedCountry" v-model="selectedCountryName"
                            codeType="tlt_have_truck_country" :s_id="refs[0]" :ref="refs[0]"></uni-combox>
                        <!-- <view style="position: static; overflow: hidden; padding: 0; height: 112rpx;" @click.prevent="isClick" -->
                        <!-- :class="isCanUse ? 'canUse' : 'uCanUse'"> -->
                        <view style="position: static; overflow: hidden; padding: 0; height: 112rpx;" @click.prevent="isClick"
                            v-if="isCanUse">
                            <uni-combox label="选择地区:" :placeholder="selectedDist" style="float: left; z-index: 0; width: 100%;"
                                :disabled="disabled" v-model="selectedDist">
                            </uni-combox>
                        </view>

                        <uni-combox label="所属组织:" :placeholder="selectedoOganizationName? selectedoOganizationName : '请选择所属组织'"
                            :s_id="refs[1]" :value="selectedoOganizationName" v-show="current !== 0" @sendValue="selectedOganization"
                            v-model="selectedoOganizationName" codeType="tlt_organization" :ref="refs[1]"></uni-combox>

                        <uni-combox label="整车编号:" :placeholder="selectedVehicleIDName? selectedVehicleIDName : '请选择整车编号'"
                            :s_id="refs[2]" :value="selectedVehicleIDName" v-show="current === 0" :region_code="region_code"
                            @sendValue="selectedVehicleID" v-model="selectedVehicleIDName" codeType="tlt_vehicle_in_region"
                            :uid="selectedoOganizationValue" :ref="refs[2]"></uni-combox>

                        <view v-show="current === 2 || current === 3" style="border-bottom: 1px solid #ccc; height: 64rpx; line-height: 64rpx; display: flex; font-size: 30rpx; padding: 20rpx; 0">
                            <text>选择月份:</text>
                            <dyDatePicker v-show="current === 2" timeType="month" @getData="getMonth" :showDate="true"
                                placeholder="请点击选择月份" minSelect="2000/01/01" maxSelect="2025/12/31" style="flex: 1; color: #aaa;">
                            </dyDatePicker>
                            <dyDatePicker v-show="current === 3" timeType="year" @getData="getYear" :showDate="true"
                                placeholder="请点击选择年份" minSelect="2000/01/01" maxSelect="2025/12/31" style="flex: 1; color: #aaa;">
                            </dyDatePicker>
                        </view>
                        <view v-show="current === 0 || current === 1" style="border-bottom: 1px solid #ccc; height: 64rpx; line-height: 64rpx; display: flex; font-size: 30rpx; padding: 20rpx 0;">
                            <text>选择日期:</text>
                            <text style="flex: 1; color: #848b9a;" @tap="dateIcon_click" v-show="current === 0">{{start_date? `${start_date} - ${stop_date}` : '请选择日期'}}</text>
                            <text style="flex: 1; color: #848b9a;" @tap="dateIcon_click" v-show="current === 1">{{month? month: '请选择日期'}}</text>
                        </view>
                    </view>

                    <view class="uni-tip-group-button" style="margin-top: 30px;">
                        <view class="uni-tip-button" @click="cancel_condition()">取消</view>
                        <view class="uni-tip-button" @click="confirm_condition()">确定</view>
                    </view>

                    <mx-date-picker :show="showDateModal" :type="type" :show-tips="true" :show-seconds="true" @confirm="onSelected"
                        @cancel="showDateModal = false" v-if="current === 0 || current === 1" />

                    <uni-popup :show="isShow" type="bottom" mode="fixed" msg="选择收货地址" @hidePopup="togglePopup('')">
                        <semp-city @confirmSelect="onCityClick" @cancelSelect="cancelSelectedDist"></semp-city>
                    </uni-popup>
                </view>
            </uni-popup>
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

    // 加载更多
    import uniLoadMore from "@/components/uni-load-more/uni-load-more.vue"
    import mixin from '@/common/mixin.js'
    export default {
        mixins: [mixin],
        components: {
            uniIcons,
            uniPopup,
            uniCombox,
            sempCity,
            MxDatePicker,
            dyDatePicker,
            uniLoadMore
        },
        data() {
            return {
                secondMenu: [{
                        title: '查询日工作状况',
                        value: 1
                    },
                    {
                        title: '统计日工作状况',
                        value: 2
                    },
                    {
                        title: '统计月工作状况',
                        value: 3
                    },
                    {
                        title: '统计年工作状况',
                        value: 4
                    }
                ],
                option: '',
                show_tstati: false,
                show_map: true,
                selected_index: null,
                show_condition: false, // 控制条件选择框的显示隐藏
                btnDisable: false, // 控制搜索按钮禁用/启用, 避免短时间内多次操作点击搜索按钮
                searchFlag: false, // 用于标识是否进行过搜索, 当没有进行过搜索查询列表数据时, 不会触发上拉加载更多
                list: [],
                sumi: 0, // 用于标识: 触发上拉加载更多的执行次数, 以便用来设置加载更多组件的 提示描述等
                lock: true, // 在上拉加载更多程序中: 用来控制上拉加载更多, 避免短时间内持续上拉, 导致加载过多数据, 效果不好, 
                loadMoreStatus: 'noMore', // 上拉加载更多组件的文字提示描述; noMore: 没有更多数据, more: 加载更多 loading: 加载更多
                // == 以下为选择功能弹框依赖的数据
                showFilterModal: false, // 控制选择功能(查询日/月/统计日)modal弹框的显示/隐藏
                /** 单选框: radio-group组件依赖的数据 */
                items: [{
                        value: '1',
                        name: '查询日工作状况',
                        src: '../../../static/tstati/queryday1.png'
                    },
                    {
                        value: '2',
                        name: '统计日工作状况',
                        src: '../../../static/tstati/totalday1.png',
                    },
                    {
                        value: '3',
                        name: '统计月工作状况',
                        src: '../../../static/tstati/totalmonth1.png'
                    },
                    {
                        value: '4',
                        name: '统计年工作状况',
                        src: '../../../static/tstati/totalyear1.png'
                    }
                ],
                current: 0, // 当前单选按钮, 选中的是第几个选项
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
                month: '',
                year: '',
                // ==>以下为选择日期期间依赖的数据
                showDateModal: false, // 控制日期选择弹框的显示/隐藏
                startDate: '',
                endDate: '',
                start_date: '',
                stop_date: '',
                value: '',
                type: '',
                date: '2019/01/01',
                range: ['2019/01/01', '2019/01/06'],
                startData: {
                    clientX: '',
                    clientY: ''
                }
            }
        },
        methods: {
            start(e) {
                this.startData.clientX = e.changedTouches[0].clientX;
                this.startData.clientY = e.changedTouches[0].clientY;
            },
            end(e) {
                const subX = e.changedTouches[0].clientX - this.startData.clientX;
                const subY = e.changedTouches[0].clientY - this.startData.clientY;

                if (subX > 100) {
                    this.show_tstati = false
                    setTimeout(() => {
                        this.show_map = true
                    }, 300)
                } else if (subX < -100) {
                    this.show_tstati = false
                    setTimeout(() => {
                        this.show_map = true
                    }, 300)
                }
            },
            getNavigatePageData(option) {
                this.option = option
            },
            /** 弹框 查看车辆信息 绑定的 点击事件的 处理函数 跳转到 查询地区车辆页面 */
            navigatePage(item) {
                if (this.option) {
                    if (!this.option.canNavigateTo) {
                        plus.nativeUI.toast('当前点击地区暂无车辆');
                        return
                    }
                    /** 如果是在世界图层 */
                    if (this.option.level === '1') {
                        this.selectedCountryValue = this.option.code;
                        this.selectedCountryName = this.option.name;

                    } else {
                        this.selectedCountryValue = '156';
                        this.selectedCountryName = '中华人民共和国';
                        this.selectedDist = this.option.name;
                    }

                    this.current = parseInt(item.value) - 1;
                    this.list = [];

                    this.region_code = this.option.code;

                    this.show_tstati = true;
                    this.show_map = false;

                    this.month = '';
                    this.year = '';
                    this.startDate = '';
                    this.endDate = '';
                    this.start_date = '';
                    this.stop_date = '';

                    this.search()
                    return false
                }
            },
            table_item_tap(item, index) {
                if (this.selected_index === index) {
                    this.selected_index = null;
                } else {
                    this.selected_index = index;
                }
            },
            cancel_condition() {
                this.show_condition = false;

                this.month = '';
                this.year = '';
                this.startDate = '';
                this.endDate = '';
                this.start_date = '';
                this.stop_date = '';
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
                if (this.current === 2 || this.current === 3) {
                    this.showDateModal = true;
                } else {
                    uni.showLoading();
                    if (this.current === 0) {
                        this.type = 'range';
                    } else if (this.current === 1) {
                        uni.showLoading();
                        this.type = 'date';
                    }

                    this.value = this[this.type];
                    this.showDateModal = true;
                    let timer = setTimeout(() => {
                        uni.hideLoading();
                        clearTimeout(timer);
                    }, 1200)
                }
            },
            onSelected(e) {
                if (e) {
                    console.log(e.value)
                    this[this.type] = e.value;
                    let time = e.value + '';
                    if (this.current === 0) {
                        this.startDate = new Date(time.split(',')[0]).getTime();
                        this.endDate = new Date(time.split(',')[1]).getTime();
                        if (this.startDate && this.endDate) {
                            if ((this.endDate - this.startDate) / 86400000 > 60) {
                                uni.showToast({
                                    title: '间隔时间不能超过60天, 请重新选择',
                                    icon: 'none'
                                })
                            } else {
                                let time1 = time.split(',')[0] + '';
                                let time2 = time.split(',')[1] + '';
                                this.start_date = time1.replace(/-+|\s|:|\/+/g, '');
                                this.stop_date = time2.replace(/-+|\s|:|\/+/g, '');

                                console.log(this.start_date, this.stop_date);
                                this.showDateModal = false;
                            }
                        }
                    } else if (this.current === 1) {
                        this.month = time.replace(/-+|\s|:|\/+/g, '');
                        this.showDateModal = false;
                    }
                }
            },
            search() {
                this.btnDisable = true;
                this.option = '';
                this.sumi = 0;
                if (this.current === 2) {
                    // 说明是统计月
                    if (!this.month) {
                        uni.showToast({
                            title: '请选择要查询的月份',
                            icon: 'none'
                        })
                        this.btnDisable = false;
                        return
                    }
                } else if (this.current === 1) {
                    if (!this.month) {
                        uni.showToast({
                            title: '请选择要查询的日期',
                            icon: 'none'
                        })
                        this.btnDisable = false;
                        return
                    }
                }
                //  else if (this.current === 0) {
                //     if (!this.start_date || !this.stop_date) {
                //         uni.showToast({
                //             title: '请选择要查询的日期期间',
                //             icon: 'none'
                //         })
                //         this.btnDisable = false
                //         return
                //     }

                //     if (!this.selectedVehicleIDValue) {
                //         uni.showToast({
                //             title: '请选择要查询的车辆',
                //             icon: 'none'
                //         })
                //         this.btnDisable = false
                //         return
                //     }
                // } 
                else if (this.current === 3) {
                    if (!this.year) {
                        uni.showToast({
                            title: '请选择要查询的年份',
                            icon: 'none'
                        })
                        this.btnDisable = false
                        return
                    }
                }

                this.show_condition = false
                this.getListData()
            },
            show_filterModal() {
                this.showFilterModal = true
            },
            /** 单选框change事件 */
            radioChange(evt) {
                this.list = [];
                this.sumi = 0;
                this.selected_index = null;
                this.month = '';
                this.year = '';
                this.startDate = '';
                this.endDate = '';
                this.start_date = '';
                this.stop_date = '';
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

                for (let i = 0; i < this.items.length; i++) {
                    if (this.items[i].value === evt.target.value) {
                        this.current = i;
                        break;
                    }
                }
                if (this.current === 0) {
                    uni.setNavigationBarTitle({
                        title: `工作状况查询 - 查询日`
                    })
                } else if (this.current === 1) {
                    uni.setNavigationBarTitle({
                        title: `工作状况查询 - 统计日`
                    })
                } else if (this.current === 2) {
                    uni.setNavigationBarTitle({
                        title: `工作状况查询 - 统计月`
                    })
                } else if (this.current === 3) {
                    uni.setNavigationBarTitle({
                        title: `工作状况查询 - 统计年`
                    })
                }
            },
            /** 选择功能弹框上取消按钮 */
            // cancelFilter() {
            //     this.current = 0
            //     this.showFilterModal = false
            //     this.show_condition = true
            // },
            /** 选择功能弹框上确定按钮 */
            confirmFilter() {
                this.showFilterModal = false
                this.show_condition = true
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
            },
            /** 选择月份 */
            getMonth(value) {
                this.month = value.replace(/-+|\s|:+/g, '')
            },
            /** 选择年份 */
            getYear(value) {
                this.year = value.replace(/-+|\s|:+/g, '')
            },
            /** 获取列表数据 */
            getListData() {
                this.searchFlag = true // 用于标识是否进行过搜索
                uni.showLoading({
                    title: '请稍后'
                });
                let url = ''
                let select_key
                if (this.current === 0) {
                    url = `${this.api}txntq1011.ajson`
                    select_key = {
                        region_code: this.region_code, // 地区
                        start_date: this.start_date, // 起始日期
                        stop_date: this.stop_date, // 结束日期
                        vehicle_uid: this.selectedVehicleIDValue // 车辆,
                    }
                }
                if (this.current === 2) {
                    url = `${this.api}txnts1003.ajson`
                    select_key = {
                        organization_uid: this.selectedoOganizationValue, // 机构uid
                        region_code: this.region_code, // 地区
                        month: this.month // 月份,
                    }
                } else if (this.current === 1) {
                    url = `${this.api}txnts1001.ajson`
                    select_key = {
                        organization_uid: this.selectedoOganizationValue, // 机构uid
                        region_code: this.region_code, // 地区
                        m_date: this.month // 日期,
                    }
                } else if (this.current === 3) {
                    url = `${this.api}txnts1005.ajson`
                    select_key = {
                        organization_uid: this.selectedoOganizationValue, // 机构uid
                        region_code: this.region_code, // 地区
                        year: this.year // 日期,
                    }
                }
                uni.request({
                    url: url,
                    data: {
                        select_key: {
                            ...select_key
                        }
                    },
                    method: 'POST',
                    timeout: 60000,
                    dataType: 'json',
                    success: (res) => {
                        this.btnDisable = false
                        if (res.data.error_code === '000000') {
                            // console.log(res.data.record)
                            if (res.data.record && res.data.record.length) {
                                this.record = res.data.record;
                                let list = []
                                /** 需求: 一次会返回所有的数据, 但是每次展示20条数据, 
                                    当触发上拉加载更多时, 每次添加20条数据, 直到将所有的数据添加完 */
                                this.list = list.concat(this.record.slice(0, 20))
                                if ((this.sumi + 1) * 20 >= this.record.length) {
                                    this.loadMoreStatus = 'noMore' // 没有更多数据了
                                } else {
                                    this.loadMoreStatus = 'more' // 加载更多数据
                                }
                            } else {
                                uni.showToast({
                                    title: '暂无数据',
                                    icon: 'none'
                                })
                                // 没有数据, 设置list=[], 加载更多组件提示为: 无更多数据
                                this.list = [];
                                this.loadMoreStatus = 'noMore'
                            }

                            let timer = setTimeout(() => {
                                uni.hideLoading();
                                clearTimeout(timer)
                            }, 1000)
                        } else {
                            this.toastRequestErr(res.data)
                            uni.hideLoading()
                        }
                    },
                    fail: () => {
                        this.btnDisable = false
                        uni.hideLoading()
                        this.toastErr()
                    }
                })
            }
        },
        mounted() {
            this.map_level = '2'
        },
        onBackPress() {
            return true
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
                // this.$refs['modalBox'].style.display = 'none';
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
            /** 右击事件 */
            rightClick(evt) {
                let map_level = '';
                plus.nativeUI.showWaiting()
                document.querySelector('.modalBox').style.display = 'none'
                /** 获取到右击点 的坐标 */
                /** 设置 弹框的位置 */
                document.querySelector('.modalBox').style.left = evt.originalEvent.offsetX + 'px';
                document.querySelector('.modalBox').style.top = evt.originalEvent.offsetY + 'px';
                /** 设置控制点击事件的 state 为 pending, 当下次点击时, 如果 state的值 仍为pending, 阻止事件的触发 */
                this.state = 'pending';
                this.locateQueryParams.input.longitude = evt.coordinate[0];
                this.locateQueryParams.input.latitude = evt.coordinate[1];
                this.locateQueryParams.input.region_level = this.level;

                var xhr = new XMLHttpRequest();
                xhr.open('POST', `${this.api}txngps001.ajson`);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                let msg =
                    `input:longitude=${this.locateQueryParams.input.longitude}&input:latitude=${this.locateQueryParams.input.latitude}&input:region_level=${this.locateQueryParams.input.region_level}`
                xhr.send(msg);
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        plus.nativeUI.closeWaiting()
                        var datas = JSON.parse(xhr.responseText);
                        if (datas.error_code === '000000') {
                            let data = datas.region[0];
                            /** 这里判断 有没有车, 后端会返回响应的数据 */
                            if (data.count === '0') {
                                document.querySelector('.modalBox').style.color = '#0c0c0c';
                                document.querySelector('.modalBox').style.background = '#ccc';
                                document.querySelector('.modalBox').style.border = '1px solid #fff';
                                document.querySelector('.modalBox').style.cursor = 'not-allowed';
                                this.canNavigateTo = false;
                                document.querySelectorAll('.nav-list').forEach(item => {
                                    item.style.background = '#ccc';
                                    item.style.color = '#0c0c0c'
                                })
                            } else {
                                /** 有车 */
                                document.querySelector('.modalBox').style.color = '#fff';
                                document.querySelector('.modalBox').style.background = '#00a0e8';
                                document.querySelector('.modalBox').style.border = '1px solid #fff';
                                document.querySelector('.modalBox').style.cursor = 'pointer';
                                this.canNavigateTo = true;
                                document.querySelectorAll('.nav-list').forEach(item => {
                                    item.style.background = '#00a0e8';
                                    item.style.color = '#fff'
                                })
                            }

                            if (data.code) {
                                document.querySelector('.modalBox').style.display = 'block';
                            } else {
                                document.querySelector('.modalBox').style.display = 'none';
                                plus.nativeUI.toast('当前点击的是无效区域')
                            }
                            this.name = data.name;
                            this.code = data.code;
                        }

                        setTimeout(() => {
                            /** 处理完毕, 重新设置state 为 '', 以便下一次的点击事件能够触发 */
                            this.state = ''
                        }, 800)
                    }
                }
            },
            /** 点击(单击)事件处理程序 */
            identify(evt) {
                // 调用nativeUI的 关闭系统等待对话框方法
                plus.nativeUI.closeWaiting();
                // document.querySelector('.modalBox').style.display = 'none';
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
                // document.querySelector('.modalBox').style.display = 'none';
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

                /** 双击事件, 通过state 来控制事件, 避免事件重复触发执行 */
                // this.map.on('dblclick', evt => {
                //     if (this.state == 'pending') {
                //         return
                //     }
                //     if (this.level == '1' || this.level == '4') return
                //     // this.identify(evt)
                // });

                /** 设置一个右击事件 , state的作用 同上, 移动端是长按事件 */
                // this.map.on('contextmenu', evt => {
                //     if (this.state == 'pending') {
                //         evt.preventDefault()
                //         return
                //     }
                //     this.rightClick(evt)
                //     evt.preventDefault()
                // });
                this.view.on('change:resolution', e => {
                    if (this.state) return
                    document.querySelector('.modalBox').style.display = 'none'
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

        // .modalBox {
        //     position: absolute;
        //     width: 212rpx;
        //     height: 256rpx;
        //     padding: 0px 10rpx;
        //     text-align: center;
        //     line-height: 60rpx;
        //     left: 0;
        //     top: 0;
        //     background: #00a0e8;
        //     color: #fff;
        //     z-index: 99;
        //     display: none;
        //     font-size: 24rpx;
        //     border-radius: 8rpx;
        //     cursor: pointer;

        //     div {

        //         &.firstRow {
        //             border-bottom: 1px solid #fff;
        //             position: relative;

        //             &:hover {

        //                 .nav-list {
        //                     display: block;
        //                 }
        //             }

        //             .nav-list {
        //                 display: none;
        //                 position: absolute;
        //                 /*right: 0;*/
        //                 left: 98px;
        //                 top: 0;
        //                 background: #00a0e8;
        //                 border-left: 1px solid #fff;
        //                 border-radius: 5px;
        //                 padding: 5px 0;

        //                 div {
        //                     width: 212rpx;
        //                     height: 64rpx;
        //                     padding: 0px 10rpx;
        //                     line-height: 64rpx;

        //                     &:hover {
        //                         background: #fff;
        //                         color: #00a0e8;
        //                     }
        //                 }
        //             }
        //         }

        //         &.firstRow:last-child {
        //             border-bottom: none;
        //         }
        //     }
        // }

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

        .tstati-container {
            width: 100%;
            height: 100%;
            position: absolute;
            z-index: 98;
            border-top: 1rpx solid #fff;
            box-sizing: border-box;
        }

        .icons-container {
            font-size: 28rpx;
            float: left;
            margin-left: 120rpx;

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

        .button-container {
            display: flex;
            width: 100%;
            margin-top: 40rpx;

            &>view {
                flex: 1;
                text-align: center;

                view {
                    display: inline-block;
                    width: 90rpx;
                    height: 90rpx;
                    line-height: 90rpx;
                    align-items: center;
                    font-size: 28rpx;
                    border-radius: 50%;
                    background: #fff;

                    image {
                        width: 100%;
                        height: 100%;
                    }
                }
            }
        }

        .canUse {
            border-bottom: none !important;
        }

        .uCanUse {
            display: none;
            border-bottom: none !important;
        }

        .icon-box {
            position: fixed;
            top: 0;
            left: 0;
            background: radial-gradient(#fff, #fceee8);
        }

        .thead {
            position: fixed;
            display: flex;
            flex-direction: row;
            top: 150rpx;
            left: 0;
            width: 100%;
            height: 64rpx;
            line-height: 64rpx;
            font-size: 18rpx;
            color: #fff;
            background: #2d8cf0;
        }

        .tbody {
            padding-top: 210rpx;
            box-sizing: border-box;
        }

        .tbody>view {
            width: 100%;

            &>view {
                display: flex;
                width: 100%;
                height: 76rpx;
                line-height: 76rpx;
                font-size: 18rpx;
            }
        }

        .tbody>view:nth-child(2n) {
            background: #efefef;
        }

        .tbody>view:nth-child(2n+1) {
            background: #dcdee2;
        }

        .tbody>view.selectItem {
            background: #fff;
            // color: #fff;
        }

        .radio-list {
            display: flex;
            height: 84rpx;
            line-height: 84rpx;
            font-size: 28rpx;
            font-weight: 600;
            border-bottom: 1px solid #ccc;
        }

        .radio-list .img-box {
            width: 54rpx;
            height: 54rpx;
            padding: 2rpx;
            margin-top: 16rpx;
            border-radius: 50%;
            background: #00a0e8;
        }

        .radio-list .img-box image {
            width: 42rpx;
            height: 42rpx;
            margin-top: 6rpx;
            margin-left: 4rpx;
            vertical-align: top;
        }

        .radio-list .item-name {
            flex: 1;
            margin-left: 40rpx;
            text-align: left;
        }
    }
</style>
