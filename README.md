# 개요
특정 영역에 있는 relative, absolute, fixed 요소를 움직여
margin-left, margin-top 값을 추출후
positionStyleFilePath로 전달한 파일에 덮어 쓴다.

# 설치
`npm i kit-position-debug-tool`

# 사용법 
## 옵션
```ts
type KitDebugOptions {
  targetSelector: string[]; // 디버깅 대상 Wrapper
  background: string; // 디버깅용 백그라운드
  excludeTargetSelector: string[]; // 디버깅 대상에서 제외할 요소
  positionStyleFilePath: string;  // 포지션 내용이 저장될 파일의 위치
  isMobile: boolean; // 모바일 여부
}
```

## 메서드
```js
// 디버깅 옵션 변경
updateOptions = (newOptions: Partial<KitDebugOptions>) => void
```


# 적용 예시 (vue.config.js 기준)
## devserve 미들웨어 추가 (positionStyleFilePath 파일 덮어쓰기용 (없어도 됨))
```js
// vue.config.js
const kitPositionDebugTool_middlewares = require('kit-position-debug-tool/middleware');

module.exports = defineConfig({
	devServer: {
		setupMiddlewares: kitPositionDebugTool_middlewares,
  }
})
```

## debugTool 적용
```js
// main.js
export let debugTool;

if (process.env.NODE_ENV === "development") {
	debugTool = kitPositionDebugTool({
		excludeTargetSelector: [".kit-page__bg", ".kit__copyright", ".kit-video__spinner", ".kit-page__section"],
	});
}
```

## 섹션별로 debugTool 적용
```vue
// TheSection1.vue

<script setup>
import { debugTool } from "@/main";

enterEnd() {
  debugTool && debugTool.updateOptions({
    background: `${kitStore.assetsPath}/main/debug.png`,
    targetSelector: ['.section1'],
    extraTargetSelectors: [],
    positionStyleFilePath: `src/components/TheSection1_position.scss`,
  })
},
</script>

<style>
  @use "./TheSection1_position.scss" as *;
</style>
```

