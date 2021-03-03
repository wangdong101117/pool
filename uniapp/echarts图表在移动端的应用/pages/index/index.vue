<template>
	<view class="content">
		<view style="height: 750rpx;width: 750rpx;margin-bottom: 36rpx;">
			<basicline v-if="type=='basicline'"></basicline>
			<bar10 v-if="type=='bar10'"></bar10>
			<stackedArea v-if="type=='stackedArea'"></stackedArea>
			<rainfall v-if="type=='rainfall'"></rainfall>
			<shareDataset v-if="type=='shareDataset'"></shareDataset>
			<basicbar v-if="type=='basicbar'"></basicbar>
			<jianbianbar v-if="type=='jianbianbar'"></jianbianbar>
			<cardark v-if="type=='cardark'"></cardark>
			<chinamap v-if="type=='chinamap'"></chinamap>
		</view>
		<view>
			<button class="mini-btn" type="primary" plain="true" size="mini" v-for="(item ,index) in types" @click="changeType(item)">{{item}}</button>
		</view>
		
	</view>
</template>

<script>
	let myChart
	export default {
		data : function(){
		  return {
		    type:'chinamap',
			types:['basicline','bar10','stackedArea','rainfall','shareDataset','basicbar','jianbianbar','cardark','chinamap'],
		  }
		},
		mounted() {
			
		},
		
		
		methods: {
			changeType(e) {
				this.type = e;
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 20px;
		background-color: #fff;
	}
	.mini-btn {
		margin-right: 10rpx;
	}
</style>
