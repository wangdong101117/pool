<!-- 自己封装的 翻译字典表 组件: 
    说明: 字典表:
        例如: 男用0表示  女用1表示 未说明性别用2表示, 当服务端返回的代表性别的数据为1时, 需要展示为 女
-->
<template>
    <text>
        {{codeName}}
    </text>
</template>

<script>
    import mixin from '@/common/mixin.js'
    export default {
        props: {
             codeType: {
                 type: String,
                 default: ''
             },
             codeValue: {
                 type: String,
                 default: ''
             }   
        },
        mixins: [mixin],
        data () {
            return {
                codeDates: [],
                codeName: ''     
            }
        },
        watch: {
            codeValue: {
                handler: function (newV, oldV) {
                    // console.log(newV)
                    if (newV !== '') {
                        this.getText()
                    }
                },
                immediate: true
            },
            codeName: {
                handler: function (newV, oldV) {
                    if (newV == '' && this.codeValue !== '') {
                        this.getText()
                    }
                },
                immediate: true
            }
        },
        methods: {
            getText() {
                if (getApp().globalData[this.codeType] && getApp().globalData[this.codeType].length > 0) {
                    let codeData = getApp().globalData[this.codeType]
                    codeData.forEach((item, index) => {
                        if (item.codeValue === this.codeValue) {
                            this.codeName = item.codeName
                        }
                    })
                } else {
                    uni.request({
                        url: `${this.api}tag.service?txn-code=option.ajson&option-name=${this.codeType}`,
                        // #ifdef MP-WEIXIN
                        header: getApp().globalData.header,
                        // #endif
                        data: '',
                        method: 'GET',
                        dataType: 'json',
                        success: (res) => {
                            let codeDatas = res.data.codeDatas 
                            codeDatas.forEach((item, index) => {
                                if (item.codeValue === this.codeValue) {
                                    this.codeName = item.codeName
                                }
                            })
                            this.$set(getApp().globalData, this.codeType, codeDatas)
                            // uni.setStorageSync(this.codeType, codeDatas)
                        }
                    })
                }
            }
        }
    }
</script>

<style>
</style>
