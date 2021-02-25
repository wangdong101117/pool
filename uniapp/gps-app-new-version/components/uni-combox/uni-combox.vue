<!-- 说明: 在依据插件作者的基础上, 根据自己项目进行了部分修改, 原项目可自行下载, 与该文件对比, 查看具体修改的部分 -->
<template>
    <view class="uni-combox">
        <view v-if="label" class="uni-combox__label" :style="labelStyle">
            <text class="redIcon" v-if="required"></text>
            <text style="display: inline-block;">{{label}}</text>
        </view>
        <view class="uni-combox__input-box">
            <input class="uni-combox__input" type="text" :placeholder="placeholder" v-model="inputVal" @input="onInput" v-if="!inputHidden"
                @focus="toggleSelector" @blur="onBlur" :disabled="disabled" />
            <view v-if="inputHidden">{{placeholder}}</view>    
            <uni-icons class="uni-combox__input-arrow" type="arrowdown" size="20" :color="color" @tap="toggleSelector" v-if="!disabled"></uni-icons>
            <view class="uni-combox__selector" v-if="showSelector && codeType">
                <scroll-view scroll-y="true" class="uni-combox__selector-scroll">
                    <view class="uni-combox__selector-empty" v-if="filterCandidatesLength === 0">
                        <text>{{emptyTips}}</text>
                    </view>
                    <!-- <view class="uni-combox__selector-item" v-for="(item,index) in filterCandidates" :key="index" @click="onSelectorClick(index)">
						<text>{{item.codeName}}</text>
					</view> -->
                    <!-- - 根据自己项目 做出相应修改 -->
                    <view class="uni-combox__selector-item" v-for="(item,index) in candidates" :key="item.codeValue" @tap="onSelectorClick(index)"
                        hover-class="hoverStyle">
                        <text>{{item.codeName}}</text>
                    </view>
                </scroll-view>
            </view>
        </view>
    </view>
</template>

<script>
    import uniIcons from '../uni-icons/uni-icons.vue'
    import mixin from '@/common/mixin.js'
    export default {
        name: 'uniCombox',
        components: {
            uniIcons
        },
        mixins: [mixin],
        props: {
            // 通过s_id 与 绑定的 ref属性的名字, 来实现只有一个 下拉框处于展开状态
            s_id: {
                type: String,
                default:  '',
            },
            // 是否必需
            required: {
                type: Boolean,
                default: false
            },
            // - 添加disabled, 禁用
            disabled: {
                type: Boolean,
                default: false
            },
            // - 哪一个代码集, 调用接口获取 代码集数据
            codeType: {
                type: String,
                default: ''
            },
            label: {
                type: String,
                default: ''
            },
            labelWidth: {
                type: String,
                default: 'auto'
            },
            placeholder: {
                type: String,
                default: ''
            },
            // candidates: {
            // 	type: Array,
            // 	default () {
            // 		return []
            // 	}
            // },
            emptyTips: {
                type: String,
                default: '无匹配项'
            },
            value: {
                type: String,
                default: ''
            },
            region_code: {
                type: String,
                default: ''
            },
            uid: {
                type: String,
                default: ''
            },
            color: {
                type: String,
                default: '#333'
            },
            inputHidden: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                showSelector: false,
                inputVal: '', // input框双向绑定的数据
                candidates: [],
                dataList: [],
                mytimer: null
            }
        },
        mounted() {
            // - 如果props 没有接收到 codeType, 阻止请求
            if (!this.codeType) {
                return
            }
            this.getTagByCode()
        },
        computed: {
            labelStyle() {
                if (this.labelWidth === 'auto') {
                    return {}
                }
                return {
                    width: this.labelWidth
                }
            },
            // filterCandidates() {
            // 	return this.candidates.filter((item) => {
            // 		return item.indexOf(this.inputVal) > -1
            // 	})
            // },
            filterCandidatesLength() {
                // return this.filterCandidates.length
                return this.candidates.length
            }
        },
        watch: {
            value: {
                handler(newVal) {
                    console.log(newVal);
                    if (newVal === '') {
                        this.inputVal = ''
                    }
                    let codeValue = '';
                    if (this.codeType) {
                        this.candidates.forEach((item, index) => {
                            if (item.codeName === newVal) {
                                codeValue = item.codeValue
                                console.log(item)
                            }
                        })
                                           
                        this.$emit('sendValue', codeValue)
                    }
                },
                immediate: true
            },
            region_code: {
                handler(newVal) {
                    console.log(newVal);
                    this.getTagByCode()
                   
                },
                immediate: true
            },
            uid: {
                handler(newVal) {
                   this.getTagByCode()
                },
                immediate: true
            }
        },
        methods: {
            /** - 由自己需求做出更改, 根据代码集, 获取数据 */
            getTagByCode() {
                let url = '';
                if (this.codeType === 'tlt_vehicle_in_region') {
                    url = `${this.api}tag.service?txn-code=option.ajson&option-name=${this.codeType}&parameter=region_code=${this.region_code}%26organization_uid=${this.uid}`
                } else {
                    url = `${this.api}tag.service?txn-code=option.ajson&option-name=${this.codeType}`
                }
                console.log(url)
                uni.request({
                    url: url,
                    data: {},
                    method: 'GET',
                    dataType: 'json',
                    success: (res) => {
                        // console.log('获取到的代码集数据', res.data)
                        this.candidates = res.data.codeDatas
                        this.dataList = res.data.codeDatas
                        if (this.candidates && this.candidates.length) {
                            this.candidates.forEach((item, index) => {
                                if (item.codeValue === this.value) {
                                    this.inputVal = item.codeName
                                    this.$emit('sendValue', item.codeValue)
                                }
                            })
                        }
                    }
                })
            },
            toggleSelector() {
                // this.showSelector = !this.showSelector
                // -- 依据自己项目 
                if (!this.disabled) {
                    this.showSelector = !this.showSelector
                    /** 当该下拉框 展开/收起 状态切换时, 全局注册自定义事件,
                     在使用该组件的页面中 监听该事件的触发, 判断 传递的值是否与 ref属性绑定 name 相同, 不相同的 设置 收起状态
                     依次达到 只有一个下拉框处于展开状态
                    */
                    uni.$emit('comBoxToggle', {
                        data: this.s_id
                    })
                }
            },
            onFocus() {
                console.log('11111')
                // this.showSelector = true
            },
            onBlur() {
                // this.mytimer = setTimeout(() => {
                //     this.showSelector = false
                //     clearTimeout(this.mytimer)
                // }, 5000)
            },
            onSelectorClick(index) {
                /** 做出相应修改 */
                // this.inputVal = this.candidates[index].codeValue
                this.inputVal = this.candidates[index].codeName
                // console.log(this.inputVal)
                this.showSelector = false
                this.$emit('input', this.candidates[index].codeName)
            },
            // -- 监听input 输入事件
            onInput() {
                // -- 根据输入的字符进行筛选
                let listArr = [];
                setTimeout(() => {
                    this.dataList.forEach((item, index) => {
                        if (item.codeName.includes(this.inputVal)) {
                            listArr.push(item)
                        }
                    })
                    this.candidates = listArr;
                    this.$emit('input', this.inputVal)
                })
            }
        }
    }
</script>

<style lang="less">
    .hoverStyle {
        opacity: 0.5;
    }
    
    .redIcon {
        display: inline-block;
        width: 12rpx !important;
        height: 12rpx !important;
        vertical-align: top;
        margin-right: 30rpx;
        border-radius: 50%;
        background: #dc1110;
        padding: 0 !important;
        display: none;
    }
    
    .uni-combox {
        /* #ifndef APP-NVUE */
        display: flex;
        /* #endif */
        // height: 72rpx;
        // line-height: 72rpx;
        // padding: 20rpx 0;
        // padding: 48rpx 0 32rpx 0;
        flex-direction: row;
        align-items: center;
        border-bottom: solid 1px #DDDDDD;
    }

    .uni-combox__label {
        font-size: 28rpx;
        // padding-right: 20rpx;
        color: #333;
    }

    .uni-combox__input-box {
        position: relative;
        /* #ifndef APP-NVUE */
        display: flex;
        /* #endif */
        flex: 1;
        flex-direction: row;
        align-items: center;
    }

    .uni-combox__input {
        flex: 1;
        font-size: 28rpx;
        // height: 44rpx;
        // line-height: 46rpx;
    }

    .uni-combox__input-arrow {
        // padding-right: 40rpx;
    }

    .uni-combox__selector {
        box-sizing: border-box;
        position: absolute;
        top: 80rpx;
        left: 0;
        width: 100%;
        background-color: #efefef;
        border-radius: 12rpx;
        box-shadow: #eee 4rpx 4rpx 8rpx;
        z-index: 999;
    }

    .uni-combox__selector-scroll {
        max-height: 346rpx;
        box-sizing: border-box;
    }

    .uni-combox__selector::before {
        content: '';
        position: absolute;
        width: 0;
        height: 0;
        border-bottom: solid 12rpx #efefef;
        border-right: solid 12rpx transparent;
        border-left: solid 12rpx transparent;
        left: 50%;
        top: -12rpx;
        margin-left: -12rpx;
    }

    .uni-combox__selector-empty,
    .uni-combox__selector-item {
        /* #ifdef APP-NVUE */
        display: flex;
        /* #endif */
        line-height: 84rpx;
        height: 84rpx;
        font-size: 28rpx;
        text-align: center;
        border-bottom: solid 1px #DDDDDD;
        margin: 0 20rpx;
    }

    .uni-combox__selector-empty:last-child,
    .uni-combox__selector-item:last-child {
        border-bottom: none;
    }
</style>
