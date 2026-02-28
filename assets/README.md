# 微信表情包素材替换指南（真实堆叠版）

## 游戏特色
- **真实堆叠效果**: 每个位置的牌堆采用不规则偏移，营造真实的麻将堆叠感
- **部分露出机制**: 下层牌会露出边缘，玩家可以预判下面的牌内容
- **策略深度**: 可以提前规划移牌顺序，增加游戏策略性
- **动态反面**: 30%概率顶层牌为反面，新露出的牌也有30%概率反面

## 堆叠视觉效果说明
- **随机偏移**: 每个位置的牌堆都有独特的随机偏移模式
- **透明度渐变**: 底层牌透明度较低，顶层牌完全不透明
- **旋转效果**: 牌堆有轻微旋转，增加真实感
- **点击区域**: 只有顶层牌可以点击，下层牌不可交互但可见

## 素材准备

### 1. 表情包要求
- **数量**: 60种不同的表情
- **尺寸**: 推荐80x80px（匹配CSS中的card-stack尺寸）
- **格式**: PNG（支持透明背景）
- **命名**: emoji_01.png 到 emoji_60.png

### 2. 文件结构
```
assets/
├── emoji_01.png
├── emoji_02.png
├── ...
└── emoji_60.png
```

### 3. 代码修改

在 `game.js` 中找到：

```javascript
// 微信表情包Unicode映射（60种）
this.emojis = [
    '😀', '😂', '😍', '🥰', '😎', '🤩', '🥳', '😭', '😡', '🤯',
    // ... 共60个emoji
];
```

**替换为：**

```javascript
// 微信表情包图片路径（60种）
this.emojiImages = [
    'assets/emoji_01.png', 'assets/emoji_02.png', 'assets/emoji_03.png',
    // ... 继续添加到 emoji_60.png
];
```

在 `createBoard()` 函数中，将：

```javascript
cards.push({
    emoji: this.emojis[i],
    faceUp: true,
    matched: false
});
```

**替换为：**

```javascript
cards.push({
    emojiImage: this.emojiImages[i],
    emoji: this.emojis[i], // 保留emoji用于手牌区显示
    faceUp: true,
    matched: false
});
```

在 `renderBoard()` 函数中，将：

```javascript
if (card.faceUp) {
    cardElement.textContent = card.emoji;
}
```

**替换为：**

```javascript
if (card.faceUp) {
    const img = document.createElement('img');
    img.src = card.emojiImage;
    img.style.width = '40px';
    img.style.height = '40px';
    img.style.objectFit = 'contain';
    cardElement.appendChild(img);
}
```

## 堆叠机制优势
- **可视化策略**: 玩家可以看到下面的牌，可以制定更优的移牌策略
- **降低挫败感**: 不再是完全盲目的移牌，增加了可控性
- **真实体验**: 模拟真实的麻将或纸牌堆叠效果
- **美观性**: 不规则偏移让界面更加生动有趣

## 注意事项
- **性能考虑**: 堆叠效果会增加DOM元素数量，确保设备性能足够
- **移动端适配**: 在小屏幕上可能需要调整牌的尺寸
- **版权问题**: 建议使用开源或自创表情包避免版权纠纷

## 测试建议
1. 先用少量表情包测试堆叠效果
2. 确认下层牌的可见性和点击区域正确
3. 测试不同堆叠深度的显示效果
4. 验证游戏逻辑是否正常工作