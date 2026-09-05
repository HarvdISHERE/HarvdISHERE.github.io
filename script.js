// querySelectorAll returns a NodeList containing every element that matches the CSS selector.
// 这里获取所有筛选按钮和作品卡片，后面会分别处理它们。
const filterButtons = document.querySelectorAll(".filters-button");
const workCards = document.querySelectorAll(".work-card");

// forEach visits each button one by one and adds the same click behavior.
// 给每个筛选按钮绑定点击事件。
filterButtons.forEach((button) => {
  // The function runs only after this button is clicked by the user.
  // 事件函数中的 button 就是当前被点击的按钮。
  button.addEventListener("click", () => {
    // data-filter="game" can be read in JavaScript as button.dataset.filter.
    // 读取按钮上的 data-filter 属性，例如 all、research 或 game。
    const filter = button.dataset.filter;

    // First remove the active class from every button.
    // 先清除所有按钮的选中样式，避免多个按钮同时显示为选中。
    filterButtons.forEach((item) => item.classList.remove("is-active"));

    // Then add the active class only to the button that was clicked.
    // 再给当前按钮添加选中样式。
    button.classList.add("is-active");

    // aria-pressed tells screen readers whether each button is selected.
    // 同步更新无障碍属性，让辅助技术知道哪个筛选条件正在使用。
    filterButtons.forEach((item) => {
      item.setAttribute("aria-pressed", item === button ? "true" : "false");
    });

    // Check every card and compare its data-category with the selected filter.
    // 如果分类匹配就显示，不匹配就隐藏。
    workCards.forEach((card) => {
      // The "all" filter is special: it matches every card.
      // 选择 all 时不需要比较分类，所有卡片都应该显示。
      const isMatch = filter === "all" || card.dataset.category === filter;

      // hidden=true is equivalent to adding the HTML hidden attribute.
      // 浏览器会自动隐藏 hidden 为 true 的元素。
      card.hidden = !isMatch;
    });
  });
});
