<!--
  详情信息卡
  props: cardData 信息模块数据
  $emit: handle-confirm 确认操作
  $emit: handle-cancel 取消操作
-->
<template>
  <div
    class="rock-info-card"
    :class="{ isRightImg: cardData.rightImg && cardData.rightImg !== '' }"
  >
    <h3 class="rock-info-card-title">{{ cardData.title }}</h3>
    <div
      v-if="cardData.rightImg && cardData.rightImg !== ''"
      class="right-image"
    >
      <el-image
        style="max-width: 100px;height: 100px"
        :src="cardData.rightImg"
        :preview-src-list="[cardData.rightImg]"
      />
    </div>
    <div
      v-for="(item, index) in cardData.data"
      :key="index"
      class="rock-info-card-list"
    >
      <div v-if="item.type === 'text'">
        <span v-if="item.label && item.label !== ''" class="title">
          {{ item.label }}:
        </span>
        {{ item.value }}
        <span v-if="item.icon && item.icon !== ''" class="icon">
          <i :class="item.icon_class" />
        </span>
        <span v-if="item.button_txt && item.button_txt !== ''" class="button">
          <el-button :type="item.button_type" plain>{{ item.button_txt }}</el-button>
        </span>
      </div>
      <div v-if="item.type === 'link'">
        <span v-if="item.label && item.label !== ''" class="title">
          {{ item.label }}:
        </span>
        <a :href="item.value">{{ item.value }}</a>
      </div>
      <div v-if="item.type === 'image'">
        <span v-if="item.label && item.label !== ''" class="title">
          {{ item.label }}:
        </span>
        <el-image
          v-for="(img, imgIndex) in item.value"
          :key="imgIndex"
          style="width: 150px"
          :src="img"
          :preview-src-list="item.value"
        />
      </div>
      <div v-if="item.type === 'table'">
        <span v-if="item.label && item.label !== ''" class="title">
          {{ item.label }}:
        </span>
        <div class="table-inner">
          <table class="rock-table" border="1">
            <tr v-for="(trData, trIndex) in item.value" :key="trIndex">
              <td v-for="(tdData, tdIndex) in trData" :key="tdIndex">
                {{ tdData }}
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  props: {
    cardData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      list: []
    }
  }
}
</script>

<style lang="less">
@import 'index.less';
</style>
