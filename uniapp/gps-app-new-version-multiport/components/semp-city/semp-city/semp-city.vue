<!-- 说明: 在依据插件作者的基础上, 根据自己项目进行了部分修改, 原项目可自行下载, 与该文件对比, 查看具体修改的部分 -->
<template>
    <view class="semp-city">
        <view class="has-choose-box flex-row pad-left">
            <text class="has-choose" :class="index==showRank?'active':''" v-for="(item,index) in cityList" :key="index"
                @tap="onRankClick(index)" v-if="index <= showRank" style="margin-right: 10px; border-bottom: 1px solid #f5f5f5;">
                {{item.name != 0? item.name : '请选择'}}
            </text>
            <button class="backButton" @tap="goBack" size="mini" type="default" v-show="showRank != 0">
                <image src="../../../static/images/back.png" alt="" style="height: 18px; width: 18px; vertical-align: middle;">
            </button>
            
        </view>
        <view class="cityBox">
            <scroll-view id="city-item-box" scroll-y="true">
                <view class="city-item pad-left flex-row" :class="item.value==valueObj[cityList[showRank].identify].value?'active':''"
                    v-for="(item,index) in cityList[showRank].showList" :key="index" @tap="onChooseClick(item)" style="height: 32px;
                    border-bottom: 1px solid #fff;">
                    <view>{{item.label}}</view>
                    <view v-if="item.value==valueObj[cityList[showRank].identify].value">
                        <!-- <semp-icon type="gou" color="#0faeff" size="26"></semp-icon> -->
                    </view>
                </view>
                <!-- <view class="city-item pad-left flex-row" @click="onChooseClick(other)" v-if="showRank>1"> -->
                <!-- <view>其它(如没有你的镇区，街道请在详细地址输入)</view> -->
                <!-- </view> -->
            </scroll-view>
        </view>
        <view class="button-container">
                <view @tap="cancelSelected()" hover-class="hoverStyle" class="btn-cancel">
                   取消
                </view>
                <view class="btn-confirm">
                    <view @tap="confirmSelected" hover-class="hoverStyle">确定</view>
                </view>
        </view>
    </view>
</template>

<script>
    // import cityData from '../common/city.data.js';
    import mixin from '@/common/mixin.js'

    export default {
        mixins: [mixin],
        data() {
            return {
                other: {
                    label: "",
                    value: '0'
                },
                btnType: 'default',
                showRank: 0,
                listData: [],
                distData: [],
                cityData: '',
                codeValue: [],
                codeDatas: [],
                sumi: 0,
                cityList: [{
                        identify: 'province',
                        name: '0',
                        // 获取数据, 整理好后, 赋值给showList
                        // showList: cityData[this.platform]
                        showList: []
                    },
                    {
                        identify: 'city',
                        name: '0',
                        showList: []
                    },
                    {
                        identify: 'county',
                        name: '0',
                        showList: []
                    }
                    // {
                    //     identify: 'town',
                    //     name: '0',
                    //     showList: []
                    // }
                ],
                valueObj: {
                    province: {
                        label: '',
                        value: ''
                    },
                    city: {
                        label: '',
                        value: ''
                    },
                    county: {
                        label: '',
                        value: ''
                    }
                    // town: {
                    //     label: '',
                    //     value: '0'
                    // },
                }
            };
        },
        watch: {
            showRank: function (newV, oldV) {
                if(newV == 0) {
                    this.btnType = 'default';
                } else {
                    this.btnType = 'primary';
                }
            }
        },
        props: {
            platform: String,
            default: 'tb'
        },
        methods: {
            /** - 获取省市县数据: */
            getData() {
                let that = this
                uni.request({
                    url: `${that.api}tag.service?txn-code=option.ajson&option-name=tlt_have_truck_region`,
                    // #ifdef MP-WEIXIN
                    header: getApp().globalData.header,
                    // #endif
                    data: {},
                    method: 'GET',
                    dataType: 'json',
                    success: function(res) {
                        const {
                            codeDatas
                        } = res.data
                        that.codeDatas = codeDatas
                        if (res.statusCode === 200) {
                            console.log('返回的省市县数据', codeDatas)
                            /** 得到数据源后进行判断, 地图界面传递过来的code 是否存在于 distData中 */
                            that.getCodeValue1(codeDatas)

                            /** 进行数据处理 */
                            codeDatas.forEach((item, index) => {
                                that.listData.push({
                                    value: item.codeValue,
                                    label: item.codeName,
                                    children: [],
                                    sortValue: item.sortValue
                                })
                            })
                            that.getDistData(that.listData)
                        }
                    }
                })
            },
            /** 设置级联选择器默认值 函数1 */
            getCodeValue1(data) {
                if (!this.passCasCode) {
                    return
                }
                data.forEach((item, index) => {
                    /** 说明, 当前地区为有车辆的地区 */
                    if (item.codeValue === this.passCasCode) {
                        let sortValue = item.sortValue
                        this.codeValue.unshift(item.codeValue)
                        /** 查找上一级元素, 而且上一级肯定存在 */
                        this.getCodeValue2(data, sortValue)
                    }
                })
                this.$emit('set-complete', '1')
            },
            /** 设置级联选择器默认值 函数2 */
            getCodeValue2(data, sortValue) {
                data.forEach((item, index) => {
                    /** 如果元素不存在sortValue, 说明为第一级 */
                    if (!item.sortValue) {
                        if (item.codeValue === sortValue) {
                            this.codeValue.unshift(item.codeValue)
                        }
                    } else {
                        if (item.codeValue === sortValue) {
                            let sortValue = item.sortValue
                            this.codeValue.unshift(item.codeValue)
                            this.getCodeValue2(data, sortValue)
                        }
                    }
                })
            },
            /** 处理得到的数据: codeDatas, 得到iview级联选择器要求的 数据形式
             *    对于父子层级关系的判断: 依靠: sortValue
             *      如果没有 sortValue, 说明为第一级
             * */
            /** 处理数据结构 函数1 */
            getDistData(data) {
                let that = this
                data.forEach((item, index) => {
                    if (item.sortValue) {
                        /** 说明为其他级别 */
                        data.forEach((itemC, indexC) => {
                            if (itemC.value === item.sortValue) {
                                itemC.children.push(item)
                            }
                        })
                    }
                })
                this.listData.forEach((item) => {
                    if (!item.sortValue) {
                        that.distData.push(item)
                    }
                })
                that.distData = that.distData.slice(0, that.distData.length)
                console.log('级联选择器数据', that.distData)
                that.cityList[0].showList = that.distData
                // if (this.codeType === 'tlt_region') {
                //     window.localStorage.setItem('tlt_region', JSON.stringify(that.distData))
                // }
            },
            onChooseClick(item) {
                if (item.children != '' && item.children) {
                    this.valueObj[this.cityList[this.showRank].identify].label = item.label;
                    this.valueObj[this.cityList[this.showRank].identify].value = item.value;
                    this.cityList[this.showRank].name = item.label;
                    console.log(this.cityList[this.showRank].name);
                    this.showRank++;
                    this.cityList[this.showRank].showList = item.children;
                } else {
                    // this.valueObj.town.label = '';
                    // this.valueObj.town.value = '0';
                    this.valueObj[this.cityList[this.showRank].identify].label = item.label;
                    this.valueObj[this.cityList[this.showRank].identify].value = item.value;
                    this.cityList[this.showRank].name = item.label;
                }
                
                console.log(this.valueObj, this.showRank, this.cityList[this.showRank].showList)
            },
            onRankClick(key) {
                this.showRank = key;
                console.log(key, this.cityList[0].name, this.cityList[1].name, this.cityList[2].name)
                if (key === 0) {
                    this.valueObj.province.label = ''
                    this.valueObj.province.value = ''
                    this.valueObj.city.label = ''
                    this.valueObj.city.value = ''
                    this.valueObj.county.label = ''
                    this.valueObj.county.value = ''
                    this.cityList[1].showList = []
                    this.cityList[2].showList = []
                    this.cityList[1].name = ''
                    this.cityList[2].name = ''
                }
                
                if (key === 1) {
                    this.valueObj.city.label = ''
                    this.valueObj.city.value = ''
                    this.valueObj.county.label = ''
                    this.valueObj.county.value = ''
                    this.cityList[2].showList = []
                    this.cityList[2].name = ''
                }
            },
            confirmSelected() {
                console.log(this.valueObj);
                this.$emit('confirmSelect', this.valueObj);
            },
            cancelSelected() {
                this.showRank = 0
                this.valueObj.province.label = ''
                this.valueObj.province.value = ''
                this.valueObj.city.label = ''
                this.valueObj.city.value = ''
                this.valueObj.county.label = ''
                this.valueObj.county.value = ''
                this.cityList[1].showList = []
                this.cityList[2].showList = []
                this.cityList[1].name = ''
                this.cityList[2].name = ''
                this.$emit('cancelSelect', this.valueObj)
            },
            // --- 
            goBack() {
                if (this.showRank != 0) {
                    this.showRank -= 1
                    console.log(this.showRank)
                    if (this.showRank === 1) {
                        this.valueObj.county.label = ''
                        this.valueObj.county.value = ''
                        this.cityList[2].showList = []
                        this.cityList[2].name = ''
                    } else if (this.showRank === 0) {
                        this.cityList[1].showList = []
                        this.cityList[1].name = ''
                        this.valueObj.city.label = ''
                        this.valueObj.city.value = ''
                        
                    }
                } 
            }
        },
        computed: {

        },
        mounted() {
            this.getData()
        }
    }
</script>

<style lang="less" scoped>
    /* 自己添加的样式 */
    .semp-city {
        font-size: 26rpx;
        
        .flex-row {
            display: flex;
            flex-direction: row;
        }
        
        .pad-left {
            padding-left: 15px;
        }
        
        .cityBox {
            height: 400rpx;
            overflow: auto;
        }  
        
        .has-choose-box {
            position: relative;
            height: 36px;
            line-height: 36px;
            box-shadow: 0 5px 5px #ccc;
            margin-bottom: 20px;
            
            .has-choose.active {
                color: #0faeff;
                border-color: #0faeff;
            }
        }
        
        .backButton {
            position: absolute;
            right: 0;
            top: 2px;
            height: 30px !important;
            width: 100rpx;
            text-align: center;
        }
        
        #city-item-box {
            
            .city-item view {
                justify-content: center;
            }
            
            .city-item.active {
                color: #0faeff;
            }
        }
        
        .button-container {
            width: 100%;
            border: none;
            display: flex;
            padding: 52rpx 86rpx;
            box-sizing: border-box;
            font-size: 28rpx;
            
            .hoverStyle {
                opacity: 0.5;
            }
            
            .btn-cancel {
                flex: 1;
                height: 64rpx;
                color: #bdbdbd;
                line-height: 64rpx;
                text-align: center;
            }
            
            .btn-confirm {
                flex: 1;
                
                view {
                    float: right;
                    height: 64rpx;
                    width: 168rpx;
                    line-height: 64rpx;
                    color: #fff;
                    text-align: center;
                    background: #bd0202;
                    border-radius: 32rpx;
                    box-shadow: 0rpx 8rpx 10rpx 0rpx #d54048;
                }
            }
        }
    }
</style>
