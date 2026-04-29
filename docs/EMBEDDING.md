# 主站嵌入方案

提供两种方式接入LuxReal主站，按场景任选。

---

## 方案 A · 链接跳转（推荐）

最简单、体验最好。在主站导航 / 首页 banner 放一个入口：

```html
<a href="https://feedback.luxreal.com/" target="_blank" rel="noopener">
  反馈广场
</a>
```

或主 CTA：

```html
<a href="https://feedback.luxreal.com/?submit=1" target="_blank" rel="noopener">
  提交需求
</a>
```

`?submit=1` 会自动打开"提交想法"弹窗。

---

## 方案 B · iframe 内嵌

适合想把反馈页直接嵌入主站某一个 Tab/页面的场景。

### B.1 基本嵌入

```html
<iframe
  src="https://feedback.luxreal.com/?embed=1"
  style="width:100%; height:100vh; border:0; background:transparent;"
  loading="lazy"
  referrerpolicy="strict-origin-when-cross-origin"
  allow="clipboard-write"
></iframe>
```

`?embed=1` 会让前端：

- 隐藏顶部品牌 Header（避免与主站 Header 重复）
- 隐藏 Hero Banner
- body 背景透明，融入主站背景

### B.2 自适应高度（可选）

如果不想用固定 `100vh`，可让子页通过 `postMessage` 通知父页内容高度：

子页（已留好接入点，如需启用，编辑 `app/layout.tsx` 加一段，参见 README）。父页接收：

```html
<iframe id="dy-feedback" src="..." style="width:100%; border:0;"></iframe>
<script>
  window.addEventListener("message", (e) => {
    if (e.origin !== "https://feedback.luxreal.com") return;
    if (e.data?.type === "luxreal-feedback:resize") {
      document.getElementById("dy-feedback").style.height = e.data.height + "px";
    }
  });
</script>
```

> 默认未启用 `postMessage`，按需开启即可。

### B.3 注意事项

- iframe 内打开"提交想法"弹窗会被限制在 iframe 范围内显示，移动端体验略受限。流量若以移动端为主，建议方案 A。
- `ALLOWED_ORIGINS` 需要包含主站域名，否则提交/投票会被拒。

---

## 方案 C · 仅入口卡片（轻量）

如果暂时不想给反馈广场单独导航位，可用一个轻量卡片：

```html
<a class="feedback-card" href="https://feedback.luxreal.com/">
  <h4>有什么想法？</h4>
  <p>提交你的需求，与社区一起决定LuxReal的下一步</p>
  <span>前往反馈广场 →</span>
</a>
```

样式自由发挥，与主站风格协调即可。
